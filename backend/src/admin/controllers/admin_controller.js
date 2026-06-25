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
            (SELECT COUNT(*)::INT FROM users u WHERE u.role = 'provider'::account_role OR (u.role = 'mixed'::account_role AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'provider'::account_role))) as "totalProviders",
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

  static async getAllUsers(req, res) {
    try {
      let { role, search } = req.query;
      let dbRole = (role || 'all').toLowerCase().trim();

      // Normalized mapping for query parameters
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
             OR (u.role = 'mixed'::account_role AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'provider'::account_role))
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

  static async getSystemLogs(req, res) {
    try {
      const { rows } = await UserModel.getPool().query('SELECT id, timestamp, level, action as message FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
}

module.exports = AdminController;
