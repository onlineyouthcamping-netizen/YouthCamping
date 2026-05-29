import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../backend/src/app';
import { PrismaClient } from '../../backend/node_modules/@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
let adminToken: string;
let travelerToken: string;
let adminId: string;
let travelerId: string;

describe('Auth API - POST /api/auth/login', () => {
  beforeAll(async () => {
    // Create test admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpass123', salt);
    
    const admin = await prisma.admin.create({
      data: {
        id: 'dev_user',
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        tenantId: 'default'
      }
    });
    adminId = admin.id;

    // Create test traveler
    const traveler = await prisma.user.create({
      data: {
        name: 'Test Traveler',
        email: 'traveler@test.com',
        password: hashedPassword,
        phone: '1234567890',
        role: 'user'
      }
    });
    travelerId = traveler.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.admin.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should login admin with correct credentials', async () => {
    const response = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'admin@test.com',
        password: 'testpass123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.admin.role).toBe('admin');
    adminToken = response.body.data.token;
  });

  it('should login traveler with correct credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'traveler@test.com',
        password: 'testpass123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    travelerToken = response.body.data.token;
  });

  it('should fail with incorrect password', async () => {
    const response = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'admin@test.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
  });
});

describe('Auth API - GET /api/auth/me', () => {
  it('should return current user info with valid token', async () => {
    const response = await request(app)
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role).toBe('admin');
  });

  it('should fail without token', async () => {
    const response = await request(app)
      .get('/api/admin/me');

    expect(response.status).toBe(401);
  });
});

describe('Trips API - GET /api/trips', () => {
  beforeAll(async () => {
    // Cleanup any existing trips to avoid unique slug constraint failure
    await prisma.trip.deleteMany({});
    
    // Create test trip
    await prisma.trip.create({
      data: {
        title: 'Test Trip',
        slug: 'test-trip',
        location: 'Himachal',
        price: 10000,
        duration: '5 days',
        description: 'A test trip',
        images: ['image1.jpg'],
        inclusions: ['meals'],
        exclusions: [],
        itinerary: {}
      }
    });
  });

  it('should get all trips', async () => {
    const response = await request(app)
      .get('/api/trips');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});

describe('Trips API - POST /api/trips', () => {
  it('should create trip only for admins', async () => {
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'New Test Trip',
        slug: 'new-test-trip',
        location: 'Ladakh',
        price: 15000,
        duration: '7 days',
        description: 'A new test trip',
        images: ['image.jpg'],
        inclusions: [],
        exclusions: [],
        itinerary: {}
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('New Test Trip');
  });

  it('should deny trip creation for non-admins', async () => {
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        title: 'Unauthorized Trip',
        location: 'Goa'
      });

    expect(response.status).toBe(403);
  });
});
