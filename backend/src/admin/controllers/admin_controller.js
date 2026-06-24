const bcrypt = require('bcrypt');
const UserModel = require('../../auth/models/user_model');
const redisClient = require('../../../db/redis_init');

class AdminController {
  static async getDashboardMetrics(req, res) {
    try {
      // 1. Priority: Attempt to serve from High-speed Redis Counters
      if (redisClient) {
        try {
          const stats = await redisClient.mget(
            'metrics:total_customers',
            'metrics:total_providers',
            'metrics:completed_matches'
          );

          // If Redis has the data (first element is not null), return immediately
          if (stats && stats[0] !== null) {
            console.log('⚡ Redis: Serving real-time dashboard metrics');
            return res.status(200).json({
              success: true,
              data: {
                totalCustomers: parseInt(stats[0] || 0),
                totalProviders: parseInt(stats[1] || 0),
                totalMatches: parseInt(stats[2] || 0)
              }
            });
          }
        } catch (redisErr) {
          // Log and continue to SQL fallback if Redis fails
          console.warn('⚠️ Redis Stats Read Error (Dashboard):', redisErr.message);
        }
      }

      // 2. Fallback & Self-Healing: Aggregate metrics from PostgreSQL users/bookings tables
      console.log('🔄 Fallback: Aggregating metrics from PostgreSQL for accuracy');
      const query = `
        SELECT
          (SELECT COUNT(*)::INT FROM users WHERE role = 'customer') as "totalCustomers",
          (SELECT COUNT(*)::INT FROM users WHERE role = 'provider') as "totalProviders",
          (SELECT COUNT(*)::INT FROM bookings WHERE status = 'completed') as "totalMatches"
      `;
      const { rows } = await UserModel.getPool().query(query);

      const metrics = rows[0] || { totalCustomers: 0, totalProviders: 0, totalMatches: 0 };

      // 3. Sync Redis state if possible (Silent fail if Redis is down)
      if (redisClient) {
          try {
              await redisClient.pipeline()
                  .set('metrics:total_customers', metrics.totalCustomers)
                  .set('metrics:total_providers', metrics.totalProviders)
                  .set('metrics:completed_matches', metrics.totalMatches)
                  .exec();
              console.log('✅ Redis: Metrics synchronized from SQL truth');
          } catch (syncErr) {
              console.warn('⚠️ Redis Sync Error during dashboard fallback:', syncErr.message);
          }
      }

      return res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ Admin Dashboard Metrics Critical Error:', error);
      // Ensure the dashboard doesn't crash even if both fail (though SQL should be stable)
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

  static async getPendingProviders(req, res) {
    try {
      const query = "SELECT id, name, email, phone_number, created_at, status FROM users WHERE role = 'provider' AND status = 'pending_verification' ORDER BY created_at DESC";
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error('❌ Admin Get Pending Error:', error);
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
      console.error('❌ Admin Approve Error:', error);
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
      console.error('❌ Admin Flag Error:', error);
      return res.status(500).json({ error: 'Failed to update user flag status' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { role, search } = req.query;
      let query = `
        SELECT u.*,
               ARRAY(
                 SELECT DISTINCT role_name FROM (
                   SELECT role::TEXT as role_name FROM users WHERE id = u.id
                   UNION
                   SELECT role_name::TEXT FROM user_roles WHERE user_id = u.id
                 ) sub
                 WHERE role_name IS NOT NULL
               ) as roles
        FROM users u
        WHERE 1=1
      `;
      const queryParams = [];

      if (role && role !== 'All Roles') {
        queryParams.push(role.toLowerCase());
        query += ` AND (u.role = $${queryParams.length} OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name = $${queryParams.length}))`;
      }

      if (search) {
        queryParams.push(`%${search}%`);
        query += ` AND (u.name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length} OR u.phone_number ILIKE $${queryParams.length})`;
      }

      query += " ORDER BY u.created_at DESC";

      const { rows } = await UserModel.getPool().query(query, queryParams);
      return res.status(200).json({ users: rows });
    } catch (error) {
      console.error('❌ Admin Get Users Error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async createUser(req, res) {
    let client;
    try {
      const { name, email, phone_number, password, role } = req.body;
      const passwordHash = await bcrypt.hash(password || 'Wantok2024!', 12);

      client = await UserModel.getPool().connect();
      await client.query('BEGIN');

      const userQuery = `
        INSERT INTO users (name, email, phone_number, password_hash, role, active_persona)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const { rows } = await client.query(userQuery, [name, email, phone_number, passwordHash, role, role]);
      const userId = rows[0].id;

      await client.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)', [userId, role]);

      if (redisClient) {
          try {
              await redisClient.incr(role === 'provider' ? 'metrics:total_providers' : 'metrics:total_customers');
          } catch (e) {}
      }

      await client.query('COMMIT');
      return res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('❌ Admin Create User Error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    } finally {
      if (client) client.release();
    }
  }

  static async updateUser(req, res) {
    let client;
    try {
      const { userId } = req.params;
      const { name, email, phone_number, is_verified, is_flagged, status, balance, role } = req.body;

      client = await UserModel.getPool().connect();
      await client.query('BEGIN');

      const fields = [];
      const values = [];
      let idx = 1;

      if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
      if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
      if (phone_number !== undefined) { fields.push(`phone_number = $${idx++}`); values.push(phone_number); }
      if (is_verified !== undefined) { fields.push(`is_verified = $${idx++}`); values.push(is_verified); }
      if (is_flagged !== undefined) { fields.push(`is_flagged = $${idx++}`); values.push(is_flagged); }
      if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
      if (balance !== undefined) { fields.push(`balance = $${idx++}`); values.push(balance); }
      if (role !== undefined) {
        fields.push(`role = $${idx++}`); values.push(role);
        fields.push(`active_persona = $${idx++}`); values.push(role);
      }

      if (fields.length > 0) {
        values.push(userId);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id`;
        const { rows } = await client.query(query, values);
        if (rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'User not found' });
        }
      }

      if (role !== undefined) {
        await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
        await client.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)', [userId, role]);
      }

      await client.query('COMMIT');
      return res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('❌ Admin Update User Error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    } finally {
      if (client) client.release();
    }
  }

  static async deleteUser(req, res) {
    let client;
    try {
      const { userId } = req.params;
      client = await UserModel.getPool().connect();
      await client.query('BEGIN');

      const userRes = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
      const userRole = userRes.rows[0]?.role;

      await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      if (redisClient && userRole) {
        try {
            await redisClient.decr(userRole === 'provider' ? 'metrics:total_providers' : 'metrics:total_customers');
        } catch (e) {}
      }

      await client.query('COMMIT');
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('❌ Admin Delete User Error:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    } finally {
      if (client) client.release();
    }
  }

  static async getQueue(req, res) {
    try {
      const query = `
        SELECT b.id, b.service_type, b.status, b.price, b.scheduled_at, b.created_at,
               c.name as customer_name, p.name as provider_name
        FROM bookings b
        JOIN users c ON b.customer_id = c.id
        LEFT JOIN users p ON b.provider_id = p.id
        ORDER BY b.created_at DESC
      `;
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error('❌ Admin Get Queue Error:', error);
      return res.status(500).json({ error: 'Failed to fetch queue' });
    }
  }

  static async overrideQueue(req, res) {
    try {
      const { matchId, action } = req.body;
      let newStatus;
      if (action === 'force_complete') newStatus = 'completed';
      else if (action === 'cancel') newStatus = 'cancelled';
      else return res.status(400).json({ error: 'Invalid action' });

      const query = 'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id';
      const { rows } = await UserModel.getPool().query(query, [newStatus, matchId]);

      if (rows.length === 0) return res.status(404).json({ error: 'Match/Booking not found' });

      if (newStatus === 'completed' && redisClient) {
        try {
            await redisClient.incr('metrics:completed_matches');
        } catch (e) {}
      }

      return res.status(200).json({ success: true, message: `Queue action ${action} executed successfully` });
    } catch (error) {
      console.error('❌ Admin Queue Override Error:', error);
      return res.status(500).json({ error: 'Failed to execute queue override' });
    }
  }

  static async getSettings(req, res) {
    try {
      const { rows } = await UserModel.getPool().query('SELECT key, value, group_category FROM system_settings');
      return res.status(200).json({ success: true, settings: rows });
    } catch (error) {
      console.error('❌ Admin Get Settings Error:', error);
      return res.status(500).json({ error: 'Failed to fetch system settings' });
    }
  }

  static async updateSettings(req, res) {
    try {
      const { key, value, settings } = req.body;

      if (settings && typeof settings === 'object') {
          for (const [k, v] of Object.entries(settings)) {
              await UserModel.getPool().query(
                'INSERT INTO system_settings (key, value, "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = CURRENT_TIMESTAMP',
                [k, String(v)]
              );
          }
          return res.status(200).json({ success: true, message: 'Settings updated successfully.' });
      }

      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      await UserModel.getPool().query(
        'INSERT INTO system_settings (key, value, "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = CURRENT_TIMESTAMP',
        [key, String(value)]
      );

      return res.status(200).json({ success: true, message: `Setting ${key} updated successfully.` });
    } catch (error) {
      console.error('❌ Admin Update Settings Error:', error);
      return res.status(500).json({ error: 'Failed to update system settings' });
    }
  }

  static async updateMatchConfig(req, res) {
    try {
      const { radius, fee } = req.body;
      const updates = {};
      if (radius !== undefined) updates.match_radius = radius;
      if (fee !== undefined) updates.platform_fee = fee;

      for (const [key, value] of Object.entries(updates)) {
        await UserModel.getPool().query(
          'INSERT INTO system_settings (key, value, group_category, "updatedAt") VALUES ($1, $2, \'engine\', CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = CURRENT_TIMESTAMP',
          [key, String(value)]
        );
      }

      return res.status(200).json({ success: true, message: 'Match engine parameters updated successfully.' });
    } catch (error) {
      console.error('❌ Admin Match Config Error:', error);
      return res.status(500).json({ error: 'Failed to update match configuration' });
    }
  }

  static async getInternalSetting(key, defaultValue) {
    try {
      const { rows } = await UserModel.getPool().query('SELECT value FROM system_settings WHERE key = $1', [key]);
      return rows.length > 0 ? rows[0].value : defaultValue;
    } catch (error) {
      console.error(`❌ Error fetching setting ${key}:`, error);
      return defaultValue;
    }
  }

  static async getSystemLogs(req, res) {
    try {
      const query = 'SELECT id, timestamp, level, action as message FROM audit_logs ORDER BY timestamp DESC LIMIT 100';
      const { rows } = await UserModel.getPool().query(query);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error('❌ getSystemLogs Error:', error);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
}

module.exports = AdminController;
