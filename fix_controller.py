import os
import re

file_path = 'backend/src/admin/controllers/admin_controller.js'
with open(file_path, 'r') as f:
    content = f.read()

new_method = """  static async getAllUsers(req, res) {
    try {
      let { role, search } = req.query;

      // Map frontend filter strings to DB roles
      let dbRole = null;
      const normalizedRole = (role || '').toUpperCase().trim();

      if (normalizedRole === 'SERVICE PROVIDERS' || normalizedRole === 'PROVIDERS') {
        dbRole = 'provider';
      } else if (normalizedRole === 'CUSTOMERS') {
        dbRole = 'customer';
      } else if (normalizedRole === 'ADMINS' || normalizedRole === 'ADMIN') {
        dbRole = 'admin';
      } else if (role && !['ALL ROLES', 'ALL', ''].includes(normalizedRole)) {
        dbRole = role.toLowerCase();
      }

      // Permissive query: Select from users with LEFT JOIN on user_roles to ensure we don't drop rows
      let query = `
        SELECT u.*,
               COALESCE(ARRAY(
                 SELECT DISTINCT role_name::TEXT FROM (
                   SELECT role::TEXT as role_name FROM users WHERE id = u.id
                   UNION
                   SELECT role_name::TEXT FROM user_roles WHERE user_id = u.id
                 ) sub
                 WHERE role_name IS NOT NULL AND role_name::TEXT NOT IN ('null', 'undefined', '')
               ), ARRAY[]::TEXT[]) as roles
        FROM users u
        WHERE 1=1
      `;
      const queryParams = [];

      if (dbRole) {
        queryParams.push(dbRole);
        query += " AND (u.role::text = $" + queryParams.length + " OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = $" + queryParams.length + "))";
      }

      if (search) {
        queryParams.push("%" + search + "%");
        query += " AND (u.name ILIKE $" + queryParams.length + " OR u.email ILIKE $" + queryParams.length + " OR u.phone_number ILIKE $" + queryParams.length + ")";
      }

      query += " ORDER BY u.created_at DESC";

      console.log(`🔍 Admin SQL: Executing User List Query (Role Filter: ${role || 'None'})`);
      const { rows } = await UserModel.getPool().query(query, queryParams);
      console.log(`✅ Admin: Successfully retrieved ${rows.length} users.`);

      return res.status(200).json({
        success: true,
        users: rows
      });
    } catch (error) {
      console.error('❌ Admin Get Users Error:', error);
      return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  }"""

start_marker = r'static async getAllUsers\(req, res\) \{'
end_marker = r'static async forceSyncUsers\(req, res\) \{'

start_match = re.search(start_marker, content)
end_match = re.search(end_marker, content)

if start_match and end_match:
    new_content = content[:start_match.start()] + new_method + "\n\n  " + content[end_match.start():]
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("Successfully fixed controller using python")
else:
    print("Markers not found")
