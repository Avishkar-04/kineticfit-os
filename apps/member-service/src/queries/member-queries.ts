export interface MemberQueryOptions {
  search?: string;
  status?: string;
  tier?: string;
  limit?: number;
  cursor?: string; // Keyset cursor based on ID or timestamp
}

export interface MemberRecord {
  id: string;
  memberNo: string;
  name: string;
  email: string;
  rfidUid: string;
  tier: 'STANDARD' | 'PRO' | 'ELITE_BLACK';
  status: 'ACTIVE' | 'EXPIRING' | 'FROZEN';
  trainerName?: string;
  dietPlanName?: string;
  adherencePercentage: number;
  joinedAt: string;
}

export class MemberRegistry {
  private members = new Map<string, MemberRecord>();

  public initialize(seedMembers: MemberRecord[]): void {
    for (const m of seedMembers) {
      this.members.set(m.id, m);
    }
  }

  public findById(id: string): MemberRecord | undefined {
    return this.members.get(id);
  }

  public findByRfid(rfid: string): MemberRecord | undefined {
    const target = rfid.trim().toUpperCase();
    return Array.from(this.members.values()).find((m) => m.rfidUid.toUpperCase() === target);
  }

  public save(member: MemberRecord): void {
    this.members.set(member.id, member);
  }

  public remove(id: string): void {
    this.members.delete(id);
  }

  // Keyset cursor-based pagination
  public query(options: MemberQueryOptions = {}): {
    items: MemberRecord[];
    nextCursor: string | null;
    total: number;
  } {
    let list = Array.from(this.members.values());

    if (options.status && options.status !== 'ALL') {
      list = list.filter((m) => m.status === options.status);
    }

    if (options.tier && options.tier !== 'ALL') {
      list = list.filter((m) => m.tier === options.tier);
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.memberNo.toLowerCase().includes(q) ||
          m.rfidUid.toLowerCase().includes(q)
      );
    }

    // Sort by id for deterministic keyset pagination
    list.sort((a, b) => a.id.localeCompare(b.id));

    // Apply cursor
    if (options.cursor) {
      const idx = list.findIndex((m) => m.id === options.cursor);
      if (idx !== -1) {
        list = list.slice(idx + 1);
      }
    }

    const limit = Math.min(options.limit || 50, 100);
    const paged = list.slice(0, limit);
    const nextCursor = paged.length === limit ? paged[paged.length - 1].id : null;

    return {
      items: paged,
      nextCursor,
      total: list.length
    };
  }
}

