import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { members } from './member.js';

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // STANDARD, PRO, ELITE_BLACK
  name: varchar('name', { length: 100 }).notNull(),
  priceCents: integer('price_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull()
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey(),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => plans.id),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  renewsAt: timestamp('renews_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  invoiceNo: varchar('invoice_no', { length: 50 }).notNull().unique(),
  amountCents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: varchar('status', { length: 50 }).default('OPEN').notNull(), // 'PAID', 'PAST_DUE', 'VOID'
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // 'MOCK', 'STRIPE', 'RAZORPAY'
  providerRef: varchar('provider_ref', { length: 255 }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
