import crypto from 'node:crypto';

export interface ClassSessionRecord {
  id: string;
  title: string;
  studioName: string;
  coachName: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  version: number;
}

export interface BookingRecord {
  id: string;
  sessionId: string;
  memberId: string;
  memberName: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: number;
}

export interface WaitlistRecord {
  id: string;
  sessionId: string;
  memberId: string;
  memberName: string;
  position: number;
  createdAt: number;
}

export type ReservationResult =
  | { status: 'CONFIRMED'; bookingId: string; bookedCount: number; capacity: number }
  | { status: 'WAITLISTED'; waitlistId: string; position: number }
  | { status: 'REJECTED'; reason: string };

export class CapacityManager {
  private sessions = new Map<string, ClassSessionRecord>();
  private bookings = new Map<string, BookingRecord>(); // bookingId -> BookingRecord
  private sessionBookings = new Map<string, Set<string>>(); // sessionId -> Set<memberId>
  private waitlists = new Map<string, WaitlistRecord[]>(); // sessionId -> WaitlistRecord[]
  private lockQueues = new Map<string, Promise<void>>();

  public initialize(sessions: ClassSessionRecord[]): void {
    for (const s of sessions) {
      this.sessions.set(s.id, { ...s });
      this.sessionBookings.set(s.id, new Set());
      this.waitlists.set(s.id, []);
    }
  }

  public getSession(id: string): ClassSessionRecord | undefined {
    return this.sessions.get(id);
  }

  public getAllSessions(): ClassSessionRecord[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Serializes per-session booking mutations to simulate database row-level locking
   * (e.g. `UPDATE class_sessions SET booked_count = booked_count + 1 WHERE id = $1 AND booked_count < capacity`)
   */
  private async acquireSessionLock<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
    const prevLock = this.lockQueues.get(sessionId) || Promise.resolve();
    let resolveLock: () => void;
    const currentLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    this.lockQueues.set(sessionId, currentLock);

    try {
      await prevLock;
      return await fn();
    } finally {
      resolveLock!();
      if (this.lockQueues.get(sessionId) === currentLock) {
        this.lockQueues.delete(sessionId);
      }
    }
  }

  /**
   * Atomic seat booking method
   */
  public async reserveSeat(
    sessionId: string,
    memberId: string,
    memberName: string
  ): Promise<ReservationResult> {
    return this.acquireSessionLock(sessionId, async () => {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return { status: 'REJECTED', reason: 'Class session not found' };
      }

      const activeMembers = this.sessionBookings.get(sessionId)!;
      if (activeMembers.has(memberId)) {
        return { status: 'REJECTED', reason: 'Athlete already has an active reservation for this session' };
      }

      // Atomic check: booked_count < capacity
      if (session.bookedCount < session.capacity) {
        session.bookedCount++;
        session.version++;
        activeMembers.add(memberId);

        const bookingId = crypto.randomUUID();
        this.bookings.set(bookingId, {
          id: bookingId,
          sessionId,
          memberId,
          memberName,
          status: 'CONFIRMED',
          createdAt: Date.now()
        });

        return {
          status: 'CONFIRMED',
          bookingId,
          bookedCount: session.bookedCount,
          capacity: session.capacity
        };
      } else {
        // Capacity full -> add to waitlist queue
        const waitlist = this.waitlists.get(sessionId)!;
        const waitlistId = crypto.randomUUID();
        const position = waitlist.length + 1;

        waitlist.push({
          id: waitlistId,
          sessionId,
          memberId,
          memberName,
          position,
          createdAt: Date.now()
        });

        session.waitlistCount = waitlist.length;
        session.version++;

        return {
          status: 'WAITLISTED',
          waitlistId,
          position
        };
      }
    });
  }

  /**
   * Cancels a booking and automatically promotes the next waitlisted athlete
   */
  public async cancelBooking(bookingId: string): Promise<{ promotedMemberId?: string; booking: BookingRecord }> {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.status === 'CANCELLED') {
      throw new Error('Booking not found or already cancelled');
    }

    return this.acquireSessionLock(booking.sessionId, async () => {
      const session = this.sessions.get(booking.sessionId)!;
      const activeMembers = this.sessionBookings.get(booking.sessionId)!;

      booking.status = 'CANCELLED';
      activeMembers.delete(booking.memberId);

      const waitlist = this.waitlists.get(booking.sessionId)!;
      if (waitlist.length > 0) {
        // Auto-promote top athlete from waitlist
        const nextInLine = waitlist.shift()!;
        activeMembers.add(nextInLine.memberId);

        const promotedBookingId = crypto.randomUUID();
        this.bookings.set(promotedBookingId, {
          id: promotedBookingId,
          sessionId: session.id,
          memberId: nextInLine.memberId,
          memberName: nextInLine.memberName,
          status: 'CONFIRMED',
          createdAt: Date.now()
        });

        // Re-index remaining positions
        waitlist.forEach((w, idx) => (w.position = idx + 1));
        session.waitlistCount = waitlist.length;
        session.version++;

        return { promotedMemberId: nextInLine.memberId, booking };
      } else {
        session.bookedCount = Math.max(0, session.bookedCount - 1);
        session.version++;
        return { booking };
      }
    });
  }
}
