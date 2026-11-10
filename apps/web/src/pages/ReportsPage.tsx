import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Utensils,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { Button, BadgeChip, KPICard } from '@kineticfit/ui';

export const ReportsPage: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('30D');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Category,Metric,Value,Period\nAttendance,Peak Occupancy,288 Athletes,Oct 2026\nRetention,Cohort M1,96.4%,Q3 2026\nPopularity,MetCon Savage Circuit,98.2% Fill Rate,Oct 2026\nNutrition,Macro Adherence,91.8%,Oct 2026';
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `kineticfit-executive-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Executive Report CSV downloaded');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-kf-surface-2 border border-kf-lime text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-kf-lime flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-kf-lime" />
            Executive Intelligence & Analytics
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Operational Reports & Retention Cohorts
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast('Scheduled weekly PDF email digest configured for director@kineticfit.dev')}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
          >
            Schedule Digest
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Comprehensive Report
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="M1 Retention Rate"
          value="96.4%"
          delta={{ value: '+1.8%', isPositive: true, period: 'vs target' }}
          chip={<BadgeChip variant="active">High</BadgeChip>}
          subtext="Industry benchmark: 88%"
        />
        <KPICard
          label="Avg Peak Saturation"
          value="82.4%"
          delta={{ value: '18:00 - 19:00', isPositive: true, period: 'Peak' }}
          chip={<BadgeChip variant="cyan">Nominal</BadgeChip>}
          subtext="Cap: 300 athletes"
        />
        <KPICard
          label="Class Fill Ratio"
          value="94.2%"
          delta={{ value: '+3.1%', isPositive: true, period: 'MoM' }}
          chip={<BadgeChip variant="active">196 Classes</BadgeChip>}
          subtext="Zero waitlist dropouts"
        />
        <KPICard
          label="Diet Adherence Index"
          value="91.8%"
          delta={{ value: '+4.2%', isPositive: true, period: 'MoM' }}
          chip={<BadgeChip variant="active">Kitchen Lab</BadgeChip>}
          subtext="14 Active Protocols"
        />
      </div>

      {/* Heatmap & Popularity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Heatmap Simulation (7 Cols) */}
        <div className="lg:col-span-7 bg-kf-surface-1 border border-kf-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Hourly Facility Saturation Heatmap
            </h3>
            <span className="font-mono text-xs text-kf-text-steel">7-Day Aggregated</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {[
              { time: '06:00 - 08:00 (Dawn Peak)', count: 245, pct: 81, color: 'bg-kf-lime' },
              { time: '08:00 - 11:00 (Mid-Morning)', count: 140, pct: 46, color: 'bg-kf-cyan' },
              { time: '11:00 - 14:00 (Lunch MetCon)', count: 195, pct: 65, color: 'bg-kf-cyan' },
              { time: '14:00 - 17:00 (Off-Peak Recovery)', count: 85, pct: 28, color: 'bg-kf-surface-3' },
              { time: '17:00 - 20:00 (Evening Surge)', count: 288, pct: 96, color: 'bg-amber-400' },
              { time: '20:00 - 23:00 (Night Reset)', count: 62, pct: 20, color: 'bg-kf-surface-3' }
            ].map((slot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-kf-text-steel text-[11px]">
                  <span className="text-white font-semibold">{slot.time}</span>
                  <span>{slot.count} Athletes ({slot.pct}%)</span>
                </div>
                <div className="w-full bg-kf-surface-0 h-2 rounded-full overflow-hidden">
                  <div className={`${slot.color} h-full rounded-full`} style={{ width: `${slot.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popularity Rankings (5 Cols) */}
        <div className="lg:col-span-5 bg-kf-surface-1 border border-kf-border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-bold text-base text-white">
            Class Popularity &amp; Waitlist Demand
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { name: 'MetCon Savage Circuit', trainer: 'Elena Rostova', fill: '99.4%', waitlist: 18 },
              { name: 'Olympic Weightlifting Clinic', trainer: 'Jaxson Hayes', fill: '98.1%', waitlist: 14 },
              { name: 'Rhythm Spin 45', trainer: 'David Kim', fill: '95.6%', waitlist: 9 },
              { name: 'Power Vinyasa Flow', trainer: 'Maya Lin', fill: '92.0%', waitlist: 4 }
            ].map((c, idx) => (
              <div key={idx} className="p-3 bg-kf-surface-2 border border-kf-border rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-kf-text-steel">{c.trainer}</div>
                </div>
                <div className="text-right">
                  <div className="text-kf-lime font-bold">{c.fill} Fill</div>
                  <div className="text-[10px] text-kf-cyan font-semibold">+{c.waitlist} Waitlist</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

