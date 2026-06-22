const { pool } = require('../../auth/models/user_model');
const bcrypt = require('bcrypt');
const redisClient = require('../../../db/redis_init');

class AdminController {
  static async getStats(req, res) {
    try {
      // Priority: High-speed Redis Counters
      if (redisClient) {
        try {
          const stats = await redisClient.mget(
            'metrics:total_customers',
            'metrics:total_providers',
            'metrics:completed_matches'
          );

          if (stats[0] !== null) {
            console.log('⚡ Redis: Serving real-time dashboard metrics');
            return res.status(200).json({
              totalCustomers: parseInt(stats[0] || 0),
              totalProviders: parseInt(stats[1] || 0),
              totalMatches: parseInt(stats[2] || 0)
            });
          }
        } catch (redisErr) {
          console.warn('⚠️ Redis Stats Read Error:', redisErr.message);
        }
      }

      // Fallback: SQL aggregations
      console.log('🔄 Fallback: Aggregating stats from PostgreSQL');
      const customerCountResult = await pool.query(
        "SELECT COUNT(*) FROM user_roles WHERE role_name = 'customer'"
      );
      const providerCountResult = await pool.query(
        "SELECT COUNT(*) FROM user_roles WHERE role_name = 'provider'"
      );
      const matchCountResult = await pool.query(
        "SELECT COUNT(*) FROM bookings WHERE status = 'completed'"
      );

      const dbStats = {
        totalCustomers: parseInt(customerCountResult.rows[0].count),
        totalProviders: parseInt(providerCountResult.rows[0].count),
        totalMatches: parseInt(matchCountResult.rows[0].count)
      };

      // Sync Redis cache for next hit
      if (redisClient) {
        redisClient.set('metrics:total_customers', dbStats.totalCustomers);
        redisClient.set('metrics:total_providers', dbStats.totalProviders);
        redisClient.set('metrics:completed_matches', dbStats.totalMatches);
      }

      return res.status(200).json(dbStats);
    } catch (error) {
      console.error('❌ Admin Stats Error:', error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  static async getPendingProviders(req, res) {
    try {
      const query = `
        SELECT id, name, email, phone_number, primary_skill, created_at
        FROM users
        WHERE is_verified = FALSE AND is_flagged = FALSE
        AND id IN (SELECT user_id FROM user_roles WHERE role_name = 'provider')
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('❌ Admin Pending Providers Error:', error);
      return res.status(500).json({ error: 'Failed to fetch pending providers' });
    }
  }

  static async approveProvider(req, res) {
    try {
      const { providerId } = req.params;
      const query = 'UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING id';
      const { rows } = await pool.query(query, [providerId]);

      if (rows.length === 0) return res.status(404).json({ error: 'Provider not found' });

      return res.status(200).json({ message: 'Provider approved successfully' });
    } catch (error) {
      console.error('❌ Admin Approve Error:', error);
      return res.status(500).json({ error: 'Failed to approve provider' });
    }
  }

  static async flagUser(req, res) {
    try {
      const { userId } = req.params;
      const query = 'UPDATE users SET is_flagged = TRUE WHERE id = $1 RETURNING id';
      const { rows } = await pool.query(query, [userId]);

      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

      return res.status(200).json({ message: 'User flagged successfully' });
    } catch (error) {
      console.error('❌ Admin Flag Error:', error);
      return res.status(500).json({ error: 'Failed to flag user' });
    }
  }

  // New CRUD methods
  static async getAllUsers(req, res) {
    try {
      const { role, search } = req.query;
      let query = `
        SELECT u.id, u.name, u.email, u.phone_number, u.is_verified, u.is_flagged, u.status, u.balance, u.created_at,
               u.primary_skill as trade_type, u.location_name as city_location,
               ARRAY(
                 SELECT DISTINCT role_name FROM (
                   SELECT role::TEXT as role_name FROM users WHERE id = u.id
                   UNION
                   SELECT role_name::TEXT FROM user_roles WHERE user_id = u.id
                 ) sub
               ) as roles
        FROM users u
      `;

      const queryParams = [];
      const filters = [];

      if (role && role !== 'All Roles') {
        const r = role.toLowerCase();
        if (r.includes('provider')) {
          filters.push(`(u.role::TEXT ILIKE '%provider%' OR u.id IN (SELECT user_id FROM user_roles WHERE role_name::TEXT ILIKE '%provider%'))`);
        } else if (r.includes('customer')) {
          filters.push(`(u.role::TEXT ILIKE '%customer%' OR u.id IN (SELECT user_id FROM user_roles WHERE role_name::TEXT ILIKE '%customer%'))`);
        } else if (r.includes('admin')) {
          filters.push(`(u.role::TEXT ILIKE '%admin%' OR u.id IN (SELECT user_id FROM user_roles WHERE role_name::TEXT ILIKE '%admin%'))`);
        }
      }

      if (search) {
        queryParams.push(`%${search}%`);
        filters.push(`(u.name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length} OR u.phone_number ILIKE $${queryParams.length})`);
      }

      if (filters.length > 0) {
        query += ' WHERE ' + filters.join(' AND ');
      }

      query += `
        ORDER BY u.created_at DESC
      `;

      const { rows: usersArray } = await pool.query(query, queryParams);
      return res.status(200).json({ users: Array.isArray(usersArray) ? usersArray : [] });
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

      client = await pool.connect();
      await client.query('BEGIN');

      const userQuery = `
        INSERT INTO users (name, email, phone_number, password_hash, role, active_persona)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const { rows } = await client.query(userQuery, [name, email, phone_number, passwordHash, role, role]);
      const userId = rows[0].id;

      await client.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)', [userId, role]);
      if (redisClient) { await redisClient.incr(role === 'provider' ? 'metrics:total_providers' : 'metrics:total_customers'); }

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

      client = await pool.connect();
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
      client = await pool.connect();
      await client.query('BEGIN');

      await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
      const user = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      if (redisClient && user.rows[0]) {
        await redisClient.decr(user.rows[0].role === 'provider' ? 'metrics:total_providers' : 'metrics:total_customers');
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
      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
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
      const { rows } = await pool.query(query, [newStatus, matchId]);

      if (rows.length === 0) return res.status(404).json({ error: 'Match/Booking not found' });

      // If completed, increment completed matches metric in Redis
      if (newStatus === 'completed' && redisClient) {
        await redisClient.incr('metrics:completed_matches');
      }

      return res.status(200).json({ success: true, message: `Queue action ${action} executed successfully` });
    } catch (error) {
      console.error('❌ Admin Queue Override Error:', error);
      return res.status(500).json({ error: 'Failed to execute queue override' });
    }
  }

  // System Settings
  static async getSettings(req, res) {
    try {
      const { rows } = await pool.query('SELECT key, value FROM system_settings');
      return res.status(200).json({ success: true, settings: rows });
    } catch (error) {
      console.error('❌ Admin Get Settings Error:', error);
      return res.status(500).json({ error: 'Failed to fetch system settings' });
    }
  }

  static async updateSettings(req, res) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      await pool.query(
        'INSERT INTO system_settings (key, value, "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = CURRENT_TIMESTAMP',
        [key, String(value)]
      );

      return res.status(200).json({ success: true, message: `Setting ${key} updated successfully.` });
    } catch (error) {
      console.error('❌ Admin Update Settings Error:', error);
      return res.status(500).json({ error: 'Failed to update system settings' });
    }
  }

  static async getInternalSetting(key, defaultValue) {
    try {
      const { rows } = await pool.query('SELECT value FROM system_settings WHERE key = $1', [key]);
      return rows.length > 0 ? rows[0].value : defaultValue;
    } catch (error) {
      console.error(`❌ Error fetching setting ${key}:`, error);
      return defaultValue;
    }
  }

  static async getSystemLogs(req, res) {
    try {
      const logs = [
        { id: 1, event: 'System Startup', level: 'INFO', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, event: 'DB Connection Established', level: 'INFO', timestamp: new Date(Date.now() - 3500000).toISOString() },
        { id: 3, event: 'Admin Login: admin@dspng.tech', level: 'SEC', timestamp: new Date(Date.now() - 1800000).toISOString() },
        { id: 4, event: 'New Provider Signup: John Doe', level: 'INFO', timestamp: new Date(Date.now() - 900000).toISOString() },
      ];
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }
}

module.exports = AdminController;
