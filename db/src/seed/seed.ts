import { v4 as uuidv4 } from 'uuid';
import crypto from 'node:crypto';

export interface SeedDataResult {
  orgId: string;
  hubId: string;
  staffCount: number;
  memberCount: number;
  activeCount: number;
  expiringCount: number;
  frozenCount: number;
  protocolCount: number;
  classCount: number;
  demoUsers: { email: string; role: string }[];
}

export const ORG_ID = '01931668-8000-7000-8000-000000000001';
export const DOWNTOWN_HUB_ID = '01931668-8000-7000-8000-000000000002';
export const UPTOWN_HUB_ID = '01931668-8000-7000-8000-000000000003';

// Seedable PRNG (Mulberry32) for deterministic reproducible data
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeedDataset(scale: number = 1): SeedDataResult {
  const prng = mulberry32(1337);

  // 1. Staff definitions
  const staff = [
    { name: 'Marcus Vance', role: 'OPS_DIRECTOR', email: 'director@kineticfit.dev', specialty: 'Facility Operations', zone: 'Control Center' },
    { name: 'Elena Rostova', role: 'TRAINER', email: 'elena@kineticfit.dev', specialty: 'Strength Master Coach', zone: 'Studio 1 MetCon' },
    { name: 'David Kim', role: 'TRAINER', email: 'david@kineticfit.dev', specialty: 'Conditioning Specialist', zone: 'Studio 3 Cycle' },
    { name: 'Jaxson Hayes', role: 'TRAINER', email: 'jaxson@kineticfit.dev', specialty: 'Lead Strength Specialist', zone: 'Studio 4 Oly Lifting' },
    { name: 'Maya Lin', role: 'TRAINER', email: 'maya@kineticfit.dev', specialty: 'Mobility & Yoga Lead', zone: 'Studio 2 Yoga' },
    { name: 'Dr. Aris Thorne', role: 'DIETITIAN', email: 'dietitian@kineticfit.dev', specialty: 'Sports Nutrition & Lab Lead', zone: 'Kitchen Lab' },
    { name: 'Soren Lindqvist', role: 'TRAINER', email: 'soren@kineticfit.dev', specialty: 'Recovery & Hydro Specialist', zone: 'Recovery Zone' },
    { name: 'Liam Brooks', role: 'FRONT_DESK', email: 'frontdesk@kineticfit.dev', specialty: 'Turnstile & Member Check-in', zone: 'Terminal Lane 01' },
    { name: 'Sarah Sterling', role: 'FINANCE', email: 'finance@kineticfit.dev', specialty: 'Billing & Financial Ledger', zone: 'Operations Deck' }
  ];

  // 2. Member Distribution: 1,842 base members
  // 1,680 Active, 84 Expiring, 78 Frozen
  const totalMembers = 1842 * scale;
  const activeCount = Math.floor(1680 * scale);
  const expiringCount = Math.floor(84 * scale);
  const frozenCount = totalMembers - activeCount - expiringCount;

  // 3. Diet Protocols (>= 14 protocols across 4 categories)
  const protocolCategories = [
    { cat: 'Hypertrophy & Mass Gain', kcal: 3200, count: 4 },
    { cat: 'Fat Loss & Metabolic Cut', kcal: 1950, count: 4 },
    { cat: 'Keto & Metabolic Flexibility', kcal: 2200, count: 3 },
    { cat: 'Endurance & Stamina Engine', kcal: 2800, count: 3 }
  ];
  let totalProtocols = 0;
  protocolCategories.forEach((c) => (totalProtocols += c.count));

  // 4. Classes (7 core formats across 4 studios)
  const classCount = 7 * 4 * 7; // ~196 sessions over 4 weeks

  return {
    orgId: ORG_ID,
    hubId: DOWNTOWN_HUB_ID,
    staffCount: staff.length,
    memberCount: totalMembers,
    activeCount,
    expiringCount,
    frozenCount,
    protocolCount: totalProtocols,
    classCount,
    demoUsers: [
      { email: 'director@kineticfit.dev', role: 'OPS_DIRECTOR' },
      { email: 'trainer@kineticfit.dev', role: 'TRAINER' },
      { email: 'dietitian@kineticfit.dev', role: 'DIETITIAN' },
      { email: 'frontdesk@kineticfit.dev', role: 'FRONT_DESK' },
      { email: 'finance@kineticfit.dev', role: 'FINANCE' },
      { email: 'member@kineticfit.dev', role: 'MEMBER' }
    ]
  };
}

// When executed directly, report seed configuration
if (process.argv[1]?.endsWith('seed.js') || process.argv[1]?.endsWith('seed.ts')) {
  const result = generateSeedDataset(1);
  console.log('KineticFit OS Seed Dataset Plan:');
  console.log(JSON.stringify(result, null, 2));
}
