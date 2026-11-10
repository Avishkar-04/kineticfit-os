import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  UserPlus,
  Phone,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Mail,
  ChevronRight
} from 'lucide-react';
import { Button, BadgeChip, Modal, Input } from '@kineticfit/ui';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'ON FLOOR' | 'CONSULT' | 'OFF DUTY';
  zone: string;
  certs: string;
  email: string;
  phone: string;
  weeklyHours: number;
  athletesAssigned: number;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-001',
    name: 'Elena Rostova',
    role: 'Strength Master Coach',
    status: 'ON FLOOR',
    zone: 'Studio 1 MetCon',
    certs: 'CSCS, USAW L3, FMS Level 2',
    email: 'elena@kineticfit.dev',
    phone: '+1 (555) 234-8901',
    weeklyHours: 38,
    athletesAssigned: 28
  },
  {
    id: 'staff-002',
    name: 'David Kim',
    role: 'Conditioning Specialist',
    status: 'ON FLOOR',
    zone: 'Studio 3 Cycle',
    certs: 'NSCA-CPT, Wattbike Master Trainer',
    email: 'david.kim@kineticfit.dev',
    phone: '+1 (555) 234-8902',
    weeklyHours: 35,
    athletesAssigned: 22
  },
  {
    id: 'staff-003',
    name: 'Jaxson Hayes',
    role: 'Lead Strength Specialist',
    status: 'OFF DUTY',
    zone: 'Studio 4 Oly',
    certs: 'CSCS, EXOS Performance Specialist',
    email: 'jaxson@kineticfit.dev',
    phone: '+1 (555) 234-8903',
    weeklyHours: 32,
    athletesAssigned: 19
  },
  {
    id: 'staff-004',
    name: 'Maya Lin',
    role: 'Mobility & Yoga Coach',
    status: 'ON FLOOR',
    zone: 'Studio 2 Yoga',
    certs: 'E-RYT 500, FRC Mobility Specialist',
    email: 'maya.lin@kineticfit.dev',
    phone: '+1 (555) 234-8904',
    weeklyHours: 30,
    athletesAssigned: 16
  },
  {
    id: 'staff-005',
    name: 'Dr. Aris Thorne',
    role: 'Sports Dietitian & Lab Lead',
    status: 'CONSULT',
    zone: 'Kitchen Lab',
    certs: 'RD, CSSD, PhD Exercise Physiology',
    email: 'aris.thorne@kineticfit.dev',
    phone: '+1 (555) 234-8905',
    weeklyHours: 40,
    athletesAssigned: 35
  },
  {
    id: 'staff-006',
    name: 'Soren Lindqvist',
    role: 'Recovery & Hydro Specialist',
    status: 'ON FLOOR',
    zone: 'Recovery Zone',
    certs: 'BSc Kinesiology, ART Certified',
    email: 'soren@kineticfit.dev',
    phone: '+1 (555) 234-8906',
    weeklyHours: 36,
    athletesAssigned: 14
  },
  {
    id: 'staff-007',
    name: 'Liam Brooks',
    role: 'High Performance Coach',
    status: 'OFF DUTY',
    zone: 'Studio 1 MetCon',
    certs: 'CSCS, CF-L3',
    email: 'liam.brooks@kineticfit.dev',
    phone: '+1 (555) 234-8907',
    weeklyHours: 28,
    athletesAssigned: 18
  },
  {
    id: 'staff-008',
    name: 'Marcus Vance',
    role: 'Operations Director',
    status: 'ON FLOOR',
    zone: 'Admin HQ',
    certs: 'MBA, CPR/AED Instructor',
    email: 'director@kineticfit.dev',
    phone: '+1 (555) 234-8900',
    weeklyHours: 45,
    athletesAssigned: 0
  }
];

interface CoverRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  shiftDate: string;
  shiftTime: string;
  className: string;
  zone: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
}

const INITIAL_COVER_REQUESTS: CoverRequest[] = [
  {
    id: 'cov-101',
    requesterName: 'Jaxson Hayes',
    requesterRole: 'Lead Strength Specialist',
    shiftDate: 'Friday, Oct 30',
    shiftTime: '06:00 - 09:30',
    className: 'Olympic Weightlifting Clinic',
    zone: 'Studio 4 Oly',
    reason: 'Attending regional Olympic weightlifting coaching symposium.',
    status: 'PENDING'
  },
  {
    id: 'cov-102',
    requesterName: 'David Kim',
    requesterRole: 'Conditioning Specialist',
    shiftDate: 'Saturday, Oct 31',
    shiftTime: '08:00 - 11:30',
    className: 'Rhythm Spin 45 & MetCon',
    zone: 'Studio 3 Cycle',
    reason: 'Family event out of town.',
    status: 'PENDING'
  }
];

export const StaffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'calendar' | 'covers'>('directory');
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [coverRequests, setCoverRequests] = useState<CoverRequest[]>(INITIAL_COVER_REQUESTS);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Modals & Toasts
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Strength Coach');
  const [inviteZone, setInviteZone] = useState('Studio 1 MetCon');
  const [inviteCerts, setInviteCerts] = useState('CSCS');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveCover = (id: string) => {
    setCoverRequests(
      coverRequests.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
    showToast('Cover request approved. Shift reassigned to roster cover pool.');
  };

  const handleDeclineCover = (id: string) => {
    setCoverRequests(
      coverRequests.map((r) => (r.id === id ? { ...r, status: 'DECLINED' } : r))
    );
    showToast('Cover request declined. Coach notified.');
  };

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newStaff: StaffMember = {
      id: `staff-${String(staff.length + 1).padStart(3, '0')}`,
      name: inviteName,
      role: inviteRole,
      status: 'OFF DUTY',
      zone: inviteZone,
      certs: inviteCerts,
      email: inviteEmail,
      phone: '+1 (555) 234-8999',
      weeklyHours: 30,
      athletesAssigned: 0
    };

    setStaff([...staff, newStaff]);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Staff invitation sent to ${inviteName} (${inviteEmail}).`);
  };

  const pendingCoverCount = coverRequests.filter((c) => c.status === 'PENDING').length;

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
            <ShieldCheck className="w-3.5 h-3.5 text-kf-lime" />
            Personnel Operations & Roster
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Trainers, Specialists & Shift Scheduling
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab('covers')}
            leftIcon={<AlertCircle className="w-3.5 h-3.5 text-kf-cyan" />}
          >
            Cover Inbox {pendingCoverCount > 0 && `(${pendingCoverCount})`}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Invite Staff
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-kf-border pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'directory'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Staff Directory ({staff.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'calendar'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Weekly Shift Roster Calendar
        </button>

        <button
          onClick={() => setActiveTab('covers')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'covers'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Cover Requests Inbox
          {pendingCoverCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-kf-lime text-kf-surface-0 text-[10px] font-bold">
              {pendingCoverCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Staff Directory */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staff.map((s) => (
            <div
              key={s.id}
              className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <BadgeChip
                  variant={
                    s.status === 'ON FLOOR'
                      ? 'active'
                      : s.status === 'CONSULT'
                      ? 'cyan'
                      : 'neutral'
                  }
                >
                  {s.status}
                </BadgeChip>
                <span className="font-mono text-[11px] text-kf-text-steel flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-kf-lime" />
                  {s.zone}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-white">{s.name}</h3>
                <p className="font-body text-xs text-kf-lime mt-0.5 font-medium">{s.role}</p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-kf-text-steel">
                <div className="flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-kf-cyan flex-shrink-0" />
                  <span className="truncate">{s.certs}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-kf-border/60 flex items-center justify-between font-mono text-xs">
                <span className="text-kf-text-steel">
                  <strong className="text-white">{s.athletesAssigned}</strong> Athletes
                </span>
                <span className="text-kf-text-steel">
                  <strong className="text-white">{s.weeklyHours}h</strong> / wk
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Weekly Shift Roster Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Floor Roster: Oct 26 – Nov 1, 2026
              </h3>
              <p className="font-body text-xs text-kf-text-steel mt-0.5">
                Downtown Flagship Hub • Shift Coverage & Class Assignments
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-kf-lime inline-block" />
                Morning (06:00 - 14:00)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-kf-cyan inline-block" />
                Evening (14:00 - 22:00)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-7 gap-2 font-mono text-xs text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="bg-kf-surface-2 p-2 rounded text-kf-text-steel font-bold">
                  {day} <span className="text-white font-normal">2{6 + i}</span>
                </div>
              ))}

              {/* Roster shifts simulation */}
              <div className="space-y-2">
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-lime/40 text-left">
                  <div className="font-bold text-kf-lime">06:00 Elena</div>
                  <div className="text-[10px] text-kf-text-steel">MetCon Savage</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">14:00 David</div>
                  <div className="text-[10px] text-kf-text-steel">Rhythm Spin</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-lime/40 text-left">
                  <div className="font-bold text-kf-lime">06:00 Jaxson</div>
                  <div className="text-[10px] text-kf-text-steel">Oly Clinic</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">15:00 Maya</div>
                  <div className="text-[10px] text-kf-text-steel">Vinyasa Flow</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-lime/40 text-left">
                  <div className="font-bold text-kf-lime">07:00 Liam</div>
                  <div className="text-[10px] text-kf-text-steel">MetCon Circuit</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">14:00 Soren</div>
                  <div className="text-[10px] text-kf-text-steel">Hydro Recovery</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-lime/40 text-left">
                  <div className="font-bold text-kf-lime">06:00 Elena</div>
                  <div className="text-[10px] text-kf-text-steel">MetCon Savage</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">16:00 David</div>
                  <div className="text-[10px] text-kf-text-steel">Sprint 45</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/50 text-left">
                  <div className="font-bold text-amber-400">06:00 COVER REQ</div>
                  <div className="text-[10px] text-kf-text-steel">Oly Clinic (Jaxson)</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">14:00 Maya</div>
                  <div className="text-[10px] text-kf-text-steel">Restorative Flow</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-500/50 text-left">
                  <div className="font-bold text-amber-400">08:00 COVER REQ</div>
                  <div className="text-[10px] text-kf-text-steel">Cycle 45 (David)</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">12:00 Soren</div>
                  <div className="text-[10px] text-kf-text-steel">Contrast Bath</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-lime/40 text-left">
                  <div className="font-bold text-kf-lime">09:00 Maya</div>
                  <div className="text-[10px] text-kf-text-steel">Sunday Flow</div>
                </div>
                <div className="p-2 rounded bg-kf-surface-0 border border-kf-cyan/40 text-left">
                  <div className="font-bold text-kf-cyan">14:00 Liam</div>
                  <div className="text-[10px] text-kf-text-steel">MetCon Core</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cover Requests Inbox */}
      {activeTab === 'covers' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Coaches Shift Cover Requests Inbox
              </h3>
              <p className="font-body text-xs text-kf-text-steel mt-0.5">
                Pending requests submitted by coaching personnel requiring supervisor approval or peer substitution.
              </p>
            </div>
            <BadgeChip variant="active">{coverRequests.length} Total Requests</BadgeChip>
          </div>

          <div className="space-y-3">
            {coverRequests.map((req) => (
              <div
                key={req.id}
                className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">
                      {req.requesterName}
                    </span>
                    <span className="font-mono text-xs text-kf-lime">({req.requesterRole})</span>
                    <BadgeChip
                      variant={
                        req.status === 'PENDING'
                          ? 'cyan'
                          : req.status === 'APPROVED'
                          ? 'active'
                          : 'danger'
                      }
                    >
                      {req.status}
                    </BadgeChip>
                  </div>

                  <div className="font-mono text-xs text-kf-text-steel flex items-center gap-3">
                    <span className="text-white font-semibold">{req.shiftDate}</span>
                    <span>•</span>
                    <span className="text-kf-cyan font-bold">{req.shiftTime}</span>
                    <span>•</span>
                    <span>{req.className} ({req.zone})</span>
                  </div>

                  <p className="font-body text-xs text-kf-text-steel italic pt-1">
                    "{req.reason}"
                  </p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeclineCover(req.id)}
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-kf-danger" />}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveCover(req.id)}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve Cover
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Athletic Specialist / Coach"
      >
        <form onSubmit={handleInviteStaff} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Full Name</label>
            <Input
              placeholder="e.g. Rachel Sterling"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="rachel.sterling@kineticfit.dev"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Role Title</label>
              <Input
                placeholder="Strength Specialist"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Primary Zone</label>
              <select
                value={inviteZone}
                onChange={(e) => setInviteZone(e.target.value)}
                className="w-full bg-kf-surface-2 border border-kf-border rounded px-3 py-2 font-mono text-xs text-white"
              >
                <option value="Studio 1 MetCon">Studio 1 MetCon</option>
                <option value="Studio 2 Yoga">Studio 2 Yoga</option>
                <option value="Studio 3 Cycle">Studio 3 Cycle</option>
                <option value="Studio 4 Oly">Studio 4 Oly</option>
                <option value="Kitchen Lab">Kitchen Lab</option>
                <option value="Recovery Zone">Recovery Zone</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Certifications</label>
            <Input
              placeholder="CSCS, USAW L2, FMS"
              value={inviteCerts}
              onChange={(e) => setInviteCerts(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-kf-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Dispatch Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
