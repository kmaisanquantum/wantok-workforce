const AdminController = require('./backend/src/admin/controllers/admin_controller');
const UserModel = require('./backend/src/auth/models/user_model');

// Mock UserModel.getPool()
const mockQuery = jest.fn();
UserModel.getPool = jest.fn(() => ({
  query: mockQuery
}));

describe('AdminController.getAllUsers', () => {
  beforeEach(() => {
    mockQuery.mockClear();
    console.log = jest.fn(); // Silence logs
  });

  it('should filter by admin role correctly', async () => {
    const req = { query: { role: 'Admins' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValue({ rows: [] });

    await AdminController.getAllUsers(req, res);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("AND (u.role::text =  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_name::text = ))"),
      ['admin']
    );
  });

  it('should handle All Roles correctly', async () => {
    const req = { query: { role: 'All Roles' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockQuery.mockResolvedValue({ rows: [] });

    await AdminController.getAllUsers(req, res);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.not.stringContaining("AND (u.role::text"),
      []
    );
  });
});
