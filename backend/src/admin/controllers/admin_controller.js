const UserModel = require('../../auth/models/user_model');
const { pool } = require('../../auth/models/user_model');

class AdminController {
  static async getStats(req, res) {
    try {
      const customerCountResult = await pool.query(
        "SELECT COUNT(*) FROM user_roles WHERE role_name = 'customer'"
      );
      const providerCountResult = await pool.query(
        "SELECT COUNT(*) FROM user_roles WHERE role_name = 'provider'"
      );
      const matchCountResult = await pool.query(
        "SELECT COUNT(*) FROM bookings WHERE status = 'completed'"
      );

      return res.status(200).json({
        totalCustomers: parseInt(customerCountResult.rows[0].count),
        totalProviders: parseInt(providerCountResult.rows[0].count),
        totalMatches: parseInt(matchCountResult.rows[0].count)
      });
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
}

module.exports = AdminController;
