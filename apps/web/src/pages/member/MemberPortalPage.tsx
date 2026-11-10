import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Calendar,
  Utensils,
  TrendingUp,
  CreditCard,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Download,
  AlertTriangle,
  Radio,
  RefreshCw,
  LogOut,
  MapPin,
  ChevronRight,
  Droplet
} from 'lucide-react';
import { Logo, Button, BadgeChip, ProgressRing, Modal, Input } from '@kineticfit/ui';

export const MemberPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'pass' | 'classes' | 'nutrition' | 'progress' | 'membership' | 'profile'>('home');
  const [passSecondsLeft, setPassSecondsLeft] = useState(60);
  const [passToken, setPassToken] = useState('KF-9428-A7X1');
  const [isNfcTapped, setIsNfcTapped] = useState(false);
  const [waterOz, setWaterOz] = useState(84);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Rotating pass token timer
  useEffect(() => {
    const timer = setInterval(() => {
      setPassSecondsLeft((prev) => {
        if (prev <= 1) {
          // Generate new simulated TOTP pass token
          const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
          setPassToken(`KF-${Math.floor(1000 + Math.random() * 9000)}-${randHex}`);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleNfcSimulate = () => {
    setIsNfcTapped(true);
    showToast('Turnstile NFC Reader Authorized: Gate 01 Unlocked');
    setTimeout(() => setIsNfcTapped(false), 2000);
  };

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//KineticFit OS//Athlete Schedule//EN\nBEGIN:VEVENT\nSUMMARY:MetCon Savage Circuit\nDESCRIPTION:High-Intensity Conditioning with Elena Rostova\nLOCATION:Downtown Flagship - Studio 1 MetCon\nDTSTART:20261026T060000Z\nDTEND:20261026T070000Z\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kineticfit-booking.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Calendar .ics file downloaded');
  };

  const handleExportDataJson = () => {
    const gdprData = {
      athlete: {
        id: '01931668-5000-7000-8000-000000000001',
        name: 'Alexander Vance',
        email: 'alexander@kineticfit.dev',
        tier: 'ELITE_BLACK',
        joinedAt: '2026-01-15T08:00:00Z',
        rfidUid: 'E28011606000020478051234'
      },
      nutrition: {
        currentProtocol: 'Hypertrophy Surge 3200',
        targetKcal: 3200,
        macros: { protein: 220, carbs: 380, fat: 75 }
      },
      assessments: [
        { scannedAt: '2026-08-01', bodyFatPct: 18.5, muscleMassKg: 37.0, bmi: 25.0 },
        { scannedAt: '2026-10-15', bodyFatPct: 14.8, muscleMassKg: 39.4, bmi: 24.1 }
      ],
      attendanceCount: 142
    };

    const blob = new Blob([JSON.stringify(gdprData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kineticfit-athlete-data-archive.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('GDPR Athlete Data archive downloaded');
  };

  return (
    <div className="min-h-screen bg-kf-bg text-kf-text font-body selection:bg-kf-lime selection:text-kf-surface-0">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-kf-surface-2 border border-kf-lime text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-kf-lime flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-kf-surface-0 border-b border-kf-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <div className="h-5 w-px bg-kf-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">Alexander Vance</span>
              <BadgeChip variant="active">Elite Black VIP</BadgeChip>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-kf-surface-1 px-3 py-1 rounded border border-kf-border text-kf-text-steel">
              <Flame className="w-3.5 h-3.5 text-kf-lime" />
              <span>18-Day Streak</span>
            </div>
            <Link to="/auth">
              <Button variant="secondary" size="sm" leftIcon={<LogOut className="w-3.5 h-3.5" />}>
                Sign Out
              </Button>
            </Link>
          </div>
        </div>

        {/* Member Tab Bar */}
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto flex items-center gap-1 border-t border-kf-border/40">
          {[
            { id: 'home', label: 'Today', icon: Flame },
            { id: 'pass', label: 'Digital Pass', icon: QrCode },
            { id: 'classes', label: 'Classes & Bookings', icon: Calendar },
            { id: 'nutrition', label: 'Chrono-Nutrition', icon: Utensils },
            { id: 'progress', label: 'InBody & PRs', icon: TrendingUp },
            { id: 'membership', label: 'Membership', icon: CreditCard },
            { id: 'profile', label: 'Profile & Privacy', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 font-mono text-xs flex items-center gap-2 whitespace-nowrap border-b-2 font-semibold transition-colors ${
                  isSelected
                    ? 'border-kf-lime text-kf-lime'
                    : 'border-transparent text-kf-text-steel hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* TAB 1: TODAY HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Quick Digital Pass Card (Left 5 Cols) */}
              <div className="md:col-span-5 bg-gradient-to-b from-kf-surface-1 to-kf-surface-0 border border-kf-border rounded-xl p-6 text-center space-y-4 shadow-xl">
                <div className="flex items-center justify-between font-mono text-xs">
                  <BadgeChip variant="active">Offline Ready Pass</BadgeChip>
                  <span className="text-kf-cyan font-bold">{passSecondsLeft}s Refresh</span>
                </div>

                {/* Simulated QR Code Graphic */}
                <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 flex flex-col items-center justify-center border-4 border-kf-lime shadow-lime-glow">
                  <QrCode className="w-36 h-36 text-kf-surface-0 stroke-[1.5]" />
                </div>

                <div>
                  <div className="font-mono text-sm tracking-wider font-bold text-white">
                    {passToken}
                  </div>
                  <div className="font-body text-xs text-kf-text-steel mt-0.5">
                    Downtown Flagship Turnstile Pass
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleNfcSimulate}
                  leftIcon={<Radio className={`w-4 h-4 ${isNfcTapped ? 'animate-ping' : ''}`} />}
                >
                  {isNfcTapped ? 'Turnstile Gate Opening...' : 'Simulate NFC Gate Tap'}
                </Button>
              </div>

              {/* Today's Schedule & Workout (Right 7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                {/* Next Class Booking Banner */}
                <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <BadgeChip variant="cyan">Next Reserved Session</BadgeChip>
                    <span className="font-mono text-xs text-kf-lime font-bold">Confirmed Seat #04</span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-xl text-white">MetCon Savage Circuit</h3>
                    <p className="font-mono text-xs text-kf-cyan mt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Today at 17:30 - 18:30 • Studio 1 MetCon
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-kf-border/60 font-mono text-xs">
                    <span className="text-kf-text-steel">Coach: <strong className="text-white">Elena Rostova</strong></span>
                    <button
                      onClick={handleDownloadIcs}
                      className="text-kf-lime hover:underline font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Add to Apple / Google Cal
                    </button>
                  </div>
                </div>

                {/* Daily Nutritional Snapshot */}
                <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Chrono-Nutrition: Hypertrophy Surge
                      </h4>
                      <p className="font-body text-xs text-kf-text-steel mt-0.5">
                        Target: 3,200 kcal • 220g Protein • 380g Carbs • 75g Fat
                      </p>
                    </div>
                    <ProgressRing value={75} size={56} color="lime" />
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded bg-kf-surface-0 border border-kf-border flex items-center justify-between">
                      <span className="text-kf-lime font-bold">16:00 Post-Workout Hydro-Shake</span>
                      <span className="text-white font-bold">450 kcal (45P / 60C)</span>
                    </div>
                    <div className="p-2.5 rounded bg-kf-surface-0 border border-kf-border flex items-center justify-between">
                      <span className="text-white">19:00 Atlantic Salmon &amp; Sweet Potato</span>
                      <span className="text-kf-text-steel">600 kcal (30P / 60C / 22F)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL PASS */}
        {activeTab === 'pass' && (
          <div className="max-w-md mx-auto bg-kf-surface-1 border border-kf-border rounded-xl p-8 text-center space-y-6 shadow-2xl">
            <div>
              <BadgeChip variant="active">Offline Encrypted Credential</BadgeChip>
              <h2 className="font-display font-bold text-2xl text-white mt-2">
                Facility Access Pass
              </h2>
              <p className="font-body text-xs text-kf-text-steel mt-1">
                Hold your device near the optical scanner or NFC turnstile terminal at any KineticFit entrance.
              </p>
            </div>

            <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-kf-lime shadow-lime-glow">
              <QrCode className="w-52 h-52 text-kf-surface-0 stroke-[1.5]" />
            </div>

            <div className="space-y-1 font-mono">
              <div className="text-xl font-bold tracking-widest text-white">{passToken}</div>
              <div className="text-xs text-kf-lime font-semibold">Refreshes in {passSecondsLeft} seconds</div>
              <div className="text-[11px] text-kf-text-steel pt-2">
                Hardware Token: RFID-E280-1160-VIP
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-mono text-xs"
              onClick={handleNfcSimulate}
            >
              {isNfcTapped ? 'Access Granted • Lane 01 Open' : 'Tap NFC Gate Reader'}
            </Button>
          </div>
        )}

        {/* TAB 3: CLASSES & BOOKINGS */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Weekly Class Schedule</h3>
                <p className="font-body text-xs text-kf-text-steel">Reserve priority seating with 1-click booking.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleDownloadIcs} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export Calendar (.ics)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Morning Ignite HIIT', time: 'Tomorrow 06:00', studio: 'Studio 1 MetCon', trainer: 'Elena Rostova', status: 'OPEN' },
                { title: 'Olympic Weightlifting Clinic', time: 'Wed 07:30', studio: 'Studio 4 Oly', trainer: 'Jaxson Hayes', status: 'BOOKED' },
                { title: 'Power Vinyasa Flow', time: 'Thu 09:00', studio: 'Studio 2 Yoga', trainer: 'Maya Lin', status: 'OPEN' },
                { title: 'Contrast Hydro & Recovery', time: 'Fri 16:30', studio: 'Recovery Zone', trainer: 'Soren Lindqvist', status: 'WAITLIST' }
              ].map((c, idx) => (
                <div key={idx} className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-white">{c.title}</span>
                      <BadgeChip variant={c.status === 'BOOKED' ? 'active' : c.status === 'WAITLIST' ? 'danger' : 'neutral'}>
                        {c.status}
                      </BadgeChip>
                    </div>
                    <div className="font-mono text-xs text-kf-text-steel">
                      {c.time} • {c.studio} • Coach {c.trainer}
                    </div>
                  </div>

                  <div>
                    {c.status === 'BOOKED' ? (
                      <Button variant="secondary" size="sm" onClick={() => showToast(`Canceled reservation for ${c.title}`)}>
                        Cancel
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => showToast(`Booked confirmed seat for ${c.title}`)}>
                        {c.status === 'WAITLIST' ? 'Join Waitlist' : 'Book Seat'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHRONO-NUTRITION */}
        {activeTab === 'nutrition' && (
          <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Chrono-Nutritional Meal Diary</h3>
                <p className="font-body text-xs text-kf-text-steel mt-0.5">Assigned Protocol: Hypertrophy Surge 3200 (v1)</p>
              </div>
              <BadgeChip variant="active">100% Adherence Today</BadgeChip>
            </div>

            {/* Hydration Tracker */}
            <div className="p-4 bg-kf-surface-0 border border-kf-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Droplet className="w-5 h-5 text-kf-cyan" />
                <div>
                  <div className="font-mono text-xs font-bold text-white">Daily Hydration Tracker</div>
                  <div className="font-mono text-[11px] text-kf-text-steel">{waterOz} oz / 128 oz Target</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setWaterOz(waterOz + 16)}>
                  + 16 oz Water
                </Button>
              </div>
            </div>

            {/* Meals Log */}
            <div className="space-y-3 font-mono text-xs">
              {[
                { name: 'Anabolic Dawn Breakfast', time: '07:30', kcal: 850, completed: true },
                { name: 'Mid-Morning Fuel', time: '10:00', kcal: 550, completed: true },
                { name: 'Pre-Session Glycogen Load', time: '13:00', kcal: 750, completed: true },
                { name: 'Post-Workout Micro-Partition', time: '16:00', kcal: 450, completed: false },
                { name: 'Circadian Repair Dinner', time: '19:00', kcal: 600, completed: false }
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-kf-surface-2 border border-kf-border rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full border border-kf-border flex items-center justify-center text-kf-lime">
                      {m.completed ? <CheckCircle2 className="w-4 h-4" /> : null}
                    </span>
                    <span className="font-bold text-white">{m.time} - {m.name}</span>
                  </div>
                  <span className="text-kf-cyan font-bold">{m.kcal} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROGRESS & INBODY */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">InBody 770 Composition Scans</h3>
                  <p className="font-body text-xs text-kf-text-steel">DEXA-calibrated multi-frequency impedance</p>
                </div>
                <BadgeChip variant="active">Latest Scan: Oct 15, 2026</BadgeChip>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel">BODY FAT PERCENTAGE</div>
                  <div className="text-2xl font-bold text-white mt-1">14.8%</div>
                  <div className="text-kf-lime text-[11px] mt-1">-3.7% since baseline</div>
                </div>

                <div className="p-4 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel">SKELETAL MUSCLE MASS</div>
                  <div className="text-2xl font-bold text-white mt-1">39.4 kg</div>
                  <div className="text-kf-cyan text-[11px] mt-1">+2.4 kg lean hypertrophy</div>
                </div>

                <div className="p-4 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel">VISCERAL FAT LEVEL</div>
                  <div className="text-2xl font-bold text-white mt-1">Level 4</div>
                  <div className="text-kf-lime text-[11px] mt-1">Optimal Athletic Range</div>
                </div>
              </div>
            </div>

            {/* Personal Records */}
            <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-3 font-mono text-xs">
              <h4 className="font-display font-bold text-base text-white">Personal Performance Records</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel text-[11px]">DEADLIFT</div>
                  <div className="text-lg font-bold text-white mt-0.5">220 kg</div>
                </div>
                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel text-[11px]">BACK SQUAT</div>
                  <div className="text-lg font-bold text-white mt-0.5">180 kg</div>
                </div>
                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel text-[11px]">CLEAN &amp; JERK</div>
                  <div className="text-lg font-bold text-white mt-0.5">135 kg</div>
                </div>
                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="text-kf-text-steel text-[11px]">2K ROW</div>
                  <div className="text-lg font-bold text-white mt-0.5">6:22.4</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEMBERSHIP */}
        {activeTab === 'membership' && (
          <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Elite Black VIP Membership</h3>
                <p className="font-mono text-xs text-kf-lime mt-0.5">$289.00 / month • Auto-Renews Nov 20, 2026</p>
              </div>
              <BadgeChip variant="active">Active Status</BadgeChip>
            </div>

            <div className="p-4 bg-kf-surface-0 border border-kf-border rounded-lg space-y-2 font-mono text-xs">
              <div className="text-white font-bold">Included Tier Privileges:</div>
              <div className="text-kf-text-steel leading-relaxed">
                • Unlimited multi-hub access &amp; 24/7 RFID biometric check-in<br />
                • Full kitchen lab chrono-nutritional meal guide access<br />
                • Monthly InBody 770 body composition scans with Dr. Aris Thorne<br />
                • Reserved locker room laundry and Finnish hydro recovery access
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-kf-border font-mono text-xs">
              <Button variant="secondary" size="sm" onClick={() => showToast('Membership freeze request logged (30-day max).')}>
                Freeze Membership
              </Button>
              <Button variant="secondary" size="sm" onClick={() => showToast('Invoices downloaded from billing ledger.')}>
                Download Billing Invoices
              </Button>
            </div>
          </div>
        )}

        {/* TAB 7: PROFILE & DATA PRIVACY */}
        {activeTab === 'profile' && (
          <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Athlete Profile &amp; Data Rights</h3>
              <p className="font-body text-xs text-kf-text-steel mt-0.5">
                GDPR &amp; California CCPA compliant data privacy controls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                <span className="text-kf-text-steel">Full Name:</span>
                <div className="text-white font-bold text-sm mt-0.5">Alexander Vance</div>
              </div>
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                <span className="text-kf-text-steel">Email:</span>
                <div className="text-white font-bold text-sm mt-0.5">alexander@kineticfit.dev</div>
              </div>
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                <span className="text-kf-text-steel">Emergency Contact:</span>
                <div className="text-white font-bold text-sm mt-0.5">Claire Vance (+1 555-0192)</div>
              </div>
              <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                <span className="text-kf-text-steel">Hardware RFID Key:</span>
                <div className="text-white font-bold text-sm mt-0.5">E28011606000020478051234</div>
              </div>
            </div>

            <div className="pt-4 border-t border-kf-border flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold text-white">Export Personal Data Archive</div>
                <div className="font-body text-xs text-kf-text-steel">Download all biometric scans, check-ins, and nutritional records.</div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportDataJson} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export GDPR JSON
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

