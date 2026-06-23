const AdminController = require('./backend/src/admin/controllers/admin_controller');
const UserModel = require('./backend/src/auth/models/user_model');

async function test() {
    console.log("Checking AdminController static methods...");
    const methods = Object.getOwnPropertyNames(AdminController).filter(p => typeof AdminController[p] === 'function');
    console.log("Available methods:", methods);

    // Check if UserModel.getPool() is accessible in the context of the controller
    // We won't actually run them since it requires a real DB, but we verify syntax and accessibility
    console.log("UserModel.getPool() exists:", !!UserModel.getPool());
}

test().catch(console.error);
