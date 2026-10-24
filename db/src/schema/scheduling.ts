import { pgTable, uuid, varchar, text, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { members, staff } from './member.js';

export const studios = pgTable('studios', {
  id: uuid('id').primaryKey(),
  hubId: uuid('hub_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  capacity: integer('capacity').notNull()
});

export const classSessions = pgTable('class_sessions', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  studioId: uuid('studio_id').notNull().references(() => studios.id),
  coachStaffId: uuid('coach_staff_id').notNull().references(() => staff.id),
  title: varchar('title', { length: 255 }).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  capacity: integer('capacity').notNull(),
  bookedCount: integer('booked_count').default(0).notNull(),
  waitlistCount: integer('waitlist_count').default(0).notNull(),
  status: varchar('status', { length: 50 }).default('SCHEDULED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  version: integer('version').default(1).notNull() // Optimistic locking
});

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey(),
    sessionId: uuid('session_id').notNull().references(() => classSessions.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).default('CONFIRMED').notNull(), // 'CONFIRMED' | 'CANCELLED'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    uniqueBookingIdx: uniqueIndex('bookings_session_member_idx').on(table.sessionId, table.memberId)
  })
);

export const waitlistEntries = pgTable('waitlist_entries', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => classSessions.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  promotedAt: timestamp('promoted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
