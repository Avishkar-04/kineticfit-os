import React, { useState } from 'react';
import { Search, Filter, UserPlus, Download, CheckCircle2 } from 'lucide-react';
import { DataTable, Button, BadgeChip, Input } from '@kineticfit/ui';

interface MemberRecord {
  id: string;
  memberNo: string;
  name: string;
  tier: 'STANDARD' | 'PRO' | 'ELITE_BLACK';
  status: 'ACTIVE' | 'EXPIRING' | 'FROZEN';
  trainer: string;
  dietPlan: string;
  adherence: number;
}

export const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState<'ALL' | 'ACTIVE' | 'EXPIRING' | 'FROZEN'>('ALL');

  const members: MemberRecord[] = [
    { id: '1', memberNo: 'KF-1042', name: 'Aria Sterling', tier: 'PRO', status: 'ACTIVE', trainer: 'Elena Rostova', dietPlan: 'Hypertrophy Mass', adherence: 94 },
    { id: '2', memberNo: 'KF-1088', name: 'David Kim', tier: 'PRO', status: 'ACTIVE', trainer: 'Jaxson Hayes', dietPlan: 'Fat Loss Cut', adherence: 88 },
    { id: '3', memberNo: 'KF-1099', name: 'Liam Brooks', tier: 'STANDARD', status: 'ACTIVE', trainer: 'Elena Rostova', dietPlan: 'Endurance Stamina', adherence: 91 },
    { id: '4', memberNo: 'KF-2012', name: 'Alex Rivera', tier: 'STANDARD', status: 'EXPIRING', trainer: 'Maya Lin', dietPlan: 'Keto Metabolic', adherence: 76 },
    { id: '5', memberNo: 'KF-0001', name: 'Marcus Vance', tier: 'ELITE_BLACK', status: 'ACTIVE', trainer: 'Elena Rostova', dietPlan: 'High-Output Performance', adherence: 98 },
    { id: '6', memberNo: 'KF-2045', name: 'Taylor Adams', tier: 'STANDARD', status: 'FROZEN', trainer: 'David Kim', dietPlan: 'Maintenance Protocol', adherence: 65 }
  ];

  const filteredMembers = members.filter((m) => {
    if (activeSegment !== 'ALL' && m.status !== activeSegment) return false;
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()) && !m.memberNo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'name',
      header: 'Athlete',
      render: (m: MemberRecord) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-kf-surface-3 text-kf-lime font-mono font-bold text-xs flex items-center justify-center">
            {m.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="font-display font-semibold text-white">{m.name}</div>
            <div className="font-mono text-[10px] text-kf-text-steel">{m.memberNo}</div>
          </div>
        </div>
      )
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (m: MemberRecord) => (
        <BadgeChip variant={m.tier === 'ELITE_BLACK' ? 'active' : m.tier === 'PRO' ? 'cyan' : 'neutral'}>
          {m.tier === 'ELITE_BLACK' ? 'Elite Black' : m.tier === 'PRO' ? 'Pro Athlete' : 'Standard'}
        </BadgeChip>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (m: MemberRecord) => (
        <span className={`font-mono text-[10px] font-bold ${m.status === 'ACTIVE' ? 'text-kf-lime' : m.status === 'EXPIRING' ? 'text-kf-danger' : 'text-kf-text-steel'}`}>
          {m.status}
        </span>
      )
    },
    { key: 'trainer', header: 'Assigned Trainer' },
    { key: 'dietPlan', header: 'Diet & Nutrition Plan' },
    {
      key: 'adherence',
      header: 'Adherence',
      align: 'right' as const,
      render: (m: MemberRecord) => (
        <div className="font-mono font-bold text-kf-lime">
          {m.adherence}%
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Member Management
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Athletes Directory & Roster
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
            + Register Athlete
          </Button>
        </div>
      </div>

      {/* Segment Tabs + Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-kf-surface-1 border border-kf-border rounded-lg p-3">
        <div className="flex items-center gap-1 bg-kf-surface-lowest p-1 rounded border border-kf-border">
          {(['ALL', 'ACTIVE', 'EXPIRING', 'FROZEN'] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setActiveSegment(seg)}
              className={`px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeSegment === seg ? 'bg-kf-surface-2 text-kf-lime' : 'text-kf-text-steel hover:text-white'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search athlete, RFID, member ID..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Keyset Virtualized Data Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        keyExtractor={(m) => m.id}
        onRowClick={(m) => console.log('Member clicked', m.id)}
      />
    </div>
  );
};
