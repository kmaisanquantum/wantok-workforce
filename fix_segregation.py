import sys

path = 'backend/src/admin/controllers/admin_controller.js'
with open(path, 'r') as f:
    content = f.read()

search_text = """    static async getAllUsers(req, res) {
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

replace_text = """  static async getAllUsers(req, res) {
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

      // Base query with robust roles array aggregation
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

      // Strict Segregation Logic:
      // If Provider is selected, show everyone with provider role.
      // If Customer is selected, show everyone with customer role EXCEPT those who are also providers.
      if (dbRole === 'provider') {
        query += " AND (u.role::text = 'provider' OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = 'provider'))";
      } else if (dbRole === 'customer') {
        query += " AND (u.role::text = 'customer' OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = 'customer'))";
        query += " AND NOT (u.role::text = 'provider' OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = 'provider'))";
      } else if (dbRole === 'admin') {
        query += " AND (u.role::text = 'admin' OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = 'admin'))";
      } else if (dbRole) {
        queryParams.push(dbRole);
        query += " AND (u.role::text = $" + queryParams.length + " OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = $" + queryParams.length + "))";
      }

      if (search) {
        queryParams.push("%" + search + "%");
        query += " AND (u.name ILIKE $" + queryParams.length + " OR u.email ILIKE $" + queryParams.length + " OR u.phone_number ILIKE $" + queryParams.length + ")";
      }

      query += " ORDER BY u.created_at DESC";

      console.log(`🔍 Admin SQL: Executing User List Query (Strict Mode: ${dbRole || 'All'})`);
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

if search_text in content:
    new_content = content.replace(search_text, replace_text)
    with open(path, 'w') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("SEARCH TEXT NOT FOUND")
