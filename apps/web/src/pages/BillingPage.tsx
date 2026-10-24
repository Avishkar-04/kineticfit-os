import React from 'react';
import { CreditCard, DollarSign, Download, ArrowUpRight, FileCheck, RefreshCw } from 'lucide-react';
import { KPICard, Button, BadgeChip } from '@kineticfit/ui';

export const BillingPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Revenue & Ledger
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Financials, Billing & Invoicing
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Financial Ledger
          </Button>
          <Button variant="primary" size="sm">
            Run Dunning Cycle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total MRR"
          value="$246,820"
          delta={{ value: '+6.1%', isPositive: true, period: 'MoM' }}
          chip={<BadgeChip variant="active">USD</BadgeChip>}
          subtext="Net collection rate: 99.4%"
        />
        <KPICard
          label="Annual Run Rate (ARR)"
          value="$2.96M"
          delta={{ value: '+14.2%', isPositive: true, period: 'YoY' }}
          chip={<BadgeChip variant="active">Pro-Forma</BadgeChip>}
          subtext="Target: $3.2M"
        />
        <KPICard
          label="Active Subscriptions"
          value="1,680"
          delta={{ value: '+42', isPositive: true, period: 'Net this month' }}
          chip={<BadgeChip variant="cyan">3 Tiers</BadgeChip>}
          subtext="Churn rate: 1.2%"
        />
        <KPICard
          label="Past Due / In Dunning"
          value="$3,820"
          delta={{ value: '-12%', isPositive: true, period: 'Resolved' }}
          chip={<BadgeChip variant="danger">14 Accounts</BadgeChip>}
          subtext="Auto-retry cycle in 4h"
        />
      </div>

      <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Recent Ledger Invoices</h3>
        <p className="font-body text-xs text-kf-text-steel">
          Append-only financial entries synchronized with payment provider webhooks (Stripe / Razorpay test mode).
        </p>

        <div className="font-mono text-xs divide-y divide-kf-border/40">
          {[
            { id: 'INV-2026-0891', member: 'Aria Sterling', tier: 'Pro Performance', amount: '$199.00', status: 'PAID', date: '2026-10-24 11:20' },
            { id: 'INV-2026-0890', member: 'David Kim', tier: 'Pro Performance', amount: '$199.00', status: 'PAID', date: '2026-10-24 10:45' },
            { id: 'INV-2026-0889', member: 'Alex Rivera', tier: 'Standard Gym', amount: '$129.00', status: 'PAST_DUE', date: '2026-10-24 09:15' },
            { id: 'INV-2026-0888', member: 'Marcus Vance', tier: 'Elite Black VIP', amount: '$289.00', status: 'PAID', date: '2026-10-24 08:30' }
          ].map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="text-white font-bold">{inv.id}</span>
                <span className="text-kf-text-steel ml-3">{inv.member} ({inv.tier})</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">{inv.amount}</span>
                <BadgeChip variant={inv.status === 'PAID' ? 'active' : 'danger'}>
                  {inv.status}
                </BadgeChip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
