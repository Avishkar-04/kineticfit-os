import dns from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export class SSRFBlockedError extends Error {
  constructor(message: string) {
    super(`SSRF Protection Blocked: ${message}`);
    this.name = 'SSRFBlockedError';
  }
}

/**
 * Checks if an IPv4 address falls within private, loopback, or link-local ranges:
 * - 0.0.0.0/8 (broadcast/this host)
 * - 10.0.0.0/8 (RFC 1918)
 * - 127.0.0.0/8 (Loopback)
 * - 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
 * - 172.16.0.0/12 (RFC 1918)
 * - 192.168.0.0/16 (RFC 1918)
 * - 224.0.0.0/4 (Multicast)
 */
export function isPrivateOrReservedIP(rawIp: string): boolean {
  const ip = rawIp.replace(/^\[|\]$/g, '');
  if (ip === 'localhost' || ip === '::1') return true;

  // Handle IPv4
  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    const [a, b] = parts;
    if (a === 0) return true;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true; // AWS/GCP/Azure Metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
    return false;
  }

  // IPv6 checks (fc00::/7 unique local, fe80::/10 link local, ::1 loopback)
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return true;

  return false;
}

export async function validateSsrfTarget(rawUrl: string): Promise<{ isAllowed: boolean; reason?: string }> {
  try {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return { isAllowed: false, reason: 'Malformed URL' };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isAllowed: false, reason: `Protocol ${parsed.protocol} is forbidden` };
    }

    const rawHost = parsed.hostname;
    const hostname = rawHost ? rawHost.replace(/^\[|\]$/g, '') : '';
    if (!hostname || hostname.toLowerCase() === 'localhost') {
      return { isAllowed: false, reason: 'Target is private or loopback address' };
    }

    if (isPrivateOrReservedIP(hostname)) {
      if (hostname.startsWith('169.254')) {
        return { isAllowed: false, reason: 'Target is link-local or metadata endpoint' };
      }
      return { isAllowed: false, reason: 'Target is private or loopback address' };
    }

    return { isAllowed: true };
  } catch (err: any) {
    return { isAllowed: false, reason: err.message };
  }
}

export async function validateUrlForSSRF(rawUrl: string): Promise<{ resolvedIp: string; parsedUrl: URL }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SSRFBlockedError('Malformed URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SSRFBlockedError(`Unsupported protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname;
  if (!hostname || hostname.toLowerCase() === 'localhost') {
    throw new SSRFBlockedError('Access to localhost is prohibited');
  }

  // Resolve hostname to IP
  let resolvedIp: string;
  try {
    const lookup = await dns.lookup(hostname);
    resolvedIp = lookup.address;
  } catch (err: any) {
    throw new SSRFBlockedError(`DNS resolution failure: ${err.message}`);
  }

  if (isPrivateOrReservedIP(resolvedIp)) {
    throw new SSRFBlockedError(`Resolved address ${resolvedIp} is private or link-local`);
  }

  return { resolvedIp, parsedUrl: parsed };
}
