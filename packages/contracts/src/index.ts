import { z } from 'zod';

// Standard Hub and Organization Identifiers
export const ORG_ID = '01931668-8000-7000-8000-000000000001';
export const DOWNTOWN_HUB_ID = '01931668-8000-7000-8000-000000000002';
export const UPTOWN_HUB_ID = '01931668-8000-7000-8000-000000000003';

// Roles
export const RoleSchema = z.enum([
  'SUPERADMIN',
  'OPS_DIRECTOR',
  'FRONT_DESK',
  'TRAINER',
  'DIETITIAN',
  'FINANCE',
  'MEMBER'
]);
export type Role = z.infer<typeof RoleSchema>;

// Membership Tiers
export const MembershipTierSchema = z.enum(['STANDARD', 'PRO', 'ELITE_BLACK']);
export type MembershipTier = z.infer<typeof MembershipTierSchema>;

export const TierDisplayNames: Record<MembershipTier, string> = {
  STANDARD: 'Standard Gym',
  PRO: 'Pro Performance',
  ELITE_BLACK: 'Elite Black VIP'
};

// Base Event Envelope
export const EventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal('v1'),
  orgId: z.string().uuid(),
  hubId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  producer: z.string()
});

// Check-in & Telemetry Events
export const CheckinRecordedEventSchema = EventEnvelopeSchema.extend({
  type: z.literal('checkin.recorded'),
  data: z.object({
    checkinId: z.string().uuid(),
    memberId: z.string().uuid(),
    rfidUid: z.string(),
    gateId: z.string(),
    memberName: z.string(),
    tier: MembershipTierSchema,
    occupancyAfter: z.number().int().nonnegative()
  })
});
export type CheckinRecordedEvent = z.infer<typeof CheckinRecordedEventSchema>;

export const CheckinDeniedEventSchema = EventEnvelopeSchema.extend({
  type: z.literal('checkin.denied'),
  data: z.object({
    memberId: z.string().uuid().optional(),
    rfidUid: z.string(),
    gateId: z.string(),
    reason: z.string(),
    attemptedAt: z.string().datetime()
  })
});
export type CheckinDeniedEvent = z.infer<typeof CheckinDeniedEventSchema>;

export const OccupancyChangedEventSchema = EventEnvelopeSchema.extend({
  type: z.literal('occupancy.changed'),
  data: z.object({
    currentCount: z.number().int().nonnegative(),
    capacity: z.number().int().positive(),
    percentage: z.number().min(0).max(100),
    peakWindowForecastMinutes: z.number().int().optional(),
    sectors: z.record(z.string(), z.number())
  })
});
export type OccupancyChangedEvent = z.infer<typeof OccupancyChangedEventSchema>;

// Class & Booking Events
export const BookingConfirmedEventSchema = EventEnvelopeSchema.extend({
  type: z.literal('booking.confirmed'),
  data: z.object({
    bookingId: z.string().uuid(),
    sessionId: z.string().uuid(),
    memberId: z.string().uuid(),
    bookedCount: z.number().int().positive(),
    capacity: z.number().int().positive()
  })
});
export type BookingConfirmedEvent = z.infer<typeof BookingConfirmedEventSchema>;

// Lockdown Event
export const LockdownEngagedEventSchema = EventEnvelopeSchema.extend({
  type: z.literal('lockdown.engaged'),
  data: z.object({
    engagedBy: z.string().uuid(),
    reason: z.string(),
    affectedGates: z.array(z.string())
  })
});
export type LockdownEngagedEvent = z.infer<typeof LockdownEngagedEventSchema>;

// Member DTO
export const MemberDtoSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  hubId: z.string().uuid(),
  memberNo: z.string(),
  name: z.string(),
  email: z.string().email(),
  rfidUid: z.string(),
  tier: MembershipTierSchema,
  status: z.enum(['ACTIVE', 'EXPIRING', 'FROZEN']),
  trainerId: z.string().uuid().nullable().optional(),
  trainerName: z.string().nullable().optional(),
  dietPlanName: z.string().nullable().optional(),
  adherencePercentage: z.number().min(0).max(100).optional(),
  joinedAt: z.string().datetime()
});
export type MemberDto = z.infer<typeof MemberDtoSchema>;

// Nutrition DTOs
export const ProtocolMealDtoSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  timeOffsetMinutes: z.number().int(),
  macrosJson: z.object({
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
    calories: z.number().nonnegative()
  }),
  prepNotes: z.string().optional()
});
export type ProtocolMealDto = z.infer<typeof ProtocolMealDtoSchema>;

export const DietProtocolDtoSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  hubId: z.string().uuid(),
  title: z.string(),
  category: z.string(),
  kcalTarget: z.number().int().positive(),
  proteinGrams: z.number().int().positive(),
  carbGrams: z.number().int().positive(),
  fatGrams: z.number().int().positive(),
  tier: MembershipTierSchema,
  version: z.number().int().positive().default(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  meals: z.array(ProtocolMealDtoSchema).optional(),
  createdAt: z.string().datetime()
});
export type DietProtocolDto = z.infer<typeof DietProtocolDtoSchema>;

export const BodyAssessmentDtoSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  bodyFatPercentage: z.number(),
  muscleMassKg: z.number(),
  bmi: z.number(),
  source: z.string().default('INBODY_770'),
  scannedAt: z.string().datetime()
});
export type BodyAssessmentDto = z.infer<typeof BodyAssessmentDtoSchema>;

// Billing DTOs
export const SubscriptionDtoSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  planId: z.string().uuid(),
  planName: z.string().optional(),
  planPriceCents: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL']),
  renewsAt: z.string().datetime()
});
export type SubscriptionDto = z.infer<typeof SubscriptionDtoSchema>;

export const InvoiceDtoSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  hubId: z.string().uuid(),
  memberId: z.string().uuid(),
  memberName: z.string().optional(),
  invoiceNo: z.string(),
  amountCents: z.number().int(),
  currency: z.string().default('USD'),
  status: z.enum(['OPEN', 'PAID', 'PAST_DUE', 'VOID']),
  dueAt: z.string().datetime(),
  paidAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime()
});
export type InvoiceDto = z.infer<typeof InvoiceDtoSchema>;

// Webhook Envelope
export const PaymentWebhookEventSchema = z.object({
  id: z.string(),
  provider: z.enum(['MOCK', 'STRIPE', 'RAZORPAY']),
  type: z.enum(['payment.succeeded', 'payment.failed', 'subscription.renewed', 'subscription.canceled']),
  timestamp: z.number(),
  signature: z.string(),
  payload: z.record(z.string(), z.any())
});
export type PaymentWebhookEvent = z.infer<typeof PaymentWebhookEventSchema>;

