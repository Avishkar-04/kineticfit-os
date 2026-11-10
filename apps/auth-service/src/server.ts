import Fastify from 'fastify';
import cors from '@fastify/cors';
import { TokenService } from './jwt/token-service.js';
import { hashPassword, verifyPassword } from './crypto/password.js';
import { HealthProbeRegistry, createLogger } from '@kineticfit/observability';
import { ORG_ID, DOWNTOWN_HUB_ID } from '@kineticfit/contracts';

const logger = createLogger('auth-service');
const healthRegistry = new HealthProbeRegistry('auth-service', '1.0.0');
const tokenService = new TokenService();

// Mock in-memory user table for auth-service standalone / fast path
const userDb = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: any }>();

export async function buildServer() {
  await tokenService.initialize();

  // Seed demo director account
  const directorHash = await hashPassword('KineticFit2026!');
  userDb.set('director@kineticfit.dev', {
    id: '01931668-8000-7000-8000-000000000099',
    name: 'Marcus Vance',
    email: 'director@kineticfit.dev',
    passwordHash: directorHash,
    role: 'OPS_DIRECTOR'
  });

  const app = Fastify({ logger: false });

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  // Standardized Health Probes
  app.get('/health/live', async (req, reply) => {
    return healthRegistry.getLiveness();
  });

  app.get('/health/ready', async (req, reply) => {
    const ready = await healthRegistry.getReadiness();
    reply.status(ready.ok ? 200 : 503);
    return ready.result;
  });

  app.get('/health/startup', async (req, reply) => {
    const startup = await healthRegistry.getStartup();
    reply.status(startup.ok ? 200 : 503);
    return startup.result;
  });

  // JWKS public key distribution endpoint
  app.get('/auth/.well-known/jwks.json', async () => {
    return tokenService.getJwks();
  });

  // Current authenticated user verification endpoint
  app.get('/v1/auth/me', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401);
      return { error: 'Missing or malformed Authorization header' };
    }
    const token = authHeader.substring(7);
    try {
      const payload = await tokenService.verifyAccessToken(token);
      return { user: payload };
    } catch (err: any) {
      reply.status(401);
      return { error: err.message };
    }
  });

  // Register
  app.post('/auth/register', async (req, reply) => {
    const body = req.body as any;
    if (!body?.email || !body?.password || !body?.name) {
      reply.status(400);
      return { error: 'Missing required registration parameters' };
    }

    if (userDb.has(body.email)) {
      reply.status(409);
      return { error: 'Email address already registered' };
    }

    const passwordHash = await hashPassword(body.password);
    const userId = crypto.randomUUID();
    userDb.set(body.email, {
      id: userId,
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role || 'MEMBER'
    });

    const accessToken = await tokenService.signAccessToken({
      sub: userId,
      orgId: '01931668-8000-7000-8000-000000000001',
      hubId: '01931668-8000-7000-8000-000000000002',
      role: body.role || 'MEMBER',
      name: body.name
    });

    const refresh = tokenService.createRefreshToken(userId);

    reply.header('Set-Cookie', `kf_refresh=${refresh.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/auth; Max-Age=2592000`);
    return {
      userId,
      token: accessToken.token,
      refreshToken: refresh.refreshToken,
      kid: accessToken.kid
    };
  });

  // Login
  app.post('/auth/login', async (req, reply) => {
    const body = req.body as any;
    const user = userDb.get(body?.email);

    if (!user) {
      reply.status(401);
      return { error: 'Invalid email or password' };
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      reply.status(401);
      return { error: 'Invalid email or password' };
    }

    const accessToken = await tokenService.signAccessToken({
      sub: user.id,
      orgId: '01931668-8000-7000-8000-000000000001',
      hubId: '01931668-8000-7000-8000-000000000002',
      role: user.role,
      name: user.name
    });

    const refresh = tokenService.createRefreshToken(user.id);
    reply.header('Set-Cookie', `kf_refresh=${refresh.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/auth; Max-Age=2592000`);

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      token: accessToken.token,
      refreshToken: refresh.refreshToken,
      kid: accessToken.kid
    };
  });

  // Refresh with family reuse protection
  app.post('/auth/refresh', async (req, reply) => {
    const body = req.body as any;
    const token = body?.refreshToken;

    if (!token) {
      reply.status(400);
      return { error: 'Missing refresh token' };
    }

    try {
      const rotated = tokenService.rotateRefreshToken(token);
      const user = Array.from(userDb.values()).find((u) => u.id === rotated.userId);

      const accessToken = await tokenService.signAccessToken({
        sub: rotated.userId,
        orgId: '01931668-8000-7000-8000-000000000001',
        hubId: '01931668-8000-7000-8000-000000000002',
        role: user?.role || 'MEMBER',
        name: user?.name || 'Athlete'
      });

      return {
        token: accessToken.token,
        refreshToken: rotated.newRefreshToken
      };
    } catch (err: any) {
      reply.status(401);
      return { error: err.message };
    }
  });

  return app;
}

if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  const port = Number(process.env.AUTH_SERVICE_PORT || 3001);
  buildServer().then((app) => {
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        logger.error('Failed to start auth service', { error: err.message });
        process.exit(1);
      }
      logger.info(`Auth Service online at ${address}`);
    });
  });
}
