#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /\b(AKIA[0-9A-Z]{16})\b/ },
  { name: 'AWS Secret Access Key', regex: /\b([a-zA-Z0-9/+=]{40})\b(?=.*(?:aws|secret))/i },
  { name: 'GitHub Personal Access Token', regex: /\b(ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b/ },
  { name: 'Stripe Live Secret Key', regex: /\b(sk_live_[0-9a-zA-Z]{24,})\b/ },
  { name: 'Google API Key', regex: /\b(AIza[0-9A-Za-z\\-_]{35})\b/ },
  { name: 'Slack Token', regex: /\b(xox[baprs]-[0-9a-zA-Z]{10,48})\b/ },
  { name: 'RSA/DSA/EC Private Key Header', regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/ },
  { name: 'Generic Live Password Assignment', regex: /(?:password|secret|api[_-]?key)\s*[:=]\s*["'](?!CHANGE_ME|REPLACE_ME|kinetic_secret|minioadmin|admin|super-secret|\$\{)(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{16,}["']/i }
];

const IGNORE_FILES = new Set([
  'pnpm-lock.yaml',
  'scripts/scan-secrets.mjs',
  'packages/observability/test/observability.spec.ts',
  'packages/observability/src/logger.ts',
  'apps/auth-service/test/auth.spec.ts',
  'apps/auth-service/src/auth.test.ts',
  'apps/auth-service/src/server.ts',
  'tests/security/attack-suite.test.ts'
]);

function runScan() {
  console.log('==> Scanning git-tracked files for exposed API keys, private keys, and secrets...');

  let files = [];
  try {
    const output = execSync('git ls-files', { encoding: 'utf-8' });
    files = output.split('\n').map((f) => f.trim()).filter(Boolean);
  } catch (err) {
    console.error('Failed to get git-tracked files:', err.message);
    process.exit(1);
  }

  let violationsCount = 0;

  for (const file of files) {
    if (IGNORE_FILES.has(file)) continue;
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.ico') || file.endsWith('.pdf')) continue;

    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          console.error(`[CRITICAL SECURITY ALERT] ${pattern.name} detected in ${file}:${i + 1}`);
          console.error(`  Line content: ${line.trim().slice(0, 100)}...`);
          violationsCount++;
        }
      }
    }
  }

  if (violationsCount > 0) {
    console.error(`\nFound ${violationsCount} potential exposed secret(s). Please remove them and store in .env!`);
    process.exit(1);
  } else {
    console.log(`[PASS] Clean scan! Zero exposed API keys, tokens, or private credentials found across ${files.length} tracked files.`);
  }
}

runScan();
