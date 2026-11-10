import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Calendar,
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  Flame,
  Plus,
  Send,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Logo, Button, BadgeChip, Modal, Input } from '@kineticfit/ui';

interface AssignedAthlete {
  id: string;
  name: string;
  tier: string;
  goal: string;
  attendanceStreak: number;
  dietPlan: string;
  dietAdherence: number;
  lastCheckIn: string;
  status: 'ON FLOOR' | 'SCHEDULED' | 'OFFLINE';
}

const INITIAL_ATHLETES: AssignedAthlete[] = [
  {
    id: 'ath-001',
    name: 'Alexander Vance',
    tier: 'ELITE_BLACK',
    goal: 'Hypertrophy & Strength',
    attendanceStreak: 18,
    dietPlan: 'Hypertrophy Surge 3200',
    dietAdherence: 94,
    lastCheckIn: 'Today 06:12',
    status: 'ON FLOOR'
  },
  {
    id: 'ath-002',
    name: 'Seraphina Vale',
    tier: 'PRO',
    goal: 'Metabolic Conditioning',
    attendanceStreak: 12,
    dietPlan: 'Fat Loss & Metabolic Cut 2100',
    dietAdherence: 88,
    lastCheckIn: 'Today 07:05',
    status: 'ON FLOOR'
  },
  {
    id: 'ath-003',
    name: 'Marcus Thorne',
    tier: 'PRO',
    goal: 'Olympic Weightlifting',
    attendanceStreak: 8,
    dietPlan: 'Endurance Engine 2800',
    dietAdherence: 91,
    lastCheckIn: 'Yesterday 17:30',
    status: 'SCHEDULED'
  },
  {
    id: 'ath-004',
    name: 'Lila Sterling',
    tier: 'STANDARD',
    goal: 'General Athleticism',
    attendanceStreak: 5,
    dietPlan: 'Standard Gym Protocol',
    dietAdherence: 82,
    lastCheckIn: 'Oct 23 09:15',
    status: 'OFFLINE'
  }
];

export const CoachWorkspacePage: React.FC = () => {
  const [activeCoach, setActiveCoach] = useState('Elena Rostova (Master Strength Coach)');
  const [activeTab, setActiveTab] = useState<'today' | 'clients' | 'schedule'>('today');
  const [athletes, setAthletes] = useState<AssignedAthlete[]>(INITIAL_ATHLETES);

  // Modals & Forms
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AssignedAthlete | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Assessment fields
  const [bfPercent, setBfPercent] = useState('14.8');
  const [muscleKg, setMuscleKg] = useState('39.4');
  const [bmiVal, setBmiVal] = useState('24.1');

  // Cover request fields
  const [coverClass, setCoverClass] = useState('MetCon Savage Circuit (Friday 06:00)');
  const [coverReason, setCoverReason] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssessmentModalOpen(false);
    showToast(`InBody 770 composition scan logged for ${selectedAthlete?.name}`);
  };

  const handleSubmitCoverRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCoverModalOpen(false);
    setCoverReason('');
    showToast('Shift cover request dispatched to coaching supervisor inbox.');
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

      {/* Header */}
      <header className="bg-kf-surface-0 border-b border-kf-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <div className="h-5 w-px bg-kf-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">{activeCoach}</span>
              <BadgeChip variant="active">ABAC Restricted</BadgeChip>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">
                Director Console
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto flex items-center gap-1 border-t border-kf-border/40">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-3 px-4 font-mono text-xs flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'today'
                ? 'border-kf-lime text-kf-lime'
                : 'border-transparent text-kf-text-steel hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Today's Floor View
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`py-3 px-4 font-mono text-xs flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'clients'
                ? 'border-kf-lime text-kf-lime'
                : 'border-transparent text-kf-text-steel hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Assigned Athletes ({athletes.length})
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-4 font-mono text-xs flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'schedule'
                ? 'border-kf-lime text-kf-lime'
                : 'border-transparent text-kf-text-steel hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Coaching Shifts &amp; Cover
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* TAB 1: TODAY'S FLOOR VIEW */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5">
                <div className="font-mono text-xs text-kf-text-steel uppercase">Athletes on Floor Now</div>
                <div className="font-display font-black text-3xl text-white mt-1">
                  2 <span className="font-mono text-xs text-kf-lime font-normal">Active</span>
                </div>
                <p className="font-mono text-xs text-kf-text-steel mt-2">Studio 1 MetCon &amp; Oly Zone</p>
              </div>

              <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5">
                <div className="font-mono text-xs text-kf-text-steel uppercase">Today's Class Roster</div>
                <div className="font-display font-black text-3xl text-white mt-1">
                  24 / 24 <span className="font-mono text-xs text-kf-cyan font-normal">Full Seat Cap</span>
                </div>
                <p className="font-mono text-xs text-kf-text-steel mt-2">17:30 MetCon Savage Circuit</p>
              </div>

              <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5">
                <div className="font-mono text-xs text-kf-text-steel uppercase">Upcoming Lab Consults</div>
                <div className="font-display font-black text-3xl text-white mt-1">
                  1 <span className="font-mono text-xs text-amber-400 font-normal">Pending</span>
                </div>
                <p className="font-mono text-xs text-kf-text-steel mt-2">14:00 Alexander Vance (InBody)</p>
              </div>
            </div>

            {/* Live Athlete Floor Table */}
            <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-5 space-y-4">
              <h3 className="font-display font-bold text-base text-white">
                Assigned Athletes In-Facility Live Roster
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {athletes.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-kf-surface-2 border border-kf-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{a.name}</span>
                        <BadgeChip variant={a.status === 'ON FLOOR' ? 'active' : a.status === 'SCHEDULED' ? 'cyan' : 'neutral'}>
                          {a.status}
                        </BadgeChip>
                      </div>
                      <div className="text-kf-text-steel text-[11px] mt-1">
                        Tier: {a.tier} • Focus: {a.goal} • Checked in: {a.lastCheckIn}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedAthlete(a);
                          setIsAssessmentModalOpen(true);
                        }}
                        leftIcon={<Scale className="w-3.5 h-3.5" />}
                      >
                        Log Assessment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED CLIENTS */}
        {activeTab === 'clients' && (
          <div className="bg-kf-surface-1 border border-kf-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-kf-border flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-white uppercase">ABAC Protected Athlete Roster</span>
              <span className="text-kf-lime">4 Active Assignments</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-kf-surface-2 text-kf-text-steel border-b border-kf-border">
                  <tr>
                    <th className="py-3 px-4">ATHLETE</th>
                    <th className="py-3 px-4">TIER</th>
                    <th className="py-3 px-4">ATTENDANCE</th>
                    <th className="py-3 px-4">NUTRITION PROTOCOL</th>
                    <th className="py-3 px-4">ADHERENCE</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kf-border/40">
                  {athletes.map((a) => (
                    <tr key={a.id} className="hover:bg-kf-surface-2/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{a.name}</td>
                      <td className="py-3.5 px-4">
                        <BadgeChip variant={a.tier === 'ELITE_BLACK' ? 'active' : 'cyan'}>
                          {a.tier}
                        </BadgeChip>
                      </td>
                      <td className="py-3.5 px-4 text-kf-lime font-bold">{a.attendanceStreak} Days</td>
                      <td className="py-3.5 px-4 text-kf-text-steel">{a.dietPlan}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{a.dietAdherence}%</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedAthlete(a);
                            setIsAssessmentModalOpen(true);
                          }}
                          className="text-kf-lime hover:underline font-bold"
                        >
                          Log InBody &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULE & SHIFT COVER */}
        {activeTab === 'schedule' && (
          <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Assigned Coaching Timetable</h3>
                <p className="font-body text-xs text-kf-text-steel">Master Coach Shifts &amp; Group Sessions</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCoverModalOpen(true)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Cover Request
              </Button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { day: 'Monday', time: '06:00 - 07:00', title: 'MetCon Savage Circuit', studio: 'Studio 1 MetCon', enrolled: '24 / 24' },
                { day: 'Tuesday', time: '07:30 - 08:30', title: 'Strength Foundation', studio: 'Studio 4 Oly', enrolled: '16 / 16' },
                { day: 'Thursday', time: '06:00 - 07:00', title: 'MetCon Savage Circuit', studio: 'Studio 1 MetCon', enrolled: '24 / 24' },
                { day: 'Friday', time: '06:00 - 07:00', title: 'MetCon Savage Circuit', studio: 'Studio 1 MetCon', enrolled: '24 / 24' }
              ].map((s, idx) => (
                <div key={idx} className="p-3 bg-kf-surface-2 border border-kf-border rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{s.day} {s.time}</span>
                    <span className="text-kf-text-steel ml-3">{s.title} ({s.studio})</span>
                  </div>
                  <span className="text-kf-lime font-bold">{s.enrolled}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Log Assessment Modal */}
      <Modal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        title={`Log InBody 770 Scan: ${selectedAthlete?.name}`}
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <p className="font-body text-xs text-kf-text-steel">
            Record impedance biometric metrics directly into the athlete's immutable telemetry chart.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Body Fat %</label>
              <Input value={bfPercent} onChange={(e) => setBfPercent(e.target.value)} required />
            </div>
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Muscle Mass (kg)</label>
              <Input value={muscleKg} onChange={(e) => setMuscleKg(e.target.value)} required />
            </div>
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">BMI</label>
              <Input value={bmiVal} onChange={(e) => setBmiVal(e.target.value)} required />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-kf-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAssessmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Assessment Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Cover Modal */}
      <Modal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        title="Request Shift Coverage"
      >
        <form onSubmit={handleSubmitCoverRequest} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Select Shift / Session</label>
            <Input value={coverClass} onChange={(e) => setCoverClass(e.target.value)} required />
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Reason for Cover Request</label>
            <Input
              placeholder="e.g. Attending national weightlifting symposium"
              value={coverReason}
              onChange={(e) => setCoverReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-kf-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCoverModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit to Roster Supervisor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

