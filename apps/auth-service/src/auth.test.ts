import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from './server.js';

describe('Auth Service QA Suite: JWT, JWKS, Probes & Security Guardrails', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Probes', () => {
    it('returns healthy status on /health/live', async () => {
      const res = await app.inject({ method: 'GET', url: '/health/live' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.status).toBe('UP');
      expect(body.service).toBe('auth-service');
    });

    it('returns ready status on /health/ready', async () => {
      const res = await app.inject({ method: 'GET', url: '/health/ready' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.status).toBe('UP');
    });

    it('returns startup probe status on /health/startup', async () => {
      const res = await app.inject({ method: 'GET', url: '/health/startup' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.status).toBe('UP');
    });
  });

  describe('JWKS Distribution', () => {
    it('serves valid JWKS key set for distributed verification', async () => {
      const res = await app.inject({ method: 'GET', url: '/auth/.well-known/jwks.json' });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(Array.isArray(body.keys)).toBe(true);
      expect(body.keys.length).toBeGreaterThan(0);
      expect(body.keys[0]).toHaveProperty('kty');
      expect(body.keys[0]).toHaveProperty('kid');
      expect(body.keys[0]).toHaveProperty('use', 'sig');
    });
  });

  describe('User Registration & Duplicate Guard', () => {
    it('successfully registers a new athlete and returns access token', async () => {
      const email = `athlete-${Date.now()}@kineticfit.dev`;
      const res = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Sarah Connor',
          email,
          password: 'StrongPassword123!',
          role: 'MEMBER'
        }
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.userId).toBeTruthy();
      expect(body.token).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
      expect(res.headers['set-cookie']).toBeTruthy();

      // Negative Test: Duplicate registration should be rejected with 409
      const dupRes = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Sarah Connor Duplicate',
          email,
          password: 'AnotherPassword123!'
        }
      });
      expect(dupRes.statusCode).toBe(409);
      expect(JSON.parse(dupRes.body).error).toMatch(/already registered/i);
    });

    it('negative test: rejects registration with missing fields with 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'bad@kineticfit.dev' }
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toMatch(/Missing required/i);
    });
  });

  describe('User Login & Credential Validation', () => {
    it('authenticates seeded director account and issues JWT', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'director@kineticfit.dev',
          password: 'KineticFit2026!'
        }
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.name).toBe('Marcus Vance');
      expect(body.role).toBe('OPS_DIRECTOR');
      expect(body.token).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
    });

    it('negative test: rejects invalid password with 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'director@kineticfit.dev',
          password: 'WrongPassword999!'
        }
      });
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body).error).toMatch(/Invalid email or password/i);
    });

    it('negative test: rejects non-existent email with 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nobody@kineticfit.dev',
          password: 'AnyPassword!'
        }
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Protected Endpoint: /v1/auth/me', () => {
    it('verifies valid Bearer token and returns user profile payload', async () => {
      // First login to get a valid token
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'director@kineticfit.dev',
          password: 'KineticFit2026!'
        }
      });
      const { token } = JSON.parse(loginRes.body);

      const meRes = await app.inject({
        method: 'GET',
        url: '/v1/auth/me',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(meRes.statusCode).toBe(200);
      const meBody = JSON.parse(meRes.body);
      expect(meBody.user).toBeTruthy();
      expect(meBody.user.role).toBe('OPS_DIRECTOR');
      expect(meBody.user.name).toBe('Marcus Vance');
    });

    it('negative test: rejects request without Authorization header with 401', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/auth/me' });
      expect(res.statusCode).toBe(401);
    });

    it('negative test: rejects malformed or forged Bearer token with 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/auth/me',
        headers: {
          Authorization: 'Bearer forged.token.signature'
        }
      });
      expect(res.statusCode).toBe(401);
    });
  });
});
