import { describe, it, expect, beforeAll } from 'vitest';
import { TokenService, TokenReuseDetectedError } from '../src/jwt/token-service.js';
import { hashPassword, verifyPassword } from '../src/crypto/password.js';
import { defineAbilityFor } from '../src/casl/ability.js';

describe('Auth Service Suite', () => {
  let tokenService: TokenService;

  beforeAll(async () => {
    tokenService = new TokenService();
    await tokenService.initialize();
  });

  describe('Password Hashing', () => {
    it('should hash and verify passwords with cryptographic salts', async () => {
      const password = 'StrongPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toContain(':');
      expect(await verifyPassword(password, hash)).toBe(true);
      expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('EdDSA JWT Tokens & JWKS', () => {
    it('should sign and verify access token with active kid', async () => {
      const { token, kid } = await tokenService.signAccessToken({
        sub: '01931668-8000-7000-8000-000000000099',
        orgId: '01931668-8000-7000-8000-000000000001',
        hubId: '01931668-8000-7000-8000-000000000002',
        role: 'OPS_DIRECTOR',
        name: 'Marcus Vance'
      });

      expect(token).toBeDefined();
      expect(kid).toBeDefined();

      const payload = await tokenService.verifyAccessToken(token);
      expect(payload.sub).toBe('01931668-8000-7000-8000-000000000099');
      expect((payload as any).role).toBe('OPS_DIRECTOR');
    });

    it('should export public JWKS matching active signing keys', async () => {
      const jwks = await tokenService.getJwks();
      expect(jwks.keys.length).toBeGreaterThanOrEqual(1);
      expect(jwks.keys[0].kty).toBe('OKP');
      expect(jwks.keys[0].alg).toBe('EdDSA');
    });
  });

  describe('Refresh Token Family Reuse Detection', () => {
    it('should rotate token successfully and revoke family upon reuse attempt', () => {
      const userId = 'user-test-123';
      const initial = tokenService.createRefreshToken(userId);

      // First rotation: valid
      const rotated = tokenService.rotateRefreshToken(initial.refreshToken);
      expect(rotated.newRefreshToken).not.toBe(initial.refreshToken);
      expect(rotated.familyId).toBe(initial.familyId);

      // Second rotation with the OLD (already used) token -> reuse detected!
      expect(() => tokenService.rotateRefreshToken(initial.refreshToken)).toThrow(TokenReuseDetectedError);

      // Attempting to use the new token should now also fail because family was revoked!
      expect(() => tokenService.rotateRefreshToken(rotated.newRefreshToken)).toThrow('Refresh token family revoked');
    });
  });

  describe('CASL Authorization Engine', () => {
    it('should permit OPS_DIRECTOR to override lockdown and deny MEMBER', () => {
      const directorAbility = defineAbilityFor({
        id: '1',
        role: 'OPS_DIRECTOR',
        orgId: 'org-1',
        hubId: 'hub-1'
      });

      const memberAbility = defineAbilityFor({
        id: '2',
        role: 'MEMBER',
        orgId: 'org-1',
        hubId: 'hub-1'
      });

      expect(directorAbility.can('override_lockdown', 'TurnstileGate')).toBe(true);
      expect(directorAbility.can('manage', 'Member')).toBe(true);

      expect(memberAbility.can('override_lockdown', 'TurnstileGate')).toBe(false);
      expect(memberAbility.can('manage', 'Member')).toBe(false);
      expect(memberAbility.can('create', 'Booking')).toBe(true);
    });
  });
});

