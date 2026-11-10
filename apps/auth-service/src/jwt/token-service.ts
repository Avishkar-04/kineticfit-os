import * as jose from 'jose';
import crypto from 'node:crypto';

export interface ActiveKey {
  kid: string;
  keyPair: jose.GenerateKeyPairResult;
  status: 'ACTIVE' | 'RETIRED';
  createdAt: number;
}

export interface RefreshTokenRecord {
  token: string;
  familyId: string;
  userId: string;
  used: boolean;
  expiresAt: number;
}

export class TokenReuseDetectedError extends Error {
  constructor(public readonly familyId: string, public readonly userId: string) {
    super(`Refresh token reuse detected for family ${familyId}. Revoking family.`);
    this.name = 'TokenReuseDetectedError';
  }
}

export class TokenService {
  private activeKeys: ActiveKey[] = [];
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();
  private readonly revokedFamilies = new Set<string>();

  public async initialize(): Promise<void> {
    await this.rotateSigningKey();
  }

  public async rotateSigningKey(): Promise<string> {
    const kid = `kf-key-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const keyPair = await jose.generateKeyPair('EdDSA', { crv: 'Ed25519' });

    // Mark previous keys as RETIRED
    for (const key of this.activeKeys) {
      key.status = 'RETIRED';
    }

    this.activeKeys.unshift({
      kid,
      keyPair,
      status: 'ACTIVE',
      createdAt: Date.now()
    });

    // Retain up to 3 keys for overlap verification window
    if (this.activeKeys.length > 3) {
      this.activeKeys.pop();
    }

    return kid;
  }

  public async signAccessToken(payload: {
    sub: string;
    orgId: string;
    hubId: string;
    role: string;
    name: string;
  }): Promise<{ token: string; kid: string }> {
    const currentKey = this.activeKeys.find((k) => k.status === 'ACTIVE');
    if (!currentKey) {
      throw new Error('No active signing key initialized');
    }

    const token = await new jose.SignJWT({
      org_id: payload.orgId,
      hub_id: payload.hubId,
      role: payload.role,
      name: payload.name
    })
      .setProtectedHeader({ alg: 'EdDSA', kid: currentKey.kid })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime('10m') // 10 minutes short-lived
      .setIssuer('https://kineticfit.os')
      .sign(currentKey.keyPair.privateKey);

    return { token, kid: currentKey.kid };
  }

  public async verifyAccessToken(token: string): Promise<jose.JWTPayload> {
    const header = jose.decodeProtectedHeader(token);
    const keyRecord = this.activeKeys.find((k) => k.kid === header.kid);
    if (!keyRecord) {
      throw new Error(`Signing key '${header.kid}' not recognized`);
    }

    const { payload } = await jose.jwtVerify(token, keyRecord.keyPair.publicKey, {
      issuer: 'https://kineticfit.os'
    });
    return payload;
  }

  public async getJwks(): Promise<jose.JSONWebKeySet> {
    const keys: jose.JWK[] = [];
    for (const k of this.activeKeys) {
      const jwk = await jose.exportJWK(k.keyPair.publicKey);
      jwk.kid = k.kid;
      jwk.alg = 'EdDSA';
      jwk.use = 'sig';
      keys.push(jwk);
    }
    return { keys };
  }

  // Refresh token family rotation with reuse detection
  public createRefreshToken(userId: string, existingFamilyId?: string): { refreshToken: string; familyId: string } {
    const familyId = existingFamilyId || crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    this.refreshTokens.set(token, {
      token,
      familyId,
      userId,
      used: false,
      expiresAt
    });

    return { refreshToken: token, familyId };
  }

  public rotateRefreshToken(token: string): { newRefreshToken: string; userId: string; familyId: string } {
    const record = this.refreshTokens.get(token);

    if (!record) {
      throw new Error('Invalid refresh token');
    }

    if (this.revokedFamilies.has(record.familyId)) {
      throw new Error('Refresh token family revoked');
    }

    if (record.used) {
      // Token reuse detected! Revoke whole family immediately
      this.revokedFamilies.add(record.familyId);
      throw new TokenReuseDetectedError(record.familyId, record.userId);
    }

    if (Date.now() > record.expiresAt) {
      throw new Error('Refresh token expired');
    }

    // Mark as used
    record.used = true;

    // Issue new token in the same family
    const next = this.createRefreshToken(record.userId, record.familyId);
    return {
      newRefreshToken: next.refreshToken,
      userId: record.userId,
      familyId: record.familyId
    };
  }
}

