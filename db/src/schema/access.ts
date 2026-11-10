import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { members } from './member.js';
import { users } from './auth.js';

export const gates = pgTable('gates', {
  id: uuid('id').primaryKey(),
  hubId: uuid('hub_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  laneCode: varchar('lane_code', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('ONLINE').notNull(),
  lastHeartbeat: timestamp('last_heartbeat', { withTimezone: true }).defaultNow().notNull()
});

// check_ins table (monthly partitioned)
export const checkIns = pgTable('check_ins', {
  id: uuid('id').notNull(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  gateId: uuid('gate_id').notNull().references(() => gates.id),
  memberId: uuid('member_id').references(() => members.id),
  rfidUid: varchar('rfid_uid', { length: 64 }).notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  tier: varchar('tier', { length: 50 }).notNull(),
  result: varchar('result', { length: 50 }).notNull(), // 'GRANTED' | 'DENIED'
  reason: text('reason')
});

export const lockdownEvents = pgTable('lockdown_events', {
  id: uuid('id').primaryKey(),
  hubId: uuid('hub_id').notNull(),
  engagedByUserId: uuid('engaged_by_user_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  engagedAt: timestamp('engaged_at', { withTimezone: true }).defaultNow().notNull(),
  releasedAt: timestamp('released_at', { withTimezone: true })
});

