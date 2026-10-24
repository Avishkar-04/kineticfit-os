import crypto from 'node:crypto';

export function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function generateCodeVerifier(length: number = 48): string {
  return base64UrlEncode(crypto.randomBytes(length));
}

export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

export function verifyPkce(verifier: string, expectedChallenge: string): boolean {
  const calculated = generateCodeChallenge(verifier);
  return calculated === expectedChallenge;
}
