const bcrypt = require('bcrypt');
const UserModel = require('../../auth/models/user_model');
const redisClient = require('../../../db/redis_init');

class AdminController {
  static async getDashboardMetrics(req, res) {
    try {
      let metrics = null;
      let needsSync = false;

      if (redisClient) {
        try {
          const stats = await redisClient.mget(
            'metrics:total_customers',
            'metrics:total_providers',
            'metrics:completed_matches'
          );

          if (stats && stats[0] !== null) {
            const customers = parseInt(stats[0] || 0);
            const providers = parseInt(stats[1] || 0);
            const matches = parseInt(stats[2] || 0);

            if (customers < 0 || providers < 0 || matches < 0) {
              needsSync = true;
            } else {
              return res.status(200).json({
                success: true,
                data: { totalCustomers: customers, totalProviders: providers, totalMatches: matches }
              });
            }
          } else {
            needsSync = true;
          }
        } catch (redisErr) {
          needsSync = true;
        }
      } else {
        needsSync = true;
      }

      if (needsSync) {
        const query = `
          SELECT
            (SELECT COUNT(*)::INT FROM users u WHERE u.role = 'customer'::account_role OR (u.role = 'mixed'::account_role AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'customer'::account_role))) as "totalCustomers",
            (SELECT COUNT(*)::INT FROM users u WHERE u.role = 'provider'::account_role OR EXISTS (SELECT 1 FROM provider_profiles p WHERE p.user_id = u.id)) as "totalProviders",
            (SELECT COUNT(*)::INT FROM bookings WHERE status = 'completed') as "totalMatches"
        `;
        const { rows } = await UserModel.getPool().query(query);
        metrics = rows[0] || { totalCustomers: 0, totalProviders: 0, totalMatches: 0 };

        if (redisClient) {
            try {
                await redisClient.pipeline()
                    .set('metrics:total_customers', metrics.totalCustomers)
                    .set('metrics:total_providers', metrics.totalProviders)
                    .set('metrics:completed_matches', metrics.totalMatches)
                    .exec();
            } catch (syncErr) {}
        }
      }

      return res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ Admin Dashboard Metrics Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard metrics',
        data: { totalCustomers: 0, totalProviders: 0, totalMatches: 0 }
      });
    }
  }

  static async getStats(req, res) {
    return AdminController.getDashboardMetrics(req, res);
  }

  static async getInternalSetting(key, defaultValue = null) {
    try {
      const { rows } = await UserModel.getPool().query('SELECT value FROM system_settings WHERE key = $1', [key]);
      return rows.length > 0 ? rows[0].value : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  }

  static async getSystemLedgerStats(req, res) {
    try {
      const query = `
        SELECT
          COALESCE(SUM(price) FILTER (WHERE payout_status = 'escrowed'), 0)::DECIMAL as "totalEscrowCapital",
          COALESCE(SUM(price) FILTER (WHERE payout_status = 'disbursed'), 0)::DECIMAL as "totalDisbursements",
          COALESCE(SUM(platform_fee), 0)::DECIMAL as "totalRevenue"
        FROM bookings
      `;
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      console.error('❌ Admin Ledger Stats Error:', error);
      return res.status(500).json({ error: 'Failed to fetch ledger stats' });
    }
  }

  static async getDisputedJobs(req, res) {
    try {
      const query = `
        SELECT b.*, c.name as customer_name, p.name as provider_name
        FROM bookings b
        LEFT JOIN users c ON b.customer_id = c.id
        LEFT JOIN users p ON b.provider_id = p.id
        WHERE b.status = 'disputed'
        ORDER BY b.updated_at DESC
      `;
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error('❌ Admin Disputed Jobs Error:', error);
      return res.status(500).json({ error: 'Failed to fetch disputed jobs' });
    }
  }

  static async releasePayout(req, res) {
    let client;
    try {
      const { bookingId } = req.params;
      client = await UserModel.getPool().connect();
      await client.query('BEGIN');

      const query = `
        UPDATE bookings
        SET status = 'completed', payout_status = 'disbursed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;
      const { rows } = await client.query(query, [bookingId]);

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Booking not found' });
      }

      await client.query(`
        INSERT INTO audit_logs (level, action)
        VALUES ('SEC', 'Administrative payout release for booking ' || $1)
      `, [bookingId]);

      await client.query('COMMIT');
      return res.status(200).json({ success: true, message: 'Payout released successfully' });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Failed to release payout' });
    } finally {
      if (client) client.release();
    }
  }

  static async refundEscrow(req, res) {
    let client;
    try {
      const { bookingId } = req.params;
      client = await UserModel.getPool().connect();
      await client.query('BEGIN');

      const query = `
        UPDATE bookings
        SET status = 'cancelled', payout_status = 'refunded', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;
      const { rows } = await client.query(query, [bookingId]);

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Booking not found' });
      }

      await client.query(`
        INSERT INTO audit_logs (level, action)
        VALUES ('SEC', 'Administrative escrow refund for booking ' || $1)
      `, [bookingId]);

      await client.query('COMMIT');
      return res.status(200).json({ success: true, message: 'Escrow refunded successfully' });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Failed to refund escrow' });
    } finally {
      if (client) client.release();
    }
  }

  static async forceSyncUsers(req, res) {
    try {
      const query = `
        SELECT
          (SELECT COUNT(*)::INT FROM users u WHERE u.role = 'customer'::account_role OR (u.role = 'mixed'::account_role AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'customer'::account_role))) as "totalCustomers",
          (SELECT COUNT(*)::INT FROM users u WHERE u.role = 'provider'::account_role OR EXISTS (SELECT 1 FROM provider_profiles p WHERE p.user_id = u.id)) as "totalProviders",
          (SELECT COUNT(*)::INT FROM bookings WHERE status = 'completed') as "totalMatches"
      `;
      const { rows } = await UserModel.getPool().query(query);
      const metrics = rows[0];

      if (redisClient) {
        await redisClient.pipeline()
          .set('metrics:total_customers', metrics.totalCustomers)
          .set('metrics:total_providers', metrics.totalProviders)
          .set('metrics:completed_matches', metrics.totalMatches)
          .exec();
      }

      return res.status(200).json({ success: true, message: "Metrics synchronized", data: metrics });
    } catch (error) {
      return res.status(500).json({ error: "Failed to force sync" });
    }
  }

  static async getAllUsers(req, res) {
    try {
      let { role, search } = req.query;
      let dbRole = (role || 'all').toLowerCase().trim();

      if (dbRole === 'service providers' || dbRole === 'providers') dbRole = 'provider';
      if (dbRole === 'customers') dbRole = 'customer';
      if (dbRole === 'admins') dbRole = 'admin';

      let query = '';
      const queryParams = [];

      if (dbRole === 'customer') {
        query = `
          SELECT u.*,
                 COALESCE(ARRAY(SELECT role_name::TEXT FROM user_roles WHERE user_id = u.id), ARRAY[]::TEXT[]) as roles
          FROM users u
          WHERE u.role = 'customer'::account_role
             OR (u.role = 'mixed'::account_role AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'customer'::account_role))
        `;
      } else if (dbRole === 'provider') {
        query = `
          SELECT u.*,
                 COALESCE(ARRAY(SELECT role_name::TEXT FROM user_roles WHERE user_id = u.id), ARRAY[]::TEXT[]) as roles
          FROM users u
          WHERE u.role = 'provider'::account_role
             OR EXISTS (
                 SELECT 1
                 FROM provider_profiles p
                 WHERE p.user_id = u.id
             )
        `;
      } else if (dbRole === 'admin') {
        query = `
          SELECT id, name, email, phone_number as phone, status, role, created_at,
                 ARRAY['admin']::TEXT[] as roles
          FROM users
          WHERE role = 'admin'::account_role
        `;
      } else {
        query = `
          SELECT u.*,
                 COALESCE(ARRAY(SELECT role_name::TEXT FROM user_roles WHERE user_id = u.id), ARRAY[]::TEXT[]) as roles
          FROM users u
          WHERE u.role IN ('customer'::account_role, 'provider'::account_role, 'mixed'::account_role)
        `;
      }

      if (search) {
        queryParams.push("%" + search + "%");
        query += ` AND (name ILIKE $1 OR email ILIKE $1 OR phone_number ILIKE $1)`;
      }

      query += " ORDER BY created_at DESC";

      const { rows } = await UserModel.getPool().query(query, queryParams);
      return res.status(200).json({ success: true, users: rows });
    } catch (error) {
      console.error('❌ Admin Get Users Error:', error);
      return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  }

  static async getPendingProviders(req, res) {
    try {
      const query = "SELECT id, name, email, phone_number, created_at, status FROM users WHERE role = 'provider' AND status = 'pending_verification' ORDER BY created_at DESC";
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch pending providers' });
    }
  }

  static async approveProvider(req, res) {
    try {
      const { providerId } = req.params;
      const query = "UPDATE users SET status = 'active', is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id";
      const { rows } = await UserModel.getPool().query(query, [providerId]);
      if (rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
      return res.status(200).json({ success: true, message: 'Provider approved successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to approve provider' });
    }
  }

  static async flagUser(req, res) {
    try {
      const { userId } = req.params;
      const { isFlagged } = req.body;
      const query = "UPDATE users SET is_flagged = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id";
      await UserModel.getPool().query(query, [isFlagged, userId]);
      return res.status(200).json({ success: true, message: 'User flagging status updated' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user flag status' });
    }
  }

  static async createUser(req, res) {
    let client;
    try {
      const { name, email, phone_number, password, role } = req.body;
      const passwordHash = await bcrypt.hash(password || 'Wantok2024!', 12);
      client = await UserModel.getPool().connect();
      await client.query('BEGIN');
      const { rows } = await client.query('INSERT INTO users (name, email, phone_number, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id', [name, email, phone_number, passwordHash, role]);
      await client.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)', [rows[0].id, role]);
      await client.query('COMMIT');
      return res.status(201).json({ message: 'User created successfully', userId: rows[0].id });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Failed to create user' });
    } finally {
      if (client) client.release();
    }
  }

  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { name, email, phone_number, role } = req.body;
      const query = "UPDATE users SET name = $1, email = $2, phone_number = $3, role = $4 WHERE id = $5 RETURNING id";
      const { rows } = await UserModel.getPool().query(query, [name, email, phone_number, role, userId]);
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      await UserModel.getPool().query('DELETE FROM users WHERE id = $1', [userId]);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  static async getQueue(req, res) {
    try {
      const query = 'SELECT b.*, c.name as customer_name, p.name as provider_name FROM bookings b LEFT JOIN users c ON b.customer_id = c.id LEFT JOIN users p ON b.provider_id = p.id ORDER BY b.created_at DESC';
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch queue' });
    }
  }

  static async overrideQueue(req, res) {
    try {
      const { matchId, action } = req.body;
      let newStatus = action === 'force_complete' ? 'completed' : 'cancelled';
      await UserModel.getPool().query('UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, matchId]);
      return res.status(200).json({ success: true, message: "Queue updated" });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to override queue' });
    }
  }

  static async getSettings(req, res) {
    try {
      const { rows } = await UserModel.getPool().query('SELECT key, value, group_category FROM system_settings');
      return res.status(200).json({ success: true, settings: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  static async updateSettings(req, res) {
    try {
      const { settings } = req.body;
      for (const [k, v] of Object.entries(settings)) {
        await UserModel.getPool().query('INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [k, String(v)]);
      }
      return res.status(200).json({ success: true, message: 'Settings updated' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  static async updateMatchConfig(req, res) {
    try {
      const { radius, fee } = req.body;
      if (radius) await UserModel.getPool().query('INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', ['match_radius', String(radius)]);
      if (fee) await UserModel.getPool().query('INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', ['platform_fee', String(fee)]);
      return res.status(200).json({ success: true, message: 'Match config updated' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update match config' });
    }
  }

  static async getSystemLogs(req, res) {
    try {
      const { rows } = await UserModel.getPool().query('SELECT id, timestamp, level, action as message FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }

  static async getSystemLogsV2(req, res) {
    return AdminController.getSystemLogs(req, res);
  }
}

module.exports = AdminController;
