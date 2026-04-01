const request = require('supertest');
const app = require('../server');
const { createTables, seedData, cleanup } = require('./setup');

describe('Finance Backend API Tests', () => {
  let adminToken;
  let analystToken;
  let viewerToken;
  let adminUser;
  let analystUser;
  let viewerUser;

  beforeAll(async () => {
    // Ensure tables exist in test database
    await createTables();
    // Seed data
    const users = await seedData();
    adminUser = users.admin;
    analystUser = users.analyst;
    viewerUser = users.viewer;
  });

  beforeAll(async () => {
    // Obtain tokens via login
    const loginAdmin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'test123' });
    adminToken = loginAdmin.body.token;

    const loginAnalyst = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'analyst@test.com', password: 'test123' });
    analystToken = loginAnalyst.body.token;

    const loginViewer = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'viewer@test.com', password: 'test123' });
    viewerToken = loginViewer.body.token;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'newpass',
          role: 'viewer'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('email', 'new@test.com');
      expect(res.body.token).toBeDefined();
    });

    it('should not register with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate',
          email: 'admin@test.com',
          password: 'test123'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Email already exists/i);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: 'test123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: 'wrong' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Dashboard Summary', () => {
    it('should return correct totals for analyst', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.totalIncome).toBe(4000);
      expect(res.body.totalExpenses).toBe(700);
      expect(res.body.netBalance).toBe(3300);
    });

    it('should return zero totals for viewer (no records)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.totalIncome).toBe(0);
      expect(res.body.totalExpenses).toBe(0);
      expect(res.body.netBalance).toBe(0);
    });
  });

  describe('Category Totals', () => {
    it('should return category totals for analyst', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/category-totals')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
      const salary = res.body.find(c => c.category === 'salary');
      const rent = res.body.find(c => c.category === 'rent');
      expect(salary.total).toBe(1000);
      expect(rent.total).toBe(500);
    });
  });

  describe('Recent Activity', () => {
    it('should return recent records', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent?limit=2')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('Trends', () => {
    it('should return monthly trends', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/trends?period=month')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
      const march = res.body.find(t => t.period === '2026-03');
      expect(march.income).toBe(3000);
      expect(march.expense).toBe(0);
      const april = res.body.find(t => t.period === '2026-04');
      expect(april.income).toBe(1000);
      expect(april.expense).toBe(700);
    });
  });

  describe('Financial Records CRUD', () => {
    let recordId;

    it('should allow analyst to create a record', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 200,
          type: 'expense',
          category: 'transport',
          date: '2026-04-03',
          description: 'Uber ride'
        });
      expect(res.statusCode).toBe(201);
      recordId = res.body.id;
      expect(res.body.category).toBe('transport');
    });

    it('should allow analyst to list records', async () => {
      const res = await request(app)
        .get('/api/v1/records?limit=10')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });

    it('should allow analyst to update their own record', async () => {
      const res = await request(app)
        .put(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ description: 'Taxi ride' });
      expect(res.statusCode).toBe(200);
      expect(res.body.description).toBe('Taxi ride');
    });

    it('should not allow viewer to create a record', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 100,
          type: 'income',
          category: 'gift',
          date: '2026-04-04'
        });
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete a record (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(204);

      // Verify it's gone from listing
      const list = await request(app)
        .get('/api/v1/records')
        .set('Authorization', `Bearer ${analystToken}`);
      const found = list.body.data.find(r => r.id === recordId);
      expect(found).toBeUndefined();
    });
  });

  describe('User Management (Admin only)', () => {
    let userIdToDelete;

    it('should allow admin to list users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should allow admin to update a user', async () => {
      const users = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const viewer = users.body.find(u => u.email === 'viewer@test.com');
      expect(viewer).toBeDefined();
      userIdToDelete = viewer.id;

      const res = await request(app)
        .put(`/api/v1/users/${viewer.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'analyst' });
      expect(res.statusCode).toBe(200);
      expect(res.body.role).toBe('analyst');
    });

    it('should allow admin to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(204);
    });
  });
});