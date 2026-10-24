import { describe, it, expect, beforeEach } from 'vitest';
import { buildNutritionApp } from './index.js';
import { FastifyInstance } from 'fastify';

describe('Nutrition Service', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildNutritionApp();
  });

  it('lists default seeded diet protocols', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/protocols'
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.count).toBeGreaterThanOrEqual(2);
    expect(body.data[0].title).toBe('Hypertrophy Surge 3200');
  });

  it('creates a new diet protocol and increments version on update', async () => {
    // 1. Create protocol v1
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/protocols',
      payload: {
        title: 'Keto Cyclical 2500',
        category: 'KETOGENIC',
        kcalTarget: 2500,
        proteinGrams: 160,
        carbGrams: 40,
        fatGrams: 190,
        tier: 'PRO',
        meals: [
          {
            name: 'Breakfast Butter Coffee & Eggs',
            timeOffsetMinutes: 30,
            macrosJson: { calories: 700, protein: 35, carbs: 4, fat: 60 }
          }
        ]
      }
    });

    expect(createRes.statusCode).toBe(201);
    const v1 = JSON.parse(createRes.body).data;
    expect(v1.version).toBe(1);
    expect(v1.title).toBe('Keto Cyclical 2500');

    // 2. Create version bump (v2)
    const versionRes = await app.inject({
      method: 'POST',
      url: `/v1/protocols/${v1.id}/version`,
      payload: {
        kcalTarget: 2600,
        fatGrams: 200
      }
    });

    expect(versionRes.statusCode).toBe(201);
    const v2 = JSON.parse(versionRes.body).data;
    expect(v2.version).toBe(2);
    expect(v2.kcalTarget).toBe(2600);
    expect(v2.fatGrams).toBe(200);

    // Verify v1 remained immutable in memory
    const fetchV1 = await app.inject({
      method: 'GET',
      url: `/v1/protocols/${v1.id}`
    });
    expect(JSON.parse(fetchV1.body).data.version).toBe(1);
    expect(JSON.parse(fetchV1.body).data.kcalTarget).toBe(2500);
  });

  it('calculates circadian chrono-nutritional timeline windows and macro fulfillment', async () => {
    const listRes = await app.inject({ method: 'GET', url: '/v1/protocols' });
    const p1Id = JSON.parse(listRes.body).data[0].id;

    const timelineRes = await app.inject({
      method: 'GET',
      url: `/v1/protocols/${p1Id}/timeline`
    });

    expect(timelineRes.statusCode).toBe(200);
    const timeline = JSON.parse(timelineRes.body);
    expect(timeline.protocolTitle).toBe('Hypertrophy Surge 3200');
    expect(timeline.timeline.length).toBe(5);
    expect(timeline.timeline[0].circadianWindow).toBe('CORTISOL_SYNC_AWAKENING');
    expect(timeline.timeline[0].clockTime).toBe('07:30');
    expect(timeline.macroFulfillment.proteinPct).toBeGreaterThan(0);
  });

  it('accurately calculates TDEE and macro splits for goals', async () => {
    const calcRes = await app.inject({
      method: 'POST',
      url: '/v1/macros/calculate',
      payload: {
        weightKg: 85,
        heightCm: 182,
        age: 28,
        gender: 'MALE',
        activityFactor: 1.55,
        goal: 'HYPERTROPHY'
      }
    });

    expect(calcRes.statusCode).toBe(200);
    const data = JSON.parse(calcRes.body);
    expect(data.bmr).toBeGreaterThan(1800);
    expect(data.tdee).toBeGreaterThan(2700);
    expect(data.targetCalories).toBeGreaterThan(data.tdee); // surplus for hypertrophy
    expect(data.macros.proteinGrams).toBe(187); // 85 * 2.2 = 187g
    expect(data.macros.fatGrams).toBe(72); // 85 * 0.85 = 72g
    expect(data.macros.carbGrams).toBeGreaterThan(300);
  });

  it('records InBody body composition assessments and computes trend deltas', async () => {
    const memberId = '01931668-5000-7000-8000-000000000099';

    // First scan: higher body fat, lower muscle
    await app.inject({
      method: 'POST',
      url: '/v1/assessments',
      payload: {
        memberId,
        bodyFatPercentage: 18.5,
        muscleMassKg: 37.0,
        bmi: 25.0,
        scannedAt: '2026-08-01T10:00:00Z'
      }
    });

    // Second scan: recomp progress
    await app.inject({
      method: 'POST',
      url: '/v1/assessments',
      payload: {
        memberId,
        bodyFatPercentage: 14.2,
        muscleMassKg: 39.8,
        bmi: 24.1,
        scannedAt: '2026-10-01T10:00:00Z'
      }
    });

    const getRes = await app.inject({
      method: 'GET',
      url: `/v1/assessments/${memberId}`
    });

    expect(getRes.statusCode).toBe(200);
    const body = JSON.parse(getRes.body);
    expect(body.data.length).toBe(2);
    expect(body.trends.fatLossPctDelta).toBe(-4.3);
    expect(body.trends.muscleGainKgDelta).toBe(2.8);
    expect(body.trends.bmiDelta).toBe(-0.9);
  });
});
