import { pgTable, uuid, varchar, text, timestamp, integer, numeric, jsonb } from 'drizzle-orm/pg-core';
import { members } from './member.js';

export const dietProtocols = pgTable('diet_protocols', {
  id: uuid('id').primaryKey(),
  orgId: uuid('org_id').notNull(),
  hubId: uuid('hub_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  kcalTarget: integer('kcal_target').notNull(),
  proteinGrams: integer('protein_grams').notNull(),
  carbGrams: integer('carb_grams').notNull(),
  fatGrams: integer('fat_grams').notNull(),
  tier: varchar('tier', { length: 50 }).notNull(),
  version: integer('version').default(1).notNull(),
  status: varchar('status', { length: 50 }).default('PUBLISHED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const protocolMeals = pgTable('protocol_meals', {
  id: uuid('id').primaryKey(),
  protocolId: uuid('protocol_id').notNull().references(() => dietProtocols.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  timeOffsetMinutes: integer('time_offset_minutes').notNull(), // minutes from wake up
  macrosJson: jsonb('macros_json').notNull(),
  prepNotes: text('prep_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const dietAssignments = pgTable('diet_assignments', {
  id: uuid('id').primaryKey(),
  protocolId: uuid('protocol_id').notNull().references(() => dietProtocols.id),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  adherenceRate: numeric('adherence_rate', { precision: 5, scale: 2 }).default('100.00').notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull()
});

export const bodyAssessments = pgTable('body_assessments', {
  id: uuid('id').primaryKey(),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  bodyFatPercentage: numeric('body_fat_percentage', { precision: 4, scale: 1 }).notNull(),
  muscleMassKg: numeric('muscle_mass_kg', { precision: 5, scale: 2 }).notNull(),
  bmi: numeric('bmi', { precision: 4, scale: 1 }).notNull(),
  source: varchar('source', { length: 50 }).default('INBODY_770').notNull(),
  scannedAt: timestamp('scanned_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

