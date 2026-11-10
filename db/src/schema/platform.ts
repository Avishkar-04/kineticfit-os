import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth.js';

export const outbox = pgTable('outbox', {
  id: uuid('id').primaryKey(),
  aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true })
});

export const inboxDedup = pgTable('inbox_dedup', {
  messageId: varchar('message_id', { length: 255 }).primaryKey(),
  consumerGroup: varchar('consumer_group', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull()
});

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: varchar('key', { length: 255 }).primaryKey(),
  requestHash: varchar('request_hash', { length: 64 }).notNull(),
  responseStatus: integer('response_status').notNull(),
  responseBody: jsonb('response_body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

export const sagaInstances = pgTable('saga_instances', {
  id: uuid('id').primaryKey(),
  sagaName: varchar('saga_name', { length: 100 }).notNull(), // 'member.registration' | 'booking.create'
  state: varchar('state', { length: 50 }).notNull(), // 'PENDING' | 'COMPLETED' | 'COMPENSATED' | 'FAILED'
  currentStep: varchar('current_step', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true })
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').notNull(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  diff: jsonb('diff'),
  ip: varchar('ip', { length: 45 }).notNull(),
  hash: varchar('hash', { length: 64 }).notNull(), // SHA256 hash-chaining
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

