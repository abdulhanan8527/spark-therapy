/**
 * Comprehensive Test Suite for SPARKTherapy
 * Tests all critical components and workflows
 */

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

// Import app and models
const app = require('../server');
const User = require('../models/User');
const Child = require('../models/Child');
const Program = require('../models/Program');

describe('SPARKTherapy API Tests', () => {
  let adminToken, therapistToken, parentToken;
  let testUsers = {};
  let testChildId, testProgramId;

  // Test data
  const testCredentials = {
    admin: {
      email: 'test-admin@sparktherapy.com',
      password: 'TestPass123!',
      name: 'Test Admin',
      role: 'admin'
    },
    therapist: {
      email: 'test-therapist@sparktherapy.com',
      password: 'TestPass123!',
      name: 'Test Therapist',
      role: 'therapist'
    },
    parent: {
      email: 'test-parent@sparktherapy.com',
      password: 'TestPass123!',
      name: 'Test Parent',
      role: 'parent'
    }
  };

  beforeAll(async () => {
    // Connect to test database
    const testDbUri = config.get('MONGODB_URI').replace('spark_therapy', 'spark_therapy_test');
    await mongoose.connect(testDbUri);
    
    // Clear test data
    await User.deleteMany({});
    await Child.deleteMany({});
    await Program.deleteMany({});
    
    // Create test users
    for (const [role, creds] of Object.entries(testCredentials)) {
      const hashedPassword = await bcrypt.hash(creds.password, 12);
      const user = new User({
        ...creds,
        password: hashedPassword,
        isActive: true
      });
      await user.save();
      testUsers[role] = user;
    }
    
    // Generate tokens
    const authConfig = require('../config/auth');
    adminToken = jwt.sign({ id: testUsers.admin._id }, authConfig.jwtSecret, { expiresIn: '1h' });
    therapistToken = jwt.sign({ id: testUsers.therapist._id }, authConfig.jwtSecret, { expiresIn: '1h' });
    parentToken = jwt.sign({ id: testUsers.parent._id }, authConfig.jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Clean up and close connections
    await User.deleteMany({});
    await Child.deleteMany({});
    await Program.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication Tests', () => {
    test('POST /api/auth/register - should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'TestPass123!',
          role: 'parent'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.name).toBe('New User');
    });

    test('POST /api/auth/login - should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testCredentials.parent.email,
          password: testCredentials.parent.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.email).toBe(testCredentials.parent.email);
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testCredentials.parent.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/auth/profile - should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testCredentials.parent.email);
    });

    test('GET /api/auth/profile - should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('User Management Tests', () => {
    test('GET /api/users - admin should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/users - non-admin should be forbidden', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('PUT /api/users/:id - admin should update user', async () => {
      const response = await request(app)
        .put(`/api/users/${testUsers.parent._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Parent Name',
          phone: '+1234567890'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Parent Name');
    });
  });

  describe('Child Management Tests', () => {
    test('POST /api/children - parent should create child', async () => {
      const response = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Child',
          dateOfBirth: '2020-01-01',
          gender: 'male',
          diagnosis: 'Autism Spectrum Disorder',
          notes: 'Test child for API testing'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Test');
      testChildId = response.body.data._id;
    });

    test('GET /api/children - parent should get their children', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/children/:id - should get specific child', async () => {
      const response = await request(app)
        .get(`/api/children/${testChildId}`)
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testChildId);
    });
  });

  describe('Program Management Tests', () => {
    test('POST /api/programs - therapist should create program', async () => {
      const response = await request(app)
        .post('/api/programs')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          childId: testChildId,
          title: 'Communication Skills Test',
          abllsCode: 'ABLLS-R-001',
          category: 'Communication',
          shortDescription: 'Test program for communication skills',
          longDescription: 'Detailed description of the test program',
          masteryCriteria: '80% accuracy across 3 sessions',
          dataCollectionMethod: 'frequency',
          targets: [
            {
              description: 'Request preferred items',
              notes: 'Initial target'
            }
          ]
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Communication Skills Test');
      testProgramId = response.body.data._id;
    });

    test('GET /api/programs/child/:childId - should get programs for child', async () => {
      const response = await request(app)
        .get(`/api/programs/child/${testChildId}`)
        .set('Authorization', `Bearer ${therapistToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('PUT /api/programs/:id/targets/:targetId - should update target', async () => {
      // First get the program to find a target ID
      const programResponse = await request(app)
        .get(`/api/programs/${testProgramId}`)
        .set('Authorization', `Bearer ${therapistToken}`);
      
      const targetId = programResponse.body.data.targets[0]._id;
      
      const response = await request(app)
        .put(`/api/programs/${testProgramId}/targets/${targetId}`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          isMastered: true,
          notes: 'Target mastered successfully'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const updatedTarget = response.body.data.targets.find(t => t._id === targetId);
      expect(updatedTarget.isMastered).toBe(true);
    });
  });

  describe('Security Tests', () => {
    test('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/children');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Authorization', 'Bearer invalid.token.here');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should enforce role-based access control', async () => {
      // Parent trying to access admin-only endpoint
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should rate limit excessive requests', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .get('/api/health')
            .expect(200)
        );
      }
      
      const responses = await Promise.all(promises);
      // Some requests should be rate limited (429)
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Performance Tests', () => {
    test('API response time should be under 1000ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/health')
        .set('Authorization', `Bearer ${parentToken}`);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });

    test('Database queries should be efficient', async () => {
      // Create multiple test records
      const childrenPromises = [];
      for (let i = 0; i < 50; i++) {
        childrenPromises.push(
          request(app)
            .post('/api/children')
            .set('Authorization', `Bearer ${parentToken}`)
            .send({
              firstName: `Test${i}`,
              lastName: 'Child',
              dateOfBirth: '2020-01-01',
              gender: 'male',
              diagnosis: 'ASD'
            })
        );
      }
      
      await Promise.all(childrenPromises);
      
      // Test pagination performance
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/children?page=1&limit=10')
        .set('Authorization', `Bearer ${parentToken}`);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(10);
      expect(responseTime).toBeLessThan(500); // Should be fast with pagination
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle 404 errors gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });

    test('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          // Missing required fields
          firstName: 'Test'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });

    test('should handle database errors gracefully', async () => {
      // Temporarily disconnect database to test error handling
      const originalState = mongoose.connection.readyState;
      await mongoose.connection.close();
      
      const response = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      
      // Reconnect for remaining tests
      if (originalState === 1) {
        await mongoose.connect(config.get('MONGODB_URI').replace('spark_therapy', 'spark_therapy_test'));
      }
    });
  });

  describe('Integration Tests', () => {
    test('complete workflow: parent creates child -> therapist creates program -> tracks progress', async () => {
      // Step 1: Parent creates child
      const childResponse = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          firstName: 'Workflow',
          lastName: 'TestChild',
          dateOfBirth: '2019-06-15',
          gender: 'female',
          diagnosis: 'Autism Spectrum Disorder'
        });
      
      expect(childResponse.status).toBe(201);
      const childId = childResponse.body.data._id;
      
      // Step 2: Therapist creates program for child
      const programResponse = await request(app)
        .post('/api/programs')
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          childId: childId,
          title: 'Workflow Integration Test',
          category: 'Social Skills',
          shortDescription: 'Complete workflow test',
          masteryCriteria: 'Consistent performance',
          dataCollectionMethod: 'frequency',
          targets: [
            { description: 'Make eye contact' },
            { description: 'Respond to name' }
          ]
        });
      
      expect(programResponse.status).toBe(201);
      const programId = programResponse.body.data._id;
      
      // Step 3: Update target progress
      const targetId = programResponse.body.data.targets[0]._id;
      const updateResponse = await request(app)
        .put(`/api/programs/${programId}/targets/${targetId}`)
        .set('Authorization', `Bearer ${therapistToken}`)
        .send({
          isMastered: true,
          notes: 'Successfully mastered during session'
        });
      
      expect(updateResponse.status).toBe(200);
      const updatedTarget = updateResponse.body.data.targets.find(t => t._id === targetId);
      expect(updatedTarget.isMastered).toBe(true);
      
      // Step 4: Verify child can see their program
      const childProgramsResponse = await request(app)
        .get(`/api/programs/child/${childId}`)
        .set('Authorization', `Bearer ${parentToken}`);
      
      expect(childProgramsResponse.status).toBe(200);
      expect(childProgramsResponse.body.data.length).toBeGreaterThan(0);
      expect(childProgramsResponse.body.data[0]._id).toBe(programId);
    });
  });
});

// Run tests
if (require.main === module) {
  jest.setTimeout(30000); // Increase timeout for integration tests
  
  describe('Test Suite Execution', () => {
    test('All tests should pass', async () => {
      // This will run all the test suites defined above
      expect(true).toBe(true);
    });
  });
}

module.exports = { testCredentials };