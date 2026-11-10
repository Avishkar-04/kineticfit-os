import React, { useState } from 'react';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Radio,
  Mail,
  Smartphone,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Button, BadgeChip, Modal, Input } from '@kineticfit/ui';

interface Announcement {
  id: string;
  title: string;
  message: string;
  target: 'ALL' | 'PRO_ELITE' | 'STAFF_ONLY';
  channels: string[];
  dispatchedAt: string;
  readRate: number;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Contrast Hydrotherapy Suite Maintenance',
    message: 'Cold plunge cold-filtration maintenance scheduled Thursday 13:00 - 15:00 UTC.',
    target: 'ALL',
    channels: ['PUSH', 'IN_APP'],
    dispatchedAt: 'Today 08:30',
    readRate: 84
  },
  {
    id: 'ann-002',
    title: 'Chrono-Nutrition Kitchen Lab Autumn Protocols',
    message: 'Four new seasonal mass gain and metabolic cutting recipes are now available in the athlete portal.',
    target: 'PRO_ELITE',
    channels: ['PUSH', 'IN_APP', 'EMAIL'],
    dispatchedAt: 'Yesterday 10:15',
    readRate: 92
  }
];

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'ALL' | 'PRO_ELITE' | 'STAFF_ONLY'>('ALL');
  const [channelPush, setChannelPush] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const channels: string[] = [];
    if (channelPush) channels.push('PUSH', 'IN_APP');
    if (channelEmail) channels.push('EMAIL');

    const newAnn: Announcement = {
      id: `ann-${String(announcements.length + 1).padStart(3, '0')}`,
      title,
      message,
      target,
      channels,
      dispatchedAt: 'Just now',
      readRate: 100
    };

    setAnnouncements([newAnn, ...announcements]);
    setIsComposeOpen(false);
    setTitle('');
    setMessage('');
    showToast(`Announcement dispatched to ${target === 'ALL' ? 'all 1,842 athletes' : target} across channels.`);
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
            <Bell className="w-3.5 h-3.5 text-kf-lime" />
            Communications & Broadcast
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Facility Announcements & Push Dispatches
          </h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsComposeOpen(true)}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Compose Broadcast
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-kf-surface-1 border border-kf-border rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white">{ann.title}</span>
                <BadgeChip variant={ann.target === 'ALL' ? 'active' : ann.target === 'PRO_ELITE' ? 'cyan' : 'neutral'}>
                  {ann.target.replace('_', ' ')}
                </BadgeChip>
              </div>

              <div className="font-mono text-xs text-kf-text-steel flex items-center gap-3">
                <span className="text-kf-lime font-bold">{ann.readRate}% Read Rate</span>
                <span>•</span>
                <span>Dispatched: {ann.dispatchedAt}</span>
              </div>
            </div>

            <p className="font-body text-xs text-kf-text-steel leading-relaxed">
              {ann.message}
            </p>

            <div className="pt-2 border-t border-kf-border/40 flex items-center gap-2 font-mono text-[11px] text-kf-text-steel">
              <span>CHANNELS:</span>
              {ann.channels.map((ch, i) => (
                <span key={i} className="bg-kf-surface-0 px-2 py-0.5 rounded border border-kf-border text-white">
                  {ch}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Compose Facility Broadcast"
      >
        <form onSubmit={handleDispatch} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Headline</label>
            <Input
              placeholder="e.g. Schedule update or equipment notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Target Audience</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as any)}
              className="w-full bg-kf-surface-2 border border-kf-border rounded px-3 py-2 font-mono text-xs text-white"
            >
              <option value="ALL">All Enrolled Athletes (1,842 Members)</option>
              <option value="PRO_ELITE">Pro &amp; Elite Black VIP Tiers Only</option>
              <option value="STAFF_ONLY">Coaching &amp; Front Desk Staff Only</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Broadcast Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-kf-surface-2 border border-kf-border rounded p-3 font-mono text-xs text-white focus:outline-none focus:border-kf-lime"
              placeholder="Enter announcement details..."
              required
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-kf-border font-mono text-xs">
            <span className="text-kf-text-steel">Delivery Channels:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={channelPush}
                  onChange={(e) => setChannelPush(e.target.checked)}
                  className="rounded border-kf-border text-kf-lime"
                />
                Push Notification &amp; In-App Banner
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={channelEmail}
                  onChange={(e) => setChannelEmail(e.target.checked)}
                  className="rounded border-kf-border text-kf-lime"
                />
                Email Digest
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-kf-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsComposeOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Dispatch Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
