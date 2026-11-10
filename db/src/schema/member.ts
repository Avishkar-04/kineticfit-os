import { pgTable, uuid, varchar, text, timestamp, integer, date } from 'drizzle-orm/pg-core';
import { users } from './auth.js';

export const members = pgTable('members', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  memberNo: varchar('member_no', { length: 50 }).notNull().unique(), // KF-####
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneEnc: text('phone_enc'), // Field-level envelope encrypted
  dob: date('dob'),
  rfidUid: varchar('rfid_uid', { length: 64 }).notNull().unique(),
  tier: varchar('tier', { length: 50 }).notNull(), // STANDARD, PRO, ELITE_BLACK
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, EXPIRING, FROZEN
  trainerId: uuid('trainer_id'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  version: integer('version').default(1).notNull()
});

export const staff = pgTable('staff', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  specialty: varchar('specialty', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ON_FLOOR'),
  floorZone: varchar('floor_zone', { length: 100 }).notNull(),
  certifications: text('certifications').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const shifts = pgTable('shifts', {
  id: uuid('id').primaryKey(),
  staffId: uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  hubId: uuid('hub_id').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  zone: varchar('zone', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const coverRequests = pgTable('cover_requests', {
  id: uuid('id').primaryKey(),
  requesterStaffId: uuid('requester_staff_id').notNull().references(() => staff.id),
  substituteStaffId: uuid('substitute_staff_id').references(() => staff.id),
  sessionId: uuid('session_id').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

