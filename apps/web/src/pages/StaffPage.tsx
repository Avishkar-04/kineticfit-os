import React from 'react';
import { ShieldCheck, Calendar, UserPlus, Phone, Award } from 'lucide-react';
import { Button, BadgeChip } from '@kineticfit/ui';

export const StaffPage: React.FC = () => {
  const staff = [
    { name: 'Elena Rostova', role: 'Strength Master Coach', status: 'ON FLOOR', zone: 'Studio 1 MetCon', certs: 'CSCS, USAW L3' },
    { name: 'David Kim', role: 'Conditioning Specialist', status: 'ON FLOOR', zone: 'Studio 3 Cycle', certs: 'NSCA-CPT' },
    { name: 'Jaxson Hayes', role: 'Lead Strength Specialist', status: 'OFF DUTY', zone: 'Studio 4 Oly', certs: 'CSCS, FMS' },
    { name: 'Maya Lin', role: 'Mobility & Yoga Coach', status: 'ON FLOOR', zone: 'Studio 2 Yoga', certs: 'RYT-500' },
    { name: 'Dr. Aris Thorne', role: 'Sports Dietitian & Lab Lead', status: 'CONSULT', zone: 'Kitchen Lab', certs: 'RD, CSSD, PhD' },
    { name: 'Soren Lindqvist', role: 'Recovery & Hydro Specialist', status: 'ON FLOOR', zone: 'Recovery Zone', certs: 'BSc Kin, ART' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Personnel Directory
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Trainers & Athletic Specialists
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            Cover Requests (0)
          </Button>
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
            + Invite Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s, idx) => (
          <div key={idx} className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <BadgeChip variant={s.status === 'ON FLOOR' ? 'active' : s.status === 'CONSULT' ? 'cyan' : 'neutral'}>
                {s.status}
              </BadgeChip>
              <span className="font-mono text-[11px] text-kf-text-steel">{s.zone}</span>
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-white">{s.name}</h3>
              <p className="font-body text-xs text-kf-lime mt-0.5">{s.role}</p>
            </div>

            <div className="pt-2 border-t border-kf-border/60 flex items-center justify-between font-mono text-[11px] text-kf-text-steel">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-kf-text-steel" />
                {s.certs}
              </span>
              <button className="text-kf-lime hover:underline">View Roster</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
