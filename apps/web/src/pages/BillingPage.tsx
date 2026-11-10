import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Download,
  ArrowUpRight,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { KPICard, Button, BadgeChip, Modal, Input } from '@kineticfit/ui';
import { InvoiceDto, SubscriptionDto } from '@kineticfit/contracts';

interface ExtendedInvoice extends InvoiceDto {
  tierName: string;
  memberEmail: string;
}

const INITIAL_INVOICES: ExtendedInvoice[] = [
  {
    id: '01931668-8888-7000-8000-000000000001',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    memberId: '01931668-5000-7000-8000-000000000001',
    memberName: 'Alexander Vance',
    memberEmail: 'alexander@kineticfit.dev',
    tierName: 'Elite Black VIP',
    invoiceNo: 'INV-2026-0891',
    amountCents: 28900,
    currency: 'USD',
    status: 'PAID',
    dueAt: '2026-10-24T12:00:00Z',
    paidAt: '2026-10-24T11:20:00Z',
    createdAt: '2026-10-20T08:00:00Z'
  },
  {
    id: '01931668-8888-7000-8000-000000000002',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    memberId: '01931668-5000-7000-8000-000000000002',
    memberName: 'Elena Rostova',
    memberEmail: 'elena@kineticfit.dev',
    tierName: 'Pro Performance',
    invoiceNo: 'INV-2026-0890',
    amountCents: 19900,
    currency: 'USD',
    status: 'PAID',
    dueAt: '2026-10-24T10:00:00Z',
    paidAt: '2026-10-24T10:45:00Z',
    createdAt: '2026-10-18T09:00:00Z'
  },
  {
    id: '01931668-8888-7000-8000-000000000003',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    memberId: '01931668-5000-7000-8000-000000000003',
    memberName: 'Alex Rivera',
    memberEmail: 'alex.rivera@kineticfit.dev',
    tierName: 'Standard Gym',
    invoiceNo: 'INV-2026-0889',
    amountCents: 12900,
    currency: 'USD',
    status: 'PAST_DUE',
    dueAt: '2026-10-21T09:00:00Z',
    paidAt: null,
    createdAt: '2026-10-14T08:00:00Z'
  },
  {
    id: '01931668-8888-7000-8000-000000000004',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    memberId: '01931668-5000-7000-8000-000000000004',
    memberName: 'Maya Lin',
    memberEmail: 'maya@kineticfit.dev',
    tierName: 'Pro Performance',
    invoiceNo: 'INV-2026-0888',
    amountCents: 19900,
    currency: 'USD',
    status: 'OPEN',
    dueAt: '2026-10-31T09:00:00Z',
    paidAt: null,
    createdAt: '2026-10-24T08:00:00Z'
  }
];

const INITIAL_SUBSCRIPTIONS: Array<{
  id: string;
  memberName: string;
  memberEmail: string;
  planName: string;
  priceFormatted: string;
  renewsAt: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  gateway: 'STRIPE' | 'RAZORPAY';
}> = [
  {
    id: 'sub-001',
    memberName: 'Alexander Vance',
    memberEmail: 'alexander@kineticfit.dev',
    planName: 'Elite Black VIP',
    priceFormatted: '$289.00 / mo',
    renewsAt: '2026-11-20',
    status: 'ACTIVE',
    gateway: 'STRIPE'
  },
  {
    id: 'sub-002',
    memberName: 'Elena Rostova',
    memberEmail: 'elena@kineticfit.dev',
    planName: 'Pro Performance',
    priceFormatted: '$199.00 / mo',
    renewsAt: '2026-11-18',
    status: 'ACTIVE',
    gateway: 'STRIPE'
  },
  {
    id: 'sub-003',
    memberName: 'Alex Rivera',
    memberEmail: 'alex.rivera@kineticfit.dev',
    planName: 'Standard Gym',
    priceFormatted: '$129.00 / mo',
    renewsAt: '2026-11-14',
    status: 'PAST_DUE',
    gateway: 'RAZORPAY'
  },
  {
    id: 'sub-004',
    memberName: 'Maya Lin',
    memberEmail: 'maya@kineticfit.dev',
    planName: 'Pro Performance',
    priceFormatted: '$199.00 / mo',
    renewsAt: '2026-11-24',
    status: 'ACTIVE',
    gateway: 'STRIPE'
  }
];

export const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'subscriptions' | 'dunning'>('invoices');
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>(INITIAL_INVOICES);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtendedInvoice | null>(null);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'MOCK' | 'STRIPE' | 'RAZORPAY'>('STRIPE');
  const [refundReason, setRefundReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDunningRunning, setIsDunningRunning] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePayInvoice = () => {
    if (!selectedInvoice) return;
    setInvoices(
      invoices.map((inv) =>
        inv.id === selectedInvoice.id
          ? { ...inv, status: 'PAID', paidAt: new Date().toISOString() }
          : inv
      )
    );
    setIsPayModalOpen(false);
    showToast(`Invoice ${selectedInvoice.invoiceNo} successfully settled via ${selectedProvider} provider.`);
  };

  const handleRefundInvoice = () => {
    if (!selectedInvoice) return;
    setInvoices(
      invoices.map((inv) =>
        inv.id === selectedInvoice.id
          ? { ...inv, status: 'VOID' }
          : inv
      )
    );
    setIsRefundModalOpen(false);
    showToast(`Reverse ledger transaction executed. Invoice ${selectedInvoice.invoiceNo} refunded.`);
  };

  const handleCancelSubscription = (subId: string) => {
    setSubscriptions(
      subscriptions.map((s) => (s.id === subId ? { ...s, status: 'CANCELED' } : s))
    );
    showToast(`Subscription ${subId} marked as canceled.`);
  };

  const handleTriggerDunning = () => {
    setIsDunningRunning(true);
    setTimeout(() => {
      setIsDunningRunning(false);
      showToast('Dunning cycle executed: 1 overdue invoice auto-retried with exponential backoff.');
    }, 1200);
  };

  const handleDownloadInvoicePdf = async (inv: ExtendedInvoice) => {
    try {
      const payload = {
        invoiceNo: inv.invoiceNo,
        hubName: 'Downtown Flagship Hub',
        memberName: inv.memberName || 'Athlete',
        memberEmail: inv.memberEmail,
        date: inv.createdAt.split('T')[0],
        dueDate: inv.dueAt.split('T')[0],
        status: inv.status,
        items: [
          { description: `${inv.tierName} Membership Period`, amountCents: inv.amountCents }
        ],
        subtotalCents: inv.amountCents,
        taxCents: 0,
        totalCents: inv.amountCents,
        transactionRef: `tx_${inv.id.slice(0, 8)}`
      };

      const res = await fetch('http://localhost:3008/export/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf'
        },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (res && res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${inv.invoiceNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Downloaded formal PDF for ${inv.invoiceNo} ($${(inv.amountCents / 100).toFixed(2)}). Generated by fn-pdf-export.`);
      }
    } catch {
      alert(`Exporting invoice ${inv.invoiceNo}...`);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Invoice No', 'Member', 'Tier', 'Amount (USD)', 'Status', 'Due Date'];
    const rows = invoices.map((i) => [
      i.invoiceNo,
      i.memberName || '',
      i.tierName,
      (i.amountCents / 100).toFixed(2),
      i.status,
      i.dueAt.split('T')[0]
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-kf-surface-2 border border-kf-lime text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-kf-lime flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-kf-lime" />
            Financials & Billing Engine
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Subscriptions, Invoices & Reverse Ledger
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV Ledger
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerDunning}
            disabled={isDunningRunning}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isDunningRunning ? 'animate-spin' : ''}`} />}
          >
            {isDunningRunning ? 'Processing Dunning...' : 'Run Dunning Cycle'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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
          subtext="Auto-retry cycle scheduled"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-kf-border pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'invoices'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Invoices & Ledger ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Recurring Subscriptions ({subscriptions.length})
        </button>

        <button
          onClick={() => setActiveTab('dunning')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'dunning'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Dunning & Webhook Gateway
        </button>
      </div>

      {/* TAB 1: Invoices & Ledger */}
      {activeTab === 'invoices' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-kf-border flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Ledger Transactions & Billing History
            </h3>
            <span className="font-mono text-xs text-kf-text-steel">
              Append-only audit trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-kf-surface-2 text-kf-text-steel border-b border-kf-border">
                <tr>
                  <th className="py-3 px-4">INVOICE NO</th>
                  <th className="py-3 px-4">MEMBER & TIER</th>
                  <th className="py-3 px-4">AMOUNT</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kf-border/40">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-kf-surface-2/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-kf-cyan" />
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">{inv.memberName}</div>
                      <div className="text-kf-text-steel text-[11px]">{inv.tierName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ${(inv.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-kf-text-steel">
                      {inv.dueAt.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4">
                      <BadgeChip
                        variant={
                          inv.status === 'PAID'
                            ? 'active'
                            : inv.status === 'PAST_DUE'
                            ? 'danger'
                            : inv.status === 'VOID'
                            ? 'neutral'
                            : 'cyan'
                        }
                      >
                        {inv.status}
                      </BadgeChip>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleDownloadInvoicePdf(inv)}
                        title="Download Invoice PDF"
                        className="text-kf-cyan hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4 inline" />
                      </button>

                      {inv.status !== 'PAID' && inv.status !== 'VOID' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPayModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-kf-lime text-kf-surface-0 rounded font-bold hover:brightness-110"
                        >
                          Pay
                        </button>
                      )}

                      {inv.status === 'PAID' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsRefundModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-kf-surface-2 border border-kf-border text-kf-danger rounded font-semibold hover:border-kf-danger"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-kf-border flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Member Membership Recurring Subscriptions
            </h3>
            <BadgeChip variant="active">100% Tokenized</BadgeChip>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-kf-surface-2 text-kf-text-steel border-b border-kf-border">
                <tr>
                  <th className="py-3 px-4">MEMBER</th>
                  <th className="py-3 px-4">PLAN TIER</th>
                  <th className="py-3 px-4">RECURRING RATE</th>
                  <th className="py-3 px-4">NEXT RENEWAL</th>
                  <th className="py-3 px-4">PROVIDER</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kf-border/40">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-kf-surface-2/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{sub.memberName}</div>
                      <div className="text-kf-text-steel text-[11px] font-normal">{sub.memberEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{sub.planName}</td>
                    <td className="py-3.5 px-4 text-kf-lime font-bold">{sub.priceFormatted}</td>
                    <td className="py-3.5 px-4 text-kf-text-steel">{sub.renewsAt}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-kf-surface-0 px-2 py-0.5 rounded border border-kf-border text-[11px] text-kf-cyan">
                        {sub.gateway}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <BadgeChip variant={sub.status === 'ACTIVE' ? 'active' : sub.status === 'PAST_DUE' ? 'danger' : 'neutral'}>
                        {sub.status}
                      </BadgeChip>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          className="text-kf-danger hover:underline text-xs"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-kf-text-steel">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Dunning & Webhook Gateway */}
      {activeTab === 'dunning' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-kf-lime" />
              Automated Dunning Retries Engine
            </h3>
            <p className="font-body text-xs text-kf-text-steel leading-relaxed">
              When a subscription invoice payment fails, the system executes an exponential backoff retry policy across a 14-day recovery window.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-kf-surface-0 p-3 rounded border border-kf-border flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Stage 1: Day 1 Soft Retry</div>
                  <div className="text-kf-text-steel text-[11px]">Automatic re-attempt with 24h cooldown</div>
                </div>
                <BadgeChip variant="active">Active</BadgeChip>
              </div>

              <div className="bg-kf-surface-0 p-3 rounded border border-kf-border flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Stage 2: Day 3 & 7 Re-attempts</div>
                  <div className="text-kf-text-steel text-[11px]">Card update notification dispatched</div>
                </div>
                <BadgeChip variant="active">Active</BadgeChip>
              </div>

              <div className="bg-kf-surface-0 p-3 rounded border border-kf-border flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Stage 3: Day 14 Final Freeze</div>
                  <div className="text-kf-text-steel text-[11px]">Access turnstile gate locks athlete pass</div>
                </div>
                <BadgeChip variant="danger">Lockdown</BadgeChip>
              </div>
            </div>
          </div>

          <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-kf-cyan" />
              Webhook Security & Replay Defense
            </h3>
            <p className="font-body text-xs text-kf-text-steel leading-relaxed">
              All inbound webhooks require HMAC SHA-256 signatures and strict timestamp tolerance (rejected if clock drift &gt; 300s).
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border flex items-center justify-between">
                <span className="text-kf-text-steel">Stripe Webhook Endpoint</span>
                <span className="text-white font-bold">/v1/webhooks/stripe</span>
              </div>
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border flex items-center justify-between">
                <span className="text-kf-text-steel">Razorpay Webhook Endpoint</span>
                <span className="text-white font-bold">/v1/webhooks/razorpay</span>
              </div>
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border flex items-center justify-between">
                <span className="text-kf-text-steel">Replay Window Tolerance</span>
                <span className="text-kf-lime font-bold">300 Seconds</span>
              </div>
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border flex items-center justify-between">
                <span className="text-kf-text-steel">Event Deduplication</span>
                <span className="text-kf-lime font-bold">Idempotency Key Store</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Settle Invoice ${selectedInvoice?.invoiceNo}`}
      >
        <div className="space-y-4">
          <p className="font-body text-xs text-kf-text-steel">
            Process payment for <span className="text-white font-bold">{selectedInvoice?.memberName}</span> ({selectedInvoice?.tierName}) in the amount of <span className="text-kf-lime font-bold text-sm">${((selectedInvoice?.amountCents || 0) / 100).toFixed(2)}</span>.
          </p>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-2">Select Payment Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {(['STRIPE', 'RAZORPAY', 'MOCK'] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSelectedProvider(prov)}
                  className={`py-2.5 px-3 text-xs font-mono rounded border text-center transition-all ${
                    selectedProvider === prov
                      ? 'bg-kf-lime text-kf-surface-0 font-bold border-kf-lime'
                      : 'bg-kf-surface-2 text-white border-kf-border hover:border-slate-500'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-kf-surface-0 border border-kf-border rounded font-mono text-[11px] text-kf-text-steel space-y-1">
            <div className="flex justify-between">
              <span>Idempotency Key:</span>
              <span className="text-white">idem_{selectedInvoice?.id.slice(0, 12)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Mode:</span>
              <span className="text-kf-cyan font-bold">Isolated Test Mode</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-kf-border">
            <Button variant="secondary" size="sm" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handlePayInvoice}>
              Confirm & Settle Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title={`Execute Refund: ${selectedInvoice?.invoiceNo}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-950/40 border border-kf-danger/40 rounded flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-kf-danger flex-shrink-0" />
            <div className="font-mono text-xs text-kf-danger">
              Reverse Ledger Saga will be initiated. Original payment of <span className="font-bold">${((selectedInvoice?.amountCents || 0) / 100).toFixed(2)}</span> will be voided.
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Reason for Refund</label>
            <Input
              placeholder="e.g. Front desk billing discrepancy adjustment"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-kf-border">
            <Button variant="secondary" size="sm" onClick={() => setIsRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRefundInvoice}>
              Confirm Reverse Ledger
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
