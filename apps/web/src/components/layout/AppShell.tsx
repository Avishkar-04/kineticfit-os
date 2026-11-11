import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Utensils,
  ShieldCheck,
  CreditCard,
  Radio,
  Activity,
  Search,
  Bell,
  Zap,
  Sliders,
  ChevronDown,
  AlertTriangle,
  DoorClosed,
  CheckCircle2,
  BarChart3,
  Building2,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Logo } from '@kineticfit/ui';
import { BadgeChip } from '@kineticfit/ui';
import { Button } from '@kineticfit/ui';
import { Modal } from '@kineticfit/ui';
import { SettingsModal } from '../settings/SettingsModal.js';

export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [checkInRfid, setCheckInRfid] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);
  const [isLockdownEngaged, setIsLockdownEngaged] = useState(false);

  const navItems = [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Members Directory', path: '/members', icon: Users },
    { label: 'Class Schedule', path: '/schedule', icon: Calendar },
    { label: 'Diet & Nutrition', path: '/nutrition', icon: Utensils },
    { label: 'Trainers & Staff', path: '/staff', icon: ShieldCheck },
    { label: 'Financials & Billing', path: '/billing', icon: CreditCard },
    { label: 'Access & Check-ins', path: '/access', icon: Radio },
    { label: 'Executive Reports', path: '/reports', icon: BarChart3 },
    { label: 'Announcements', path: '/announcements', icon: Bell },
    { label: 'Facilities & Assets', path: '/facilities', icon: Building2 },
    { label: 'System & Health', path: '/system', icon: Activity }
  ];

  const handleQuickCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRfid.trim()) return;
    setCheckInSuccess(`Access Granted for RFID UID: ${checkInRfid.toUpperCase()}`);
    setTimeout(() => {
      setCheckInSuccess(null);
      setCheckInRfid('');
      setIsCheckInModalOpen(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-kf-bg text-kf-text font-body">
      {/* Emergency Lockdown Global Banner */}
      {isLockdownEngaged && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-kf-danger text-kf-bg px-4 py-2 flex items-center justify-between font-mono text-xs font-bold tracking-widest uppercase shadow-danger-glow animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 stroke-[3]" />
            <span>CRITICAL: EMERGENCY FACILITY LOCKDOWN ENGAGED — ALL TURNSTILES SECURED</span>
          </div>
          <button
            onClick={() => setIsLockdownEngaged(false)}
            className="underline hover:opacity-80 focus:outline-none"
          >
            Release Lockdown (MFA Authenticated)
          </button>
        </div>
      )}

      {/* Persistent Left Telemetry Sidebar (260px) */}
      <aside className="w-[260px] h-full bg-kf-surface-1 border-r border-kf-border flex flex-col justify-between shrink-0 select-none z-20">
        <div>
          {/* Header Brand Block */}
          <div className="h-16 px-5 border-b border-kf-border flex items-center justify-between">
            <Logo size="md" />
            <BadgeChip variant="active" dot={true}>
              LIVE
            </BadgeChip>
          </div>

          {/* Active Hub Switcher (Configurable per-hub) */}
          <div className="p-3 border-b border-kf-border/60">
            <button className="w-full bg-kf-surface-2 hover:bg-kf-surface-3 border border-kf-border rounded p-2.5 text-left flex items-center justify-between transition-colors focus:outline-none focus:border-kf-lime">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-kf-text-steel">
                  Active Hub
                </div>
                <div className="font-display font-bold text-xs text-white tracking-wide mt-0.5">
                  Downtown Flagship
                </div>
              </div>
              <div className="text-right flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-kf-lime bg-kf-lime/10 px-1.5 py-0.5 rounded border border-kf-lime/20">
                  Cap 300
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-kf-text-steel" />
              </div>
            </button>
          </div>

          {/* Primary Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: navActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded font-display text-xs font-semibold tracking-wide transition-all duration-150
                    ${
                      navActive
                        ? 'bg-kf-surface-2 text-kf-lime border-l-2 border-kf-lime shadow-[inset_0_0_12px_rgba(195,244,0,0.08)]'
                        : 'text-kf-text-muted hover:text-white hover:bg-kf-surface-2/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-kf-lime' : 'text-kf-text-steel'}`} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Portal Switchers */}
          <div className="px-3 py-2 border-t border-kf-border/40 font-mono text-[11px] space-y-1">
            <div className="text-kf-text-steel/70 text-[9px] uppercase tracking-wider px-2 font-bold">PORTALS</div>
            <Link to="/me" className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-kf-surface-2 text-kf-text-steel hover:text-white transition-colors">
              <span className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-kf-lime" /> Member PWA</span>
              <ExternalLink className="w-3 h-3 text-kf-text-steel/60" />
            </Link>
            <Link to="/coach" className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-kf-surface-2 text-kf-text-steel hover:text-white transition-colors">
              <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-kf-cyan" /> Coach Workspace</span>
              <ExternalLink className="w-3 h-3 text-kf-text-steel/60" />
            </Link>
            <Link to="/kiosk" className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-kf-surface-2 text-kf-text-steel hover:text-white transition-colors">
              <span className="flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-amber-400" /> Kiosk Terminal</span>
              <ExternalLink className="w-3 h-3 text-kf-text-steel/60" />
            </Link>
          </div>
        </div>

        {/* Bottom Sidebar Telemetry Mini-Widget */}
        <div className="p-4 border-t border-kf-border bg-kf-surface-lowest/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-kf-text-steel font-semibold">
              Floor Saturation
            </span>
            <span className="font-mono text-[11px] font-bold text-kf-lime">74%</span>
          </div>

          <div className="w-full bg-kf-surface-3 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-kf-lime h-full rounded-full transition-all duration-500 w-[74%]" />
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-kf-text-steel">
            <span>222 / 300 athletes</span>
            <span className="text-kf-cyan">Surge +14%</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-kf-border/40 flex items-center justify-between font-mono text-[9px] text-kf-text-steel/70">
            <span>NODE: DOWNTOWN-01</span>
            <span>v1.0.0-PROD</span>
          </div>
        </div>
      </aside>

      {/* Main App Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 px-6 bg-kf-surface-1 border-b border-kf-border flex items-center justify-between shrink-0 select-none z-10">
          {/* Global Search with Command Palette Keybinding */}
          <div className="flex items-center gap-3 w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-kf-text-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search athlete, RFID, coach, plan (Ctrl+K)..."
                className="w-full h-9 pl-9 pr-14 bg-kf-surface-lowest text-xs text-white border border-kf-border rounded focus:outline-none focus:border-kf-lime focus:shadow-lime-glow transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-kf-text-steel bg-kf-surface-2 px-1.5 py-0.5 rounded border border-kf-border">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Operational Controls */}
          <div className="flex items-center gap-3">
            {/* Realtime WebSocket Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-kf-surface-lowest border border-kf-border rounded font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-kf-lime animate-pulse" />
              <span className="text-kf-text-steel">WS STREAM ONLINE</span>
            </div>

            {/* Fast Check-In Action Button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Zap className="w-3.5 h-3.5 fill-current" />}
              onClick={() => setIsCheckInModalOpen(true)}
            >
              Fast Check-In
            </Button>

            {/* Emergency Lockdown Trigger */}
            <Button
              variant="danger"
              size="sm"
              leftIcon={<DoorClosed className="w-3.5 h-3.5" />}
              onClick={() => setIsLockdownEngaged(true)}
            >
              Lockdown
            </Button>

            {/* Notification Bell */}
            <button className="relative p-2 text-kf-text-steel hover:text-white hover:bg-kf-surface-2 rounded border border-transparent hover:border-kf-border transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-kf-lime rounded-full ring-2 ring-kf-surface-1" />
            </button>

            {/* User Profile Block (Triggers Settings Modal) */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsSettingsOpen(true);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Open Settings & Terminal Security"
              title="Open Settings & Terminal Security"
              className="flex items-center gap-2.5 pl-3 border-l border-kf-border cursor-pointer hover:opacity-85 transition-opacity focus:outline-none focus:ring-1 focus:ring-kf-lime rounded"
            >
              <div className="w-8 h-8 rounded bg-kf-lime/20 border border-kf-lime/40 text-kf-lime font-mono font-bold text-xs flex items-center justify-center">
                MV
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-display font-bold text-xs text-white leading-tight">
                  Marcus Vance
                </div>
                <div className="font-mono text-[10px] text-kf-lime uppercase tracking-wider">
                  OPS DIRECTOR
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-kf-bg">
          <Outlet />
        </main>
      </div>

      {/* Fast Check-in RFID Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Fast RFID Check-In Dispatch"
        subtitle="Terminal Lane 01 (Biometric & RFID Scan)"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsCheckInModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleQuickCheckIn}>
              Verify Access
            </Button>
          </>
        }
      >
        <form onSubmit={handleQuickCheckIn} className="space-y-4">
          <p className="font-body text-xs text-kf-text-muted">
            Tap keycard or enter athlete RFID UID to validate membership status, zone permissions, and log occupancy telemetry.
          </p>

          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-semibold text-kf-text-steel uppercase tracking-wider">
              RFID UID / Member ID
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. 04:A2:3F:89:C1 or KF-1082"
              value={checkInRfid}
              onChange={(e) => setCheckInRfid(e.target.value)}
              className="w-full h-11 px-3 bg-kf-surface-lowest text-white font-mono text-sm border border-kf-border rounded focus:outline-none focus:border-kf-lime focus:shadow-lime-glow"
            />
          </div>

          {checkInSuccess && (
            <div className="p-3 bg-kf-lime/15 border border-kf-lime/40 rounded flex items-center gap-2 font-mono text-xs text-kf-lime">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{checkInSuccess}</span>
            </div>
          )}
        </form>
      </Modal>

      {/* Deep-linkable & Dialog Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
