import React from 'react';
import { Radio, ShieldAlert, CheckCircle2, XCircle, Activity, Lock } from 'lucide-react';
import { Button, BadgeChip } from '@kineticfit/ui';

export const AccessPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Turnstile Management
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Access Control, Gates & Floor Telemetry
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" leftIcon={<Lock className="w-3.5 h-3.5" />}>
            Engage Facility Lockdown
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Lane 01 — Biometric & RFID East', status: 'ONLINE', latency: '1.2ms', checkins: 284 },
          { name: 'Lane 02 — Turnstile RFID Central', status: 'ONLINE', latency: '1.4ms', checkins: 198 },
          { name: 'Lane 03 — VIP Lift Pod & Plunge', status: 'ONLINE', latency: '0.9ms', checkins: 42 }
        ].map((gate, i) => (
          <div key={i} className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <BadgeChip variant="active">{gate.status}</BadgeChip>
              <span className="font-mono text-xs text-kf-cyan font-bold">{gate.latency}</span>
            </div>
            <h3 className="font-display font-bold text-sm text-white">{gate.name}</h3>
            <div className="font-mono text-xs text-kf-text-steel pt-2 border-t border-kf-border/60">
              Today's Throughput: <strong className="text-white">{gate.checkins} athletes</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
