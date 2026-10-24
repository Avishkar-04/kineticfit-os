import React from 'react';
import {
  Users,
  Radio,
  DollarSign,
  Utensils,
  Calendar,
  Zap,
  Activity,
  Flame,
  Clock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { KPICard, BadgeChip, ProgressRing, Button } from '@kineticfit/ui';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live Telemetry Stream Strip */}
      <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-kf-lime/10 border border-kf-lime/30 text-kf-lime">
            <span className="w-2 h-2 rounded-full bg-kf-lime animate-pulse" />
            <span className="font-bold">LIVE TELEMETRY STREAM</span>
          </div>
          <span className="text-kf-text-steel">Node: DOWNTOWN-FLAGSHIP-01</span>
          <span className="text-kf-text-steel">•</span>
          <span className="text-white">Refresh 1.2s</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-kf-cyan flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Peak Surge Forecast: 42 min
          </span>
          <Button variant="secondary" size="sm">
            Sync RFID Nodes
          </Button>
          <Button variant="primary" size="sm">
            Broadcast PA
          </Button>
        </div>
      </div>

      {/* 5 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="Active Athletes"
          value="1,680"
          delta={{ value: '+4.2%', isPositive: true, period: 'MoM' }}
          chip={<BadgeChip variant="active">Roster</BadgeChip>}
          subtext="Target: 1,800 (+120)"
        />
        <KPICard
          label="Today's Check-ins"
          value="482"
          delta={{ value: '+18.5%', isPositive: true, period: 'vs avg' }}
          chip={<BadgeChip variant="cyan">Peak 18:00</BadgeChip>}
          subtext="Turnstile A/B: 99.8% flow"
        />
        <KPICard
          label="Current MRR"
          value="$246,820"
          delta={{ value: '+6.1%', isPositive: true, period: 'MoM' }}
          chip={<BadgeChip variant="active">USD</BadgeChip>}
          subtext="Expected: $252,000"
        />
        <KPICard
          label="Diet & Coaching"
          value="640"
          delta={{ value: '+2.8%', isPositive: true, period: '30d' }}
          chip={<BadgeChip variant="cyan">38% Roster</BadgeChip>}
          subtext="Consult Queue: 12 pending"
        />
        <KPICard
          label="Class Fill Rate"
          value="92.4%"
          delta={{ value: '+3.1%', isPositive: true, period: 'Weekly' }}
          chip={<BadgeChip variant="active">14 Sessions</BadgeChip>}
          subtext="Waitlist total: 34 athletes"
        />
      </div>

      {/* Main Grid: Floor Saturation Ring + Turnstile Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Saturation & Sector Congestion (7 Cols) */}
        <div className="lg:col-span-7 bg-kf-surface-1 border border-kf-border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
                Telemetry Overview
              </div>
              <h2 className="font-display font-bold text-xl text-white mt-0.5">
                Live Gym Floor Saturation
              </h2>
            </div>
            <BadgeChip variant="cyan">Lane 01 / 02 Active</BadgeChip>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            <ProgressRing value={74} size={150} strokeWidth={8} color="lime" sublabel="Saturation" />

            <div className="space-y-3 font-mono text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between gap-6 pb-2 border-b border-kf-border">
                <span className="text-kf-text-steel">On-Site Athletes</span>
                <span className="font-bold text-white text-sm">222 / 300</span>
              </div>
              <div className="flex items-center justify-between gap-6 pb-2 border-b border-kf-border">
                <span className="text-kf-text-steel">Avg Dwell Duration</span>
                <span className="text-kf-cyan font-bold">54 minutes</span>
              </div>
              <div className="flex items-center justify-between gap-6 pb-2 border-b border-kf-border">
                <span className="text-kf-text-steel">Air Quality Index</span>
                <span className="text-kf-lime font-bold">412 ppm (optimal)</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-kf-text-steel">Predicted Redline</span>
                <span className="text-kf-danger font-bold">18:42 PST (+14%)</span>
              </div>
            </div>
          </div>

          {/* 4 Sector Congestion Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-kf-surface-lowest border border-kf-border rounded">
              <div className="font-mono text-[10px] text-kf-text-steel uppercase tracking-wider">Free Weights</div>
              <div className="font-display font-bold text-lg text-white mt-1">88%</div>
              <div className="w-full bg-kf-surface-3 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-kf-danger h-full w-[88%]" />
              </div>
            </div>
            <div className="p-3 bg-kf-surface-lowest border border-kf-border rounded">
              <div className="font-mono text-[10px] text-kf-text-steel uppercase tracking-wider">Recovery Plunge</div>
              <div className="font-display font-bold text-lg text-white mt-1">62%</div>
              <div className="w-full bg-kf-surface-3 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-kf-cyan h-full w-[62%]" />
              </div>
            </div>
            <div className="p-3 bg-kf-surface-lowest border border-kf-border rounded">
              <div className="font-mono text-[10px] text-kf-text-steel uppercase tracking-wider">Cardio Deck</div>
              <div className="font-display font-bold text-lg text-white mt-1">54%</div>
              <div className="w-full bg-kf-surface-3 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-kf-lime h-full w-[54%]" />
              </div>
            </div>
            <div className="p-3 bg-kf-surface-lowest border border-kf-border rounded">
              <div className="font-mono text-[10px] text-kf-text-steel uppercase tracking-wider">Functional Turf</div>
              <div className="font-display font-bold text-lg text-white mt-1">79%</div>
              <div className="w-full bg-kf-surface-3 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-kf-lime h-full w-[79%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Turnstile Stream Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-kf-surface-1 border border-kf-border rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
                  Access Stream
                </div>
                <h3 className="font-display font-bold text-lg text-white mt-0.5">
                  Live Turnstile Feeds
                </h3>
              </div>
              <BadgeChip variant="active">Lane 01 / 02</BadgeChip>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {[
                { time: '13:38:12', name: 'Aria Sterling', id: 'KF-1042', tier: 'PRO', status: 'GRANTED' },
                { time: '13:37:45', name: 'Marcus Vance', id: 'KF-0001', tier: 'ELITE_BLACK', status: 'GRANTED' },
                { time: '13:36:20', name: 'David Kim', id: 'KF-1088', tier: 'PRO', status: 'GRANTED' },
                { time: '13:35:04', name: 'Liam Brooks', id: 'KF-1099', tier: 'STANDARD', status: 'GRANTED' },
                { time: '13:33:18', name: 'Alex Rivera', id: 'KF-2012', tier: 'STANDARD', status: 'DENIED', reason: 'Lapsed' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-kf-surface-lowest border border-kf-border rounded flex items-center justify-between hover:bg-kf-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-kf-text-steel text-[11px]">{item.time}</span>
                    <span className="font-display font-semibold text-white">{item.name}</span>
                    <span className="text-[10px] text-kf-text-steel">({item.id})</span>
                  </div>

                  <div>
                    {item.status === 'GRANTED' ? (
                      <span className="text-[10px] text-kf-lime bg-kf-lime/10 px-2 py-0.5 rounded border border-kf-lime/20 font-bold">
                        PASS
                      </span>
                    ) : (
                      <span className="text-[10px] text-kf-danger bg-kf-danger/10 px-2 py-0.5 rounded border border-kf-danger/20 font-bold">
                        DENIED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-kf-border flex items-center justify-between font-mono text-xs">
            <span className="text-kf-text-steel">99.8% Turnstile Uptime</span>
            <span className="text-kf-lime flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              1.4ms verify
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
