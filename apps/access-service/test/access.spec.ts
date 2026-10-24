import { describe, it, expect } from 'vitest';
import { FloorManager } from '../src/server.js';

describe('Access Service & Turnstile Telemetry Suite', () => {
  it('should grant access to active athletes and increment occupancy', () => {
    const floor = new FloorManager();
    const initialOccupancy = floor.occupancy;

    const res = floor.processCheckIn('04:A2:3F:89:C1');
    expect(res.status).toBe('GRANTED');
    expect(res.name).toBe('Aria Sterling');
    expect(res.occupancy).toBe(initialOccupancy + 1);
    expect(floor.occupancy).toBe(initialOccupancy + 1);
  });

  it('should deny access to lapsed athletes without incrementing occupancy', () => {
    const floor = new FloorManager();
    const initialOccupancy = floor.occupancy;

    const res = floor.processCheckIn('04:D1:44:66:F8');
    expect(res.status).toBe('DENIED');
    expect(res.reason).toContain('Lapsed');
    expect(floor.occupancy).toBe(initialOccupancy);
  });

  it('should block all entries when facility lockdown is engaged', () => {
    const floor = new FloorManager();
    floor.isLockdown = true;

    const res = floor.processCheckIn('04:A2:3F:89:C1');
    expect(res.status).toBe('DENIED');
    expect(res.reason).toBe('Facility Lockdown Engaged');
  });
});
