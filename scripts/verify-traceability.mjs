import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const traceabilityContent = fs.readFileSync(path.join(rootDir, 'docs/TRACEABILITY.md'), 'utf-8');
const lines = traceabilityContent.split('\n');

const rows = [];
for (const line of lines) {
  const match = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/);
  if (match) {
    const num = parseInt(match[1], 10);
    const concept = match[2].trim();
    const where = match[3].trim();
    const lvl = match[4].trim();
    const evidenceRaw = match[5].trim();
    rows.push({ num, concept, where, lvl, evidenceRaw });
  }
}

console.log(`Found ${rows.length} concepts in TRACEABILITY.md`);

let missingCount = 0;
for (const row of rows) {
  // Extract backtick paths or comma-separated paths
  const paths = (row.evidenceRaw.match(/`([^`]+)`/g) || []).map((p) => p.replace(/`/g, ''));
  if (paths.length === 0) {
    console.log(`Row #${row.num} (${row.concept}) has no backticked paths: ${row.evidenceRaw}`);
    missingCount++;
    continue;
  }
  for (const relPath of paths) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Row #${row.num} (${row.concept}) references missing path: ${relPath}`);
      missingCount++;
    }
  }
}

console.log(`Verification completed. Missing paths count: ${missingCount}`);

