process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('User Routes Tests', () => {
  let superadminToken, mdToken;
  let insertedUsers;

  beforeEach(async () => {
    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users with unique emails
    const users = [
      { name: 'Super Admin', email: 'superadmin@test.com', passwordHash: hashedPassword, role: 'superadmin', isActive: true },
      { name: 'MD', email: 'md@test.com', passwordHash: hashedPassword, role: 'md', isActive: true },
      { name: 'Procurement Officer', email: 'procurement@test.com', passwordHash: hashedPassword, role: 'procurement_officer', isActive: true },
      { name: 'Store Manager', email: 'storemanager@test.com', passwordHash: hashedPassword, role: 'store_manager', isActive: true },
      { name: 'Hotel Manager', email: 'hotelmanager@test.com', passwordHash: hashedPassword, role: 'hotel_manager', hotelId: '507f1f77bcf86cd799439011', isActive: true },
      { name: 'Accounts', email: 'accounts@test.com', passwordHash: hashedPassword, role: 'accounts', isActive: true }
    ];

    insertedUsers = await User.insertMany(users);

    // Create a test vendor
    await Vendor.create({
      name: 'Test Vendor',
      contactPerson: 'Vendor Contact',
      phone: '1234567890',
      email: 'vendor@test.com',
      address: {
        street: 'Vendor Street',
        city: 'Vendor City',
        state: 'Vendor State',
        pincode: '123456',
        country: 'Vendor Country'
      },
      gstNumber: 'GST123456',
      panNumber: 'PAN123456',
      bankDetails: {
        accountNumber: '123456789',
        bankName: 'Vendor Bank',
        ifscCode: 'IFSC123',
        accountHolderName: 'Vendor Holder'
      },
      paymentTerms: '30_days',
      isActive: true,
      createdBy: insertedUsers[0]._id
    });

    // Generate tokens
    superadminToken = jwt.sign({ userId: insertedUsers[0]._id.toString(), role: 'superadmin' }, 'testsecret');
    mdToken = jwt.sign({ userId: insertedUsers[1]._id.toString(), role: 'md' }, 'testsecret');
  });

  describe('GET /users', () => {
    test('SuperAdmin can get all users and vendors', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check that users have valid roles and type
      const validRoles = ['superadmin', 'md', 'procurement_officer', 'store_manager', 'hotel_manager', 'accounts'];
      const userEntities = response.body.data.filter(entity => entity.type === 'user');
      userEntities.forEach(user => {
        expect(validRoles).toContain(user.role);
        expect(user.isActive).toBe(true);
        expect(user).not.toHaveProperty('passwordHash');
        expect(user.type).toBe('user');
      });

      // Check that vendors are included with type 'vendor'
      const vendorEntities = response.body.data.filter(entity => entity.type === 'vendor');
      expect(vendorEntities.length).toBeGreaterThan(0);
      vendorEntities.forEach(vendor => {
        expect(vendor.type).toBe('vendor');
        expect(vendor).toHaveProperty('name');
        expect(vendor).toHaveProperty('email');
      });
    });

    test('Non-superadmin cannot access users list', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${mdToken}`);

      expect(response.status).toBe(403);
    });

    test('Unauthorized access fails', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /users/:id/change-role', () => {
    test('SuperAdmin can change user role', async () => {
      const userId = insertedUsers[1]._id; // MD user

      const response = await request(app)
        .patch(`/users/${userId}/change-role`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ role: 'procurement_officer' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User role updated successfully.');
    });

    test('Invalid role fails', async () => {
      const userId = insertedUsers[1]._id;

      const response = await request(app)
        .patch(`/users/${userId}/change-role`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({ role: 'invalid_role' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid role.');
    });
  });

  describe('DELETE /users/:id', () => {
    test('SuperAdmin can delete user', async () => {
      const userId = insertedUsers[1]._id;

      const response = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully.');
    });
  });
});
