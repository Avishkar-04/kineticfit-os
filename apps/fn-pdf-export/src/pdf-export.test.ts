import { describe, it, expect, beforeEach } from 'vitest';
import { buildPdfExportApp } from './index.js';
import { FastifyInstance } from 'fastify';

describe('PDF & CSV Export Function Service (fn-pdf-export)', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildPdfExportApp();
  });

  it('exposes health probe with PDF and CSV export capabilities', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.service).toBe('fn-pdf-export');
    expect(body.stateless).toBe(true);
    expect(body.capabilities).toContain('pdf:meal-guide');
    expect(body.capabilities).toContain('pdf:invoice');
  });

  it('generates a valid Meal Guide PDF with %PDF header magic bytes', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/export/meal-guide',
      headers: { accept: 'application/pdf' },
      payload: {
        protocolTitle: 'Hypertrophy Surge 3200',
        category: 'MASS_GAIN',
        tier: 'ELITE_BLACK',
        targetKcal: 3200,
        proteinGrams: 220,
        carbGrams: 380,
        fatGrams: 75,
        memberName: 'Alexander Vance',
        meals: [
          {
            name: 'Anabolic Dawn Breakfast',
            timeOffsetMinutes: 30,
            clockTime: '07:30',
            calories: 850,
            protein: 55,
            carbs: 95,
            fat: 22,
            prepNotes: 'Eggs and oat porridge'
          },
          {
            name: 'Mid-Morning Fuel',
            timeOffsetMinutes: 180,
            clockTime: '10:00',
            calories: 550,
            protein: 40,
            carbs: 65,
            fat: 12
          }
        ]
      }
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    const buffer = res.rawPayload;
    expect(buffer.length).toBeGreaterThan(1000);
    // PDF Magic Bytes: %PDF
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('generates a valid Invoice PDF with line items and subtotal/total calculations', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/export/invoice',
      headers: { accept: 'application/pdf' },
      payload: {
        invoiceNo: 'INV-2026-0001',
        hubName: 'Downtown Flagship',
        memberName: 'Alexander Vance',
        memberEmail: 'alexander@kineticfit.dev',
        date: '2026-10-15',
        dueDate: '2026-10-22',
        status: 'PAID',
        items: [
          { description: 'Elite Black VIP Membership - Monthly', amountCents: 24900 },
          { description: 'Locker Rental & Towel Service', amountCents: 2500 }
        ],
        subtotalCents: 27400,
        taxCents: 0,
        totalCents: 27400,
        transactionRef: 'ch_stripe_mock_987654'
      }
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    const buffer = res.rawPayload;
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('generates a landscape Timetable PDF for weekly class schedule', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/export/timetable',
      payload: {
        hubName: 'Downtown Flagship',
        weekLabel: 'Week of Oct 24, 2026',
        classes: [
          {
            day: 'Monday',
            time: '06:00 - 06:45',
            title: 'Morning Ignite HIIT',
            trainer: 'Jaxson Hayes',
            room: 'Studio 1 MetCon',
            capacity: 24
          },
          {
            day: 'Monday',
            time: '07:15 - 08:15',
            title: 'Power Vinyasa Flow',
            trainer: 'Maya Lin',
            room: 'Studio 2 Yoga',
            capacity: 18
          }
        ]
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.mimeType).toBe('application/pdf');
    expect(body.sizeBytes).toBeGreaterThan(1000);
    expect(body.base64).toBeTruthy();
  });

  it('generates clean sanitized CSV export', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/export/csv',
      payload: {
        headers: ['Member No', 'Full Name', 'Tier', 'Status', 'Notes'],
        rows: [
          ['KF-1001', 'Vance, Alexander', 'ELITE_BLACK', 'ACTIVE', 'VIP "Gold" athlete'],
          ['KF-1002', 'Rostova, Elena', 'PRO', 'ACTIVE', 'Strength coach']
        ]
      }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.rowCount).toBe(2);
    expect(body.csv).toContain('"Vance, Alexander"');
    expect(body.csv).toContain('"VIP ""Gold"" athlete"');
  });
});

