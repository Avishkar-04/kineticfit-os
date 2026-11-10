import { describe, it, expect } from 'vitest';
import {
  generateMonthlyPartition,
  generatePartitionsForRange,
  generateDetachPartitionSql
} from '../src/partitioning.js';

describe('PostgreSQL Range Partitioning', () => {
  it('generates correct monthly partition table name and timestamp bounds for check_ins', () => {
    const part = generateMonthlyPartition('check_ins', 2026, 10);
    expect(part.partitionName).toBe('check_ins_y2026m10');
    expect(part.fromTimestamp).toBe('2026-10-01 00:00:00+00');
    expect(part.toTimestamp).toBe('2026-11-01 00:00:00+00');
    expect(part.createSql).toContain('CREATE TABLE IF NOT EXISTS check_ins_y2026m10 PARTITION OF check_ins');
    expect(part.indexSql.length).toBe(3);
    expect(part.indexSql[0]).toContain('idx_check_ins_y2026m10_hub_time');
  });

  it('generates partition range spanning across year boundaries', () => {
    // Generate 4 months starting from Nov 2026: Nov 2026, Dec 2026, Jan 2027, Feb 2027
    const parts = generatePartitionsForRange('audit_log', 2026, 11, 4);
    expect(parts.length).toBe(4);
    expect(parts[0].partitionName).toBe('audit_log_y2026m11');
    expect(parts[1].partitionName).toBe('audit_log_y2026m12');
    expect(parts[2].partitionName).toBe('audit_log_y2027m01');
    expect(parts[3].partitionName).toBe('audit_log_y2027m02');
  });

  it('generates non-blocking concurrent detach DDL for data archival', () => {
    const detachSql = generateDetachPartitionSql('check_ins', 2025, 10);
    expect(detachSql).toBe('ALTER TABLE check_ins DETACH PARTITION check_ins_y2025m10 CONCURRENTLY;');
  });
});

