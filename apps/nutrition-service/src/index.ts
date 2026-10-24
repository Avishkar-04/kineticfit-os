import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { v4 as uuidv4 } from 'uuid';
import {
  DietProtocolDto,
  ProtocolMealDto,
  BodyAssessmentDto,
  ORG_ID,
  DOWNTOWN_HUB_ID
} from '@kineticfit/contracts';
import { createLogger } from '@kineticfit/observability';

const logger = createLogger('nutrition-service');

export interface CreateProtocolInput {
  title: string;
  category: string;
  kcalTarget: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  tier: 'STANDARD' | 'PRO' | 'ELITE_BLACK';
  meals?: ProtocolMealDto[];
}

export interface MacroCalculationInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'MALE' | 'FEMALE';
  activityFactor: number; // e.g., 1.2 (sedentary), 1.55 (moderate), 1.75 (athlete)
  goal: 'CUTTING' | 'MAINTENANCE' | 'HYPERTROPHY' | 'RECOMP';
}

export interface NutritionConsult {
  id: string;
  memberId: string;
  memberName: string;
  dietitianId: string;
  dietitianName: string;
  scheduledAt: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export function buildNutritionApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  // In-memory persistent state for service runtime
  const protocols = new Map<string, DietProtocolDto>();
  const protocolVersions = new Map<string, DietProtocolDto[]>(); // parentId -> versions
  const assessments = new Map<string, BodyAssessmentDto[]>(); // memberId -> scans
  const consults: NutritionConsult[] = [];

  // Seed default elite protocols
  const defaultProtocols: DietProtocolDto[] = [
    {
      id: '01931668-9000-7000-8000-000000000001',
      orgId: ORG_ID,
      hubId: DOWNTOWN_HUB_ID,
      title: 'Hypertrophy Surge 3200',
      category: 'MASS_GAIN',
      kcalTarget: 3200,
      proteinGrams: 220,
      carbGrams: 380,
      fatGrams: 75,
      tier: 'ELITE_BLACK',
      version: 1,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      meals: [
        {
          name: 'Anabolic Dawn Breakfast',
          timeOffsetMinutes: 30, // 07:30
          macrosJson: { calories: 850, protein: 55, carbs: 95, fat: 22 },
          prepNotes: 'Whole eggs, oat porridge with whey isolate, wild blueberries.'
        },
        {
          name: 'Mid-Morning Fuel',
          timeOffsetMinutes: 180, // 10:00
          macrosJson: { calories: 550, protein: 40, carbs: 65, fat: 12 },
          prepNotes: 'Greek yogurt with raw honey, sliced banana, crushed almonds.'
        },
        {
          name: 'Pre-Session Glycogen Load',
          timeOffsetMinutes: 360, // 13:00
          macrosJson: { calories: 750, protein: 50, carbs: 100, fat: 15 },
          prepNotes: 'Jasmine rice, grilled flank steak, steamed broccoli florets.'
        },
        {
          name: 'Post-Workout Micro-Partition',
          timeOffsetMinutes: 540, // 16:00
          macrosJson: { calories: 450, protein: 45, carbs: 60, fat: 4 },
          prepNotes: 'Hydrolyzed whey shake with cyclic dextrin and electrolyte salts.'
        },
        {
          name: 'Circadian Repair Dinner',
          timeOffsetMinutes: 720, // 19:00
          macrosJson: { calories: 600, protein: 30, carbs: 60, fat: 22 },
          prepNotes: 'Atlantic wild salmon, sweet potato mash, asparagus spears.'
        }
      ]
    },
    {
      id: '01931668-9000-7000-8000-000000000002',
      orgId: ORG_ID,
      hubId: DOWNTOWN_HUB_ID,
      title: 'Metabolic Shred 2100',
      category: 'FAT_LOSS',
      kcalTarget: 2100,
      proteinGrams: 195,
      carbGrams: 150,
      fatGrams: 55,
      tier: 'PRO',
      version: 1,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      meals: [
        {
          name: 'Power Protein Scramble',
          timeOffsetMinutes: 60,
          macrosJson: { calories: 520, protein: 48, carbs: 25, fat: 18 },
          prepNotes: 'Egg whites with 2 whole eggs, avocado, spinach.'
        },
        {
          name: 'Thermogenic Mid-Day Bowl',
          timeOffsetMinutes: 300,
          macrosJson: { calories: 680, protein: 60, carbs: 65, fat: 16 },
          prepNotes: 'Chicken breast breast, quinoa, zucchini noodles.'
        },
        {
          name: 'Evening Lean Recovery',
          timeOffsetMinutes: 660,
          macrosJson: { calories: 550, protein: 52, carbs: 40, fat: 14 },
          prepNotes: 'Cod fillets, green asparagus, roasted sweet potato wedges.'
        }
      ]
    }
  ];

  for (const p of defaultProtocols) {
    protocols.set(p.id, p);
    protocolVersions.set(p.id, [p]);
  }

  // Seed default consults
  consults.push({
    id: uuidv4(),
    memberId: '01931668-5000-7000-8000-000000000001',
    memberName: 'Alexander Vance',
    dietitianId: '01931668-1000-7000-8000-000000000006',
    dietitianName: 'Dr. Elena Rostova',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'PENDING',
    notes: 'Macro timing review and DEXA scan calibration.'
  });

  // Health
  app.get('/health', async () => ({ status: 'UP', service: 'nutrition-service', protocolsCount: protocols.size }));

  // List protocols
  app.get('/v1/protocols', async (req) => {
    const list = Array.from(protocols.values());
    return { data: list, count: list.length };
  });

  // Get protocol by ID
  app.get<{ Params: { id: string } }>('/v1/protocols/:id', async (req, reply) => {
    const p = protocols.get(req.params.id);
    if (!p) {
      return reply.code(404).send({ error: 'Protocol not found' });
    }
    return { data: p };
  });

  // Create protocol
  app.post<{ Body: CreateProtocolInput }>('/v1/protocols', async (req, reply) => {
    const b = req.body;
    const id = uuidv4();
    const newProtocol: DietProtocolDto = {
      id,
      orgId: ORG_ID,
      hubId: DOWNTOWN_HUB_ID,
      title: b.title,
      category: b.category,
      kcalTarget: b.kcalTarget,
      proteinGrams: b.proteinGrams,
      carbGrams: b.carbGrams,
      fatGrams: b.fatGrams,
      tier: b.tier,
      version: 1,
      status: 'PUBLISHED',
      meals: b.meals || [],
      createdAt: new Date().toISOString()
    };
    protocols.set(id, newProtocol);
    protocolVersions.set(id, [newProtocol]);
    logger.info('Protocol created', { protocolId: id, title: b.title });
    return reply.code(201).send({ data: newProtocol });
  });

  // Version bump protocol (creates v2 while keeping v1 immutable)
  app.post<{ Params: { id: string }; Body: Partial<CreateProtocolInput> }>('/v1/protocols/:id/version', async (req, reply) => {
    const base = protocols.get(req.params.id);
    if (!base) {
      return reply.code(404).send({ error: 'Base protocol not found' });
    }

    const nextVersion = base.version + 1;
    const newProtocolId = uuidv4();
    const updated: DietProtocolDto = {
      ...base,
      id: newProtocolId,
      version: nextVersion,
      title: req.body.title || `${base.title} (v${nextVersion})`,
      category: req.body.category || base.category,
      kcalTarget: req.body.kcalTarget ?? base.kcalTarget,
      proteinGrams: req.body.proteinGrams ?? base.proteinGrams,
      carbGrams: req.body.carbGrams ?? base.carbGrams,
      fatGrams: req.body.fatGrams ?? base.fatGrams,
      tier: req.body.tier || base.tier,
      meals: req.body.meals || base.meals,
      createdAt: new Date().toISOString()
    };

    protocols.set(newProtocolId, updated);
    const chain = protocolVersions.get(base.id) || [base];
    chain.push(updated);
    protocolVersions.set(base.id, chain);
    protocolVersions.set(newProtocolId, chain);

    logger.info('Protocol version created', { parentId: base.id, newId: newProtocolId, version: nextVersion });
    return reply.code(201).send({ data: updated, previousVersionId: base.id });
  });

  // Chrono-Nutritional Timeline
  app.get<{ Params: { id: string } }>('/v1/protocols/:id/timeline', async (req, reply) => {
    const p = protocols.get(req.params.id);
    if (!p) {
      return reply.code(404).send({ error: 'Protocol not found' });
    }

    const meals = p.meals || [];
    const totalMealCalories = meals.reduce((sum, m) => sum + (m.macrosJson?.calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.macrosJson?.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (m.macrosJson?.carbs || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (m.macrosJson?.fat || 0), 0);

    const timeline = meals.map((m) => {
      const hours = Math.floor(m.timeOffsetMinutes / 60);
      const mins = m.timeOffsetMinutes % 60;
      const clockTime = `${String(7 + hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      const pctOfDailyKcal = totalMealCalories > 0 ? Math.round((m.macrosJson.calories / totalMealCalories) * 100) : 0;

      let circadianWindow = 'REST_RECOVERY';
      if (m.timeOffsetMinutes <= 120) circadianWindow = 'CORTISOL_SYNC_AWAKENING';
      else if (m.timeOffsetMinutes <= 400) circadianWindow = 'INSULIN_SENSITIVITY_PEAK';
      else if (m.timeOffsetMinutes <= 600) circadianWindow = 'INTRA_WORKOUT_PARTITIONING';
      else circadianWindow = 'MELATONIN_SYNTHESIS_RESTORATION';

      return {
        ...m,
        clockTime,
        pctOfDailyKcal,
        circadianWindow
      };
    });

    return {
      protocolId: p.id,
      protocolTitle: p.title,
      dailyKcalTarget: p.kcalTarget,
      totalScheduledCalories: totalMealCalories,
      macroFulfillment: {
        proteinPct: Math.round((totalProtein / p.proteinGrams) * 100),
        carbPct: Math.round((totalCarbs / p.carbGrams) * 100),
        fatPct: Math.round((totalFat / p.fatGrams) * 100)
      },
      timeline
    };
  });

  // Calculate Macros (TDEE + Goal Formulation)
  app.post<{ Body: MacroCalculationInput }>('/v1/macros/calculate', async (req) => {
    const { weightKg, heightCm, age, gender, activityFactor, goal } = req.body;
    // Mifflin-St Jeor formula:
    // BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + (gender === 'MALE' ? 5 : -161)
    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'MALE' ? 5 : -161);
    const tdee = Math.round(baseBMR * activityFactor);

    let targetCalories = tdee;
    if (goal === 'CUTTING') targetCalories = Math.round(tdee * 0.8); // 20% deficit
    else if (goal === 'HYPERTROPHY') targetCalories = Math.round(tdee * 1.15); // 15% surplus
    else if (goal === 'RECOMP') targetCalories = Math.round(tdee * 0.95);

    // Protein: 2.2g per kg for hypertrophy/cutting; 1.8g for maintenance
    const proteinFactor = (goal === 'CUTTING' || goal === 'HYPERTROPHY') ? 2.2 : 2.0;
    const proteinGrams = Math.round(weightKg * proteinFactor);
    const proteinCalories = proteinGrams * 4;

    // Fat: 0.8g per kg bodyweight
    const fatGrams = Math.round(weightKg * 0.85);
    const fatCalories = fatGrams * 9;

    // Remaining calories from carbohydrates
    const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbGrams = Math.round(remainingCalories / 4);

    return {
      bmr: Math.round(baseBMR),
      tdee,
      goal,
      targetCalories,
      macros: {
        proteinGrams,
        proteinCalories,
        proteinPercentage: Math.round((proteinCalories / targetCalories) * 100),
        carbGrams,
        carbCalories: carbGrams * 4,
        carbPercentage: Math.round(((carbGrams * 4) / targetCalories) * 100),
        fatGrams,
        fatCalories,
        fatPercentage: Math.round((fatCalories / targetCalories) * 100)
      }
    };
  });

  // Body Composition Assessment logging
  app.post<{ Body: Omit<BodyAssessmentDto, 'id' | 'scannedAt'> & { scannedAt?: string } }>('/v1/assessments', async (req, reply) => {
    const scan: BodyAssessmentDto = {
      id: uuidv4(),
      memberId: req.body.memberId,
      bodyFatPercentage: req.body.bodyFatPercentage,
      muscleMassKg: req.body.muscleMassKg,
      bmi: req.body.bmi,
      source: req.body.source || 'INBODY_770',
      scannedAt: req.body.scannedAt || new Date().toISOString()
    };

    const list = assessments.get(scan.memberId) || [];
    list.push(scan);
    // Sort chronological
    list.sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime());
    assessments.set(scan.memberId, list);

    logger.info('Assessment recorded', { memberId: scan.memberId, bf: scan.bodyFatPercentage, muscle: scan.muscleMassKg });
    return reply.code(201).send({ data: scan });
  });

  // Get member assessments with trend deltas
  app.get<{ Params: { memberId: string } }>('/v1/assessments/:memberId', async (req, reply) => {
    const list = assessments.get(req.params.memberId) || [];
    if (list.length === 0) {
      // Return a demo historical sequence if empty
      const demoScans: BodyAssessmentDto[] = [
        {
          id: uuidv4(),
          memberId: req.params.memberId,
          bodyFatPercentage: 17.4,
          muscleMassKg: 38.2,
          bmi: 24.8,
          source: 'INBODY_770',
          scannedAt: new Date(Date.now() - 60 * 86400000).toISOString()
        },
        {
          id: uuidv4(),
          memberId: req.params.memberId,
          bodyFatPercentage: 15.1,
          muscleMassKg: 39.4,
          bmi: 24.2,
          source: 'INBODY_770',
          scannedAt: new Date(Date.now() - 30 * 86400000).toISOString()
        },
        {
          id: uuidv4(),
          memberId: req.params.memberId,
          bodyFatPercentage: 13.8,
          muscleMassKg: 40.5,
          bmi: 23.9,
          source: 'INBODY_770',
          scannedAt: new Date().toISOString()
        }
      ];
      assessments.set(req.params.memberId, demoScans);
      return {
        data: demoScans,
        trends: {
          fatLossPctDelta: -3.6,
          muscleGainKgDelta: 2.3,
          bmiDelta: -0.9
        }
      };
    }

    const first = list[0];
    const latest = list[list.length - 1];
    const trends = {
      fatLossPctDelta: Number((latest.bodyFatPercentage - first.bodyFatPercentage).toFixed(1)),
      muscleGainKgDelta: Number((latest.muscleMassKg - first.muscleMassKg).toFixed(1)),
      bmiDelta: Number((latest.bmi - first.bmi).toFixed(1))
    };

    return { data: list, trends };
  });

  // Consult queue
  app.get('/v1/consults', async () => ({ data: consults, count: consults.length }));

  app.post<{ Body: Omit<NutritionConsult, 'id' | 'status'> }>('/v1/consults', async (req, reply) => {
    const c: NutritionConsult = {
      id: uuidv4(),
      memberId: req.body.memberId,
      memberName: req.body.memberName,
      dietitianId: req.body.dietitianId,
      dietitianName: req.body.dietitianName,
      scheduledAt: req.body.scheduledAt,
      status: 'PENDING',
      notes: req.body.notes
    };
    consults.push(c);
    return reply.code(201).send({ data: c });
  });

  return app;
}
