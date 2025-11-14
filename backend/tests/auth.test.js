process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Authentication Tests', () => {
  let superadminToken, mdToken, hotelManagerToken, procurementOfficerToken, storeManagerToken, accountsToken;
  let insertedUsers;

  beforeEach(async () => {
    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users with unique emails
    const users = [
      { name: 'Super Admin', email: 'superadmin@test.com', passwordHash: hashedPassword, role: 'superadmin', isActive: true },
      { name: 'MD', email: 'md@test.com', passwordHash: hashedPassword, role: 'md', isActive: true },
      { name: 'Hotel Manager', email: 'hotelmanager@test.com', passwordHash: hashedPassword, role: 'hotel_manager', hotelId: '507f1f77bcf86cd799439011', isActive: true },
      { name: 'Procurement Officer', email: 'procurement@test.com', passwordHash: hashedPassword, role: 'procurement_officer', isActive: true },
      { name: 'Store Manager', email: 'storemanager@test.com', passwordHash: hashedPassword, role: 'store_manager', isActive: true },
      { name: 'Accounts', email: 'accounts@test.com', passwordHash: hashedPassword, role: 'accounts', isActive: true }
    ];

    insertedUsers = await User.insertMany(users);

    // Generate tokens using the same secret as in setup
    superadminToken = jwt.sign({ userId: insertedUsers[0]._id.toString(), role: 'superadmin' }, 'testsecret');
    mdToken = jwt.sign({ userId: insertedUsers[1]._id.toString(), role: 'md' }, 'testsecret');
    hotelManagerToken = jwt.sign({ userId: insertedUsers[2]._id.toString(), role: 'hotel_manager', hotelId: '507f1f77bcf86cd799439011' }, 'testsecret');
    procurementOfficerToken = jwt.sign({ userId: insertedUsers[3]._id.toString(), role: 'procurement_officer' }, 'testsecret');
    storeManagerToken = jwt.sign({ userId: insertedUsers[4]._id.toString(), role: 'store_manager' }, 'testsecret');
    accountsToken = jwt.sign({ userId: insertedUsers[5]._id.toString(), role: 'accounts' }, 'testsecret');
  });

  describe('POST /auth/login', () => {
    test('SuperAdmin login should succeed', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'superadmin@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('superadmin');
    });

    test('MD login should succeed', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'md@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('md');
    });

    test('Hotel Manager login should succeed', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'hotelmanager@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('hotel_manager');
    });

    test('Procurement Officer login should succeed', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'procurement@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('procurement_officer');
    });

    test('Store Manager login should succeed', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'storemanager@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('store_manager');
    });

    test('Accounts login should succeed', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'accounts@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('accounts');
    });

    test('Invalid credentials should fail', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'invalid@test.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials.');
    });
  });

  describe('POST /auth/register', () => {
    test('SuperAdmin can register new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'hotel_manager',
          hotelId: '507f1f77bcf86cd799439011'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully.');
    });

    test('Non-superadmin cannot register user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${mdToken}`)
        .send({
          name: 'Unauthorized User',
          email: 'unauthorized@test.com',
          password: 'password123',
          role: 'hotel_manager'
        });

      expect(response.status).toBe(403);
    });

    test('Register with invalid role should fail', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Invalid Role User',
          email: 'invalidrole@test.com',
          password: 'password123',
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid role.');
    });

    test('Register hotel_manager without hotelId should fail', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'No Hotel User',
          email: 'nohotel@test.com',
          password: 'password123',
          role: 'hotel_manager'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('hotelId is required for hotel_manager.');
    });

    test('Register with existing email should fail', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Duplicate Email',
          email: 'superadmin@test.com', // Existing email
          password: 'password123',
          role: 'md'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists.');
    });
  });

  // Export tokens for other tests
  global.testTokens = {
    superadmin: superadminToken,
    md: mdToken,
    hotelManager: hotelManagerToken,
    procurementOfficer: procurementOfficerToken,
    storeManager: storeManagerToken,
    accounts: accountsToken
  };
});
