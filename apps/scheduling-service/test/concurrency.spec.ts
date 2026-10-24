import { describe, it, expect } from 'vitest';
import { CapacityManager, ReservationResult } from '../src/booking/capacity-manager.js';

describe('Seat Booking Correctness & Concurrency Suite', () => {
  it('should handle 200 concurrent requests for 12 seats -> exactly 12 confirmed, 188 waitlisted', async () => {
    const manager = new CapacityManager();
    const sessionId = 'test-session-oly-12';

    // Initialize session with capacity = 12
    manager.initialize([
      {
        id: sessionId,
        title: 'Olympic Lifting Clinic',
        studioName: 'Studio 4 Oly Lifting',
        coachName: 'Jaxson Hayes',
        startsAt: '2026-10-24T10:00:00Z',
        endsAt: '2026-10-24T11:30:00Z',
        capacity: 12,
        bookedCount: 0,
        waitlistCount: 0,
        version: 1
      }
    ]);

    // Launch 200 concurrent booking requests simultaneously via Promise.all
    const totalRequests = 200;
    const promises: Promise<ReservationResult>[] = [];

    for (let i = 1; i <= totalRequests; i++) {
      const memberId = `member-athlete-${i}`;
      const memberName = `Athlete ${i}`;
      promises.push(manager.reserveSeat(sessionId, memberId, memberName));
    }

    const results = await Promise.all(promises);

    const confirmed = results.filter((r) => r.status === 'CONFIRMED');
    const waitlisted = results.filter((r) => r.status === 'WAITLISTED');
    const rejected = results.filter((r) => r.status === 'REJECTED');

    // Verification of atomic invariants
    expect(confirmed.length).toBe(12);
    expect(waitlisted.length).toBe(188);
    expect(rejected.length).toBe(0);

    const session = manager.getSession(sessionId);
    expect(session?.bookedCount).toBe(12);
    expect(session?.waitlistCount).toBe(188);
  });

  describe('Waitlist Auto-Promotion', () => {
    it('should promote first waitlisted athlete upon confirmed booking cancellation', async () => {
      const manager = new CapacityManager();
      const sessionId = 'session-cap-2';

      manager.initialize([
        {
          id: sessionId,
          title: 'Private Conditioning Pod',
          studioName: 'Studio 1',
          coachName: 'David Kim',
          startsAt: '2026-10-24T12:00:00Z',
          endsAt: '2026-10-24T13:00:00Z',
          capacity: 2,
          bookedCount: 0,
          waitlistCount: 0,
          version: 1
        }
      ]);

      // Fill 2 seats
      const r1 = await manager.reserveSeat(sessionId, 'm-1', 'Athlete One');
      const r2 = await manager.reserveSeat(sessionId, 'm-2', 'Athlete Two');
      expect(r1.status).toBe('CONFIRMED');
      expect(r2.status).toBe('CONFIRMED');

      // Add to waitlist
      const r3 = await manager.reserveSeat(sessionId, 'm-3', 'Athlete Three');
      expect(r3.status).toBe('WAITLISTED');

      // Cancel Athlete One's booking -> Athlete Three should be auto-promoted!
      if (r1.status === 'CONFIRMED') {
        const cancelResult = await manager.cancelBooking(r1.bookingId);
        expect(cancelResult.promotedMemberId).toBe('m-3');

        const session = manager.getSession(sessionId);
        expect(session?.bookedCount).toBe(2); // Still 2 because waitlist athlete filled the vacancy
        expect(session?.waitlistCount).toBe(0);
      }
    });
  });
});
