import React, { useState } from 'react';
import {
  Activity,
  Server,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Flag,
  ArrowRight,
  RotateCcw,
  Trash2,
  Sliders,
  Layers,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { Button, BadgeChip, KPICard, Modal } from '@kineticfit/ui';

interface DLQMessage {
  id: string;
  queue: string;
  routingKey: string;
  error: string;
  retryCount: number;
  payload: string;
  timestamp: string;
}

const INITIAL_DLQ: DLQMessage[] = [
  {
    id: 'msg-dlq-001',
    queue: 'kf.billing.invoices.dlq',
    routingKey: 'billing.invoice.issue.v1',
    error: 'Bank gateway timeout after 3 retries (504 Gateway Timeout)',
    retryCount: 3,
    payload: '{"memberId":"01931668-5000-7000-8000-000000000088","amountCents":14900,"provider":"STRIPE"}',
    timestamp: '2026-10-24 10:14:22'
  }
];

export const SystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'dlq' | 'sagas' | 'flags'>('health');
  const [dlqMessages, setDlqMessages] = useState<DLQMessage[]>(INITIAL_DLQ);
  const [selectedDlq, setSelectedDlq] = useState<DLQMessage | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Feature Flags State
  const [flags, setFlags] = useState([
    { key: 'new_timetable_view', name: 'Interactive Weekly Timetable Drag & Drop', enabled: true, desc: 'Enables visual drag rescheduling for Ops Directors' },
    { key: 'ai_meal_suggestions', name: 'Kitchen Lab AI Meal Formulation', enabled: true, desc: 'Generates real-time macronutrient substitutions' },
    { key: 'waitlist_auto_promote', name: 'Atomic Waitlist Auto-Promotion', enabled: true, desc: 'Instantly promotes waitlisted athlete upon cancellation' },
    { key: 'kiosk_mode', name: 'Full-Screen Kiosk RFID Terminal', enabled: true, desc: 'Activates front-desk rapid check-in display mode' },
    { key: 'emergency_lockdown_ui', name: 'Emergency Facility Lockdown Controls', enabled: true, desc: 'Renders red global banner and solenoid gate locks' },
    { key: 'dashboard_v2_canary', name: 'Dashboard v2 Canary Pipeline (Argo)', enabled: false, desc: 'Routes 10% of traffic to canary telemetry widgets' }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleFlag = (key: string) => {
    setFlags(
      flags.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
    showToast(`Feature flag [${key}] toggled.`);
  };

  const handleReplayDlq = (id: string) => {
    setDlqMessages(dlqMessages.filter((m) => m.id !== id));
    showToast(`DLQ message ${id} re-queued to RabbitMQ topic exchange.`);
  };

  const handleDiscardDlq = (id: string) => {
    setDlqMessages(dlqMessages.filter((m) => m.id !== id));
    showToast(`DLQ message ${id} purged.`);
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
            <Server className="w-3.5 h-3.5 text-kf-lime" />
            Cluster Infrastructure &amp; Superadmin
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            System Architecture, DLQ &amp; Distributed Sagas
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast('Polled 8 microservice health endpoints: All Healthy.')}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-Poll Probes
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="API Availability (30d)"
          value="99.98%"
          delta={{ value: 'SLO: 99.9%', isPositive: true }}
          chip={<BadgeChip variant="active">Within Budget</BadgeChip>}
          subtext="Budget remaining: 38 min"
        />
        <KPICard
          label="P99 Gateway Latency"
          value="38ms"
          delta={{ value: 'SLO: <500ms', isPositive: true }}
          chip={<BadgeChip variant="active">Optimal</BadgeChip>}
          subtext="Kong Declarative Proxy"
        />
        <KPICard
          label="Dead Letter Queue"
          value={String(dlqMessages.length)}
          delta={{ value: `${dlqMessages.length} pending`, isPositive: dlqMessages.length === 0 }}
          chip={<BadgeChip variant={dlqMessages.length === 0 ? 'active' : 'danger'}>
            {dlqMessages.length === 0 ? 'Clear' : 'Action Required'}
          </BadgeChip>}
          subtext="RabbitMQ Quorum DLX"
        />
        <KPICard
          label="Active Distributed Sagas"
          value="3"
          delta={{ value: '100% Compensations OK', isPositive: true }}
          chip={<BadgeChip variant="cyan">Atomic</BadgeChip>}
          subtext="Registration • Booking • Renewal"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-kf-border pb-2">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'health'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Service Mesh Health (8 Nodes)
        </button>

        <button
          onClick={() => setActiveTab('dlq')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'dlq'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Dead Letter Queue (DLQ)
          {dlqMessages.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-kf-danger text-kf-surface-0 text-[10px] font-bold">
              {dlqMessages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sagas')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'sagas'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Distributed Saga Viewer
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'flags'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Feature Flags (Unleash)
        </button>
      </div>

      {/* TAB 1: Service Mesh Health */}
      {activeTab === 'health' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Platform Microservices Topology</h3>
            <span className="font-mono text-xs text-kf-lime flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-kf-lime inline-block" />
              All Health Probes Responding 200 OK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {[
              { name: 'auth-service', port: 3001, status: 'UP', latency: '4ms', p99: '12ms' },
              { name: 'member-service', port: 3002, status: 'UP', latency: '6ms', p99: '18ms' },
              { name: 'scheduling-service', port: 3003, status: 'UP', latency: '5ms', p99: '15ms' },
              { name: 'nutrition-service', port: 3004, status: 'UP', latency: '7ms', p99: '21ms' },
              { name: 'billing-service', port: 3005, status: 'UP', latency: '9ms', p99: '28ms' },
              { name: 'access-service', port: 3006, status: 'UP', latency: '2ms', p99: '8ms' },
              { name: 'telemetry-simulator', port: 3010, status: 'UP', latency: '1ms', p99: '4ms' },
              { name: 'fn-pdf-export', port: 3008, status: 'UP', latency: '14ms', p99: '42ms' }
            ].map((svc) => (
              <div key={svc.name} className="p-3 bg-kf-surface-2 border border-kf-border rounded flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">{svc.name}</div>
                  <div className="text-kf-text-steel text-[10px]">:{svc.port} • p99 {svc.p99}</div>
                </div>
                <div className="text-right">
                  <span className="text-kf-lime font-bold">{svc.status}</span>
                  <div className="text-kf-text-steel text-[10px]">{svc.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Dead Letter Queue */}
      {activeTab === 'dlq' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">RabbitMQ Dead Letter Exchange (DLQ)</h3>
              <p className="font-body text-xs text-kf-text-steel mt-0.5">
                Failed asynchronous events parked for inspection, replay, or safe discard.
              </p>
            </div>
            <BadgeChip variant={dlqMessages.length === 0 ? 'active' : 'danger'}>
              {dlqMessages.length} Messages in DLQ
            </BadgeChip>
          </div>

          {dlqMessages.length === 0 ? (
            <div className="p-8 text-center bg-kf-surface-0 rounded-lg border border-kf-border font-mono text-xs text-kf-text-steel">
              <CheckCircle2 className="w-8 h-8 text-kf-lime mx-auto mb-2" />
              All consumer queues operating with nominal message delivery. DLQ is clear.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {dlqMessages.map((msg) => (
                <div key={msg.id} className="p-4 bg-kf-surface-2 border border-kf-border rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{msg.id}</span>
                      <span className="text-kf-cyan">({msg.routingKey})</span>
                    </div>
                    <span className="text-kf-text-steel">{msg.timestamp}</span>
                  </div>

                  <div className="p-2.5 bg-red-950/40 border border-kf-danger/40 rounded text-kf-danger text-[11px]">
                    <strong>Failure Reason:</strong> {msg.error} (Attempts: {msg.retryCount})
                  </div>

                  <div className="p-2.5 bg-kf-surface-0 rounded border border-kf-border text-kf-text-steel text-[11px] overflow-x-auto">
                    <code>{msg.payload}</code>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" size="sm" onClick={() => handleDiscardDlq(msg.id)} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                      Discard
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleReplayDlq(msg.id)} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                      Replay Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Distributed Saga Viewer */}
      {activeTab === 'sagas' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">Distributed Sagas &amp; Compensation Chains</h3>
            <p className="font-body text-xs text-kf-text-steel mt-0.5">
              Multi-service workflows with reverse compensations guaranteeing eventual consistency without 2PC locking.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Saga 1: Athlete Registration */}
            <div className="p-4 bg-kf-surface-2 border border-kf-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">Saga #1: Athlete Registration Saga</span>
                  <BadgeChip variant="active">100% Automated</BadgeChip>
                </div>
                <span className="text-kf-lime font-bold">SUCCESS (Avg: 340ms)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">1. Auth User</div>
                  <div className="text-kf-lime mt-1">Argon2 Password Hash</div>
                </div>
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">2. Member &amp; RFID</div>
                  <div className="text-kf-lime mt-1">Unique Badge Bound</div>
                </div>
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">3. Subscription</div>
                  <div className="text-kf-lime mt-1">Payment Method Token</div>
                </div>
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">4. First Invoice</div>
                  <div className="text-kf-lime mt-1">Ledger Entry Created</div>
                </div>
              </div>
              <div className="text-[11px] text-kf-text-steel pt-1">
                <strong>Compensation Logic:</strong> If Step 4 fails &rarr; cancel subscription &rarr; detach RFID keycard &rarr; mark member suspended.
              </div>
            </div>

            {/* Saga 2: Class Booking */}
            <div className="p-4 bg-kf-surface-2 border border-kf-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">Saga #2: Atomic Class Booking Saga</span>
                  <BadgeChip variant="active">Zero Oversell</BadgeChip>
                </div>
                <span className="text-kf-lime font-bold">SUCCESS (Avg: 85ms)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">1. Eligibility Check</div>
                  <div className="text-kf-lime mt-1">Active Tier Validated</div>
                </div>
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">2. Atomic Decrement</div>
                  <div className="text-kf-lime mt-1">booked_count &lt; capacity</div>
                </div>
                <div className="p-2 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-white font-bold">3. Notification Dispatch</div>
                  <div className="text-kf-lime mt-1">Mobile Push &amp; QR</div>
                </div>
              </div>
              <div className="text-[11px] text-kf-text-steel pt-1">
                <strong>Compensation Logic:</strong> If Step 2 fails (capacity reached) &rarr; enqueue into waitlist table &rarr; promote next on seat release.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">Unleash Feature Flags Console</h3>
              <p className="font-body text-xs text-kf-text-steel mt-0.5">
                Runtime progressive delivery toggles and emergency operational kill-switches.
              </p>
            </div>
            <BadgeChip variant="active">OpenFeature SDK</BadgeChip>
          </div>

          <div className="divide-y divide-kf-border/40 font-mono text-xs">
            {flags.map((flag) => (
              <div key={flag.key} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{flag.name}</span>
                    <span className="text-kf-cyan text-[11px]">[{flag.key}]</span>
                  </div>
                  <p className="font-body text-xs text-kf-text-steel">{flag.desc}</p>
                </div>

                <button
                  onClick={() => handleToggleFlag(flag.key)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    flag.enabled ? 'bg-kf-lime' : 'bg-kf-surface-3'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-kf-surface-0 transition-transform ${
                      flag.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
