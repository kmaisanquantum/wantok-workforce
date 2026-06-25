const AdminController = require('./backend/src/admin/controllers/admin_controller');
const UserModel = require('./backend/src/auth/models/user_model');

// Simple mock for the response object
const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

// Mock UserModel and Pool
const mockPool = {
  query: async (sql, params) => {
    console.log('SQL:', sql);
    console.log('Params:', params);
    return { rows: [] };
  }
};
UserModel.getPool = () => mockPool;

async function test() {
  console.log('--- Testing Provider Filter ---');
  const reqProvider = { query: { role: 'Service Providers' } };
  const resProvider = mockRes();
  await AdminController.getAllUsers(reqProvider, resProvider);

  console.log('\n--- Testing Dashboard Metrics ---');
  const resStats = mockRes();
  // Dashboard metrics are fetched via getDashboardMetrics
  await AdminController.getDashboardMetrics({}, resStats);
}

test().catch(console.error);
