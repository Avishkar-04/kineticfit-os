import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Key,
  Sliders,
  Users,
  FileText,
  Smartphone,
  Trash2,
  CheckCircle2,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button, BadgeChip, Checkbox } from '@kineticfit/ui';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'theme' | 'permissions' | 'audit'>('security');
  const [themeProfile, setThemeProfile] = useState<'volt' | 'slate' | 'midnight'>('volt');
  const [telemetryInterval, setTelemetryInterval] = useState<'1.2s' | '3s' | '5s'>('1.2s');
  const [audioChime, setAudioChime] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Policy Toggles state
  const [policies, setPolicies] = useState({
    autoPromoteWaitlist: true,
    manualTurnstileBypass: true,
    emergencyLockdownOverride: true,
    requireMfaPrivileged: true,
    preventClassOversell: true,
    rfidLiveStreamPublish: true
  });

  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome on macOS (Downtown Operations Deck)', ip: '192.168.1.14', current: true, lastSeen: 'Active now' },
    { id: '2', device: 'Safari on iPhone 15 Pro (Gym Floor Inspection)', ip: '192.168.1.88', current: false, lastSeen: '18m ago' },
    { id: '3', device: 'Terminal Kiosk Display 01 (Front Desk Wedge)', ip: '192.168.1.201', current: false, lastSeen: '2h ago' }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleTerminateSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleKillAllOthers = () => {
    setSessions(sessions.filter((s) => s.current));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-body">
      {/* 80% Scrim with 8px Backdrop Blur */}
      <div onClick={onClose} className="fixed inset-0 bg-[#0c0f14]/80 backdrop-blur-md" />

      {/* Modal Surface Window: Max-height min(88vh, 860px) */}
      <div className="relative w-full max-w-4xl bg-kf-surface-1 border border-kf-border rounded-xl shadow-2xl flex flex-col max-h-[min(88vh,860px)] overflow-hidden z-10 animate-in zoom-in-95">
        {/* Fixed Header with Profile Block */}
        <div className="px-6 py-5 border-b border-kf-border bg-kf-surface-lowest flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-kf-lime/20 border border-kf-lime/40 text-kf-lime font-mono font-bold text-base flex items-center justify-center">
              MV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">Marcus Vance</h2>
                <BadgeChip variant="active">OPS DIRECTOR</BadgeChip>
              </div>
              <div className="font-mono text-xs text-kf-text-steel flex items-center gap-3 mt-0.5">
                <span>RFID: 04:E9:00:11:99</span>
                <span>•</span>
                <span>Hub: Downtown Flagship</span>
                <span>•</span>
                <span className="text-kf-lime">Keycard Synced</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-kf-text-steel hover:text-white p-2 rounded-lg hover:bg-kf-surface-2 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fixed Tab Bar (4 Tabs) */}
        <div className="px-6 border-b border-kf-border bg-kf-surface-lowest flex items-center gap-2 select-none overflow-x-auto">
          {[
            { id: 'security', label: 'Account & Security', icon: Shield },
            { id: 'theme', label: 'System & Theme', icon: Sliders },
            { id: 'permissions', label: 'Operational Permissions', icon: Users },
            { id: 'audit', label: 'Audit & Sessions', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 font-display text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-kf-lime text-kf-lime bg-kf-surface-1/40'
                    : 'border-transparent text-kf-text-steel hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-kf-text">
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Operational Privileges & Overrides */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-kf-border">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                    01. Operational Privileges & Overrides
                  </h3>
                  <BadgeChip variant="active">Tier-1 Authority</BadgeChip>
                </div>

                <div className="space-y-2.5">
                  {[
                    { key: 'autoPromoteWaitlist', title: 'Waitlist Auto-Promotion', desc: 'Promotes waitlisted athletes on cancellation with 15m confirmation window' },
                    { key: 'manualTurnstileBypass', title: 'Manual Turnstile Override', desc: 'Allows front-desk staff to issue single-entry manual gate passes' },
                    { key: 'emergencyLockdownOverride', title: 'Emergency Facility Lockdown', desc: 'Authorizes two-person rule for instant physical gate lockdown' },
                    { key: 'requireMfaPrivileged', title: 'Enforce Step-Up MFA on Privileged Actions', desc: 'Demands TOTP or YubiKey prompt on refunds and overrides' }
                  ].map((p) => (
                    <div key={p.key} className="p-3 bg-kf-surface-lowest border border-kf-border rounded flex items-center justify-between">
                      <div>
                        <div className="font-display font-bold text-xs text-white">{p.title}</div>
                        <div className="font-body text-xs text-kf-text-steel">{p.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={(policies as any)[p.key]}
                        onChange={(e) => setPolicies({ ...policies, [p.key]: e.target.checked })}
                        className="w-4 h-4 accent-kf-lime cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-kf-border">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                    02. Active Authenticated Terminal Sessions
                  </h3>
                  <Button variant="danger" size="sm" onClick={handleKillAllOthers}>
                    Kill All Other Sessions
                  </Button>
                </div>

                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-3 bg-kf-surface-lowest border border-kf-border rounded flex items-center justify-between font-mono text-xs">
                      <div>
                        <div className="text-white font-bold flex items-center gap-2">
                          <Smartphone className="w-3.5 h-3.5 text-kf-lime" />
                          <span>{s.device}</span>
                          {s.current && <span className="text-kf-lime text-[10px] bg-kf-lime/10 px-1.5 py-0.5 rounded">THIS SESSION</span>}
                        </div>
                        <div className="text-kf-text-steel text-[11px] mt-0.5">IP: {s.ip} • {s.lastSeen}</div>
                      </div>

                      {!s.current && (
                        <button
                          onClick={() => handleTerminateSession(s.id)}
                          className="text-kf-danger hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Terminate</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white pb-2 border-b border-kf-border">
                  Color Engine Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {[
                    { id: 'volt', name: 'Kinetic Volt Dark', desc: 'Electric lime #c3f400 on #111319' },
                    { id: 'slate', name: 'Cyber Slate', desc: 'Cyan telemetry #00eefc on #141820' },
                    { id: 'midnight', name: 'Midnight Black', desc: 'High-contrast monochrome on #0b0e13' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeProfile(t.id as any)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        themeProfile === t.id
                          ? 'bg-kf-surface-2 border-kf-lime shadow-lime-glow text-white'
                          : 'bg-kf-surface-lowest border-kf-border text-kf-text-muted hover:border-slate-500'
                      }`}
                    >
                      <div className="font-display font-bold text-xs">{t.name}</div>
                      <div className="font-mono text-[11px] text-kf-text-steel mt-1">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white pb-2 border-b border-kf-border">
                  Telemetry Stream Refresh Cadence
                </h3>
                <div className="flex gap-3 mt-3 font-mono text-xs">
                  {(['1.2s', '3s', '5s'] as const).map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setTelemetryInterval(interval)}
                      className={`px-4 py-2 rounded border ${
                        telemetryInterval === interval
                          ? 'bg-kf-surface-2 border-kf-lime text-kf-lime'
                          : 'bg-kf-surface-lowest border-kf-border text-kf-text-steel'
                      }`}
                    >
                      {interval} (realtime)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white pb-2 border-b border-kf-border">
                Role × Capability Matrix
              </h3>
              <div className="font-mono text-xs bg-kf-surface-lowest border border-kf-border rounded p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-kf-border text-kf-text-steel">
                  <span>Capability</span>
                  <span>SUPERADMIN / OPS / TRAINER / FRONT_DESK</span>
                </div>
                <div className="flex justify-between py-1 border-b border-kf-border/40">
                  <span className="text-white">Emergency Facility Lockdown</span>
                  <span className="text-kf-lime font-bold">YES / YES / NO / NO</span>
                </div>
                <div className="flex justify-between py-1 border-b border-kf-border/40">
                  <span className="text-white">Manual Turnstile Bypass Pass</span>
                  <span className="text-kf-lime font-bold">YES / YES / NO / YES</span>
                </div>
                <div className="flex justify-between py-1 border-b border-kf-border/40">
                  <span className="text-white">Log InBody Scan Assessments</span>
                  <span className="text-kf-lime font-bold">YES / YES / YES / NO</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white">Issue Refund & Edit Plans</span>
                  <span className="text-kf-lime font-bold">YES / NO / NO / NO</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white pb-2 border-b border-kf-border">
                Immutable SHA256 Hash-Chained Audit Trail
              </h3>
              <div className="font-mono text-xs space-y-2">
                {[
                  { time: '13:20:11', actor: 'Marcus Vance', action: 'TURNSTILE_BYPASS', target: 'Lane 01 (KF-1042)', hash: 'e3b0c442...8b4567' },
                  { time: '11:15:40', actor: 'Elena Rostova', action: 'DIET_TARGET_UPDATE', target: 'Athlete Roster 312', hash: '5f4dcc3b...9a1234' },
                  { time: '09:00:22', actor: 'System Scheduler', action: 'PARTITION_VERIFY', target: 'check_ins_2026_10', hash: '7c4a8d09...ff4412' }
                ].map((log, idx) => (
                  <div key={idx} className="p-3 bg-kf-surface-lowest border border-kf-border rounded flex items-center justify-between">
                    <div>
                      <span className="text-kf-text-steel">{log.time}</span>
                      <span className="text-white font-bold ml-2">{log.actor}</span>
                      <span className="text-kf-lime ml-2">[{log.action}]</span>
                      <span className="text-kf-text-steel ml-2">{log.target}</span>
                    </div>
                    <span className="text-kf-text-steel text-[10px]">{log.hash}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-kf-border bg-kf-surface-lowest flex items-center justify-between">
          <div className="font-mono text-xs text-kf-text-steel">
            Node Signature: <span className="text-white">DOWNTOWN-OPS-CORE-01</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Discard Changes
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaved}>
              {isSaved ? 'Preferences Synchronized' : 'Save Preferences & Sync Node'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
