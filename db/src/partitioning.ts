export interface PartitionDefinition {
  tableName: string;
  partitionName: string;
  fromTimestamp: string;
  toTimestamp: string;
  createSql: string;
  indexSql: string[];
}

export function generateMonthlyPartition(
  tableName: 'check_ins' | 'audit_log',
  year: number,
  month: number
): PartitionDefinition {
  const monthPad = String(month).padStart(2, '0');
  const partitionName = `${tableName}_y${year}m${monthPad}`;

  const fromDate = new Date(Date.UTC(year, month - 1, 1));
  const toDate = new Date(Date.UTC(year, month, 1));

  const fromIso = fromDate.toISOString().replace('T', ' ').replace('.000Z', '+00');
  const toIso = toDate.toISOString().replace('T', ' ').replace('.000Z', '+00');

  const createSql = `CREATE TABLE IF NOT EXISTS ${partitionName} PARTITION OF ${tableName} FOR VALUES FROM ('${fromIso}') TO ('${toIso}');`;

  const indexSql: string[] = [];
  if (tableName === 'check_ins') {
    indexSql.push(
      `CREATE INDEX IF NOT EXISTS idx_${partitionName}_hub_time ON ${partitionName} (hub_id, occurred_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_${partitionName}_member ON ${partitionName} (member_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${partitionName}_rfid ON ${partitionName} (rfid_uid);`
    );
  } else {
    indexSql.push(
      `CREATE INDEX IF NOT EXISTS idx_${partitionName}_org_created ON ${partitionName} (org_id, created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_${partitionName}_actor ON ${partitionName} (actor_user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${partitionName}_resource ON ${partitionName} (resource);`
    );
  }

  return {
    tableName,
    partitionName,
    fromTimestamp: fromIso,
    toTimestamp: toIso,
    createSql,
    indexSql
  };
}

export function generatePartitionsForRange(
  tableName: 'check_ins' | 'audit_log',
  startYear: number,
  startMonth: number,
  monthCount: number
): PartitionDefinition[] {
  const partitions: PartitionDefinition[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  for (let i = 0; i < monthCount; i++) {
    partitions.push(generateMonthlyPartition(tableName, currentYear, currentMonth));
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return partitions;
}

export function generateDetachPartitionSql(
  tableName: 'check_ins' | 'audit_log',
  year: number,
  month: number
): string {
  const monthPad = String(month).padStart(2, '0');
  const partitionName = `${tableName}_y${year}m${monthPad}`;
  return `ALTER TABLE ${tableName} DETACH PARTITION ${partitionName} CONCURRENTLY;`;
}
