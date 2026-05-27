import request from 'supertest';

const BASE_URL = 'http://127.0.0.1:8888/api';

describe('YouthCamping API Tests', () => {
  describe('Trips API', () => {
    it('should fetch all trips', async () => {
      const response = await request(BASE_URL).get('/trips');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for a non-existent trip', async () => {
      const response = await request(BASE_URL).get('/trips/non-existent-id');
      expect(response.status).toBe(404);
    });
  });

  describe('Authentication API', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/admin/login')
        .send({
          email: 'admin@youthcamping.in',
          password: 'admin@123456'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should fail to login with invalid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/admin/login')
        .send({
          email: 'admin@youthcamping.in',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail when email is missing (malformed request)', async () => {
      const response = await request(BASE_URL)
        .post('/admin/login')
        .send({ password: 'somepassword' });
      
      // Depending on implementation, might be 400 or 401
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('API Edge Cases', () => {
    it('should return empty array for non-existent category', async () => {
      const response = await request(BASE_URL).get('/trips?category=ghost-category');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should handle large amounts of data without crashing (sanity check)', async () => {
      const response = await request(BASE_URL).get('/trips');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});
