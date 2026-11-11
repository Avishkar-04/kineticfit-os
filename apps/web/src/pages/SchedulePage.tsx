import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button, BadgeChip, Modal, Input } from '@kineticfit/ui';

export const SchedulePage: React.FC = () => {
  const [selectedStudio, setSelectedStudio] = useState('ALL');
  const [currentWeek, setCurrentWeek] = useState(43);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStudio, setNewStudio] = useState('Studio 1 MetCon');
  const [newCoach, setNewCoach] = useState('Elena Rostova');
  const [newTime, setNewTime] = useState('09:00 - 10:00');
  const [newCapacity, setNewCapacity] = useState('20');

  const [sessions, setSessions] = useState([
    { id: '1', title: 'MetCon Savage Circuit', studio: 'Studio 1 MetCon', coach: 'Elena Rostova', time: '07:00 - 08:00', booked: 24, capacity: 24, waitlist: 4, tag: 'FULL' },
    { id: '2', title: 'Power Vinyasa Flow', studio: 'Studio 2 Yoga', coach: 'Maya Lin', time: '08:30 - 09:30', booked: 18, capacity: 20, waitlist: 0, tag: 'OPEN' },
    { id: '3', title: 'Olympic Weightlifting Clinic', studio: 'Studio 4 Oly Lifting', coach: 'Jaxson Hayes', time: '11:00 - 12:30', booked: 12, capacity: 12, waitlist: 2, tag: 'FULL' },
    { id: '4', title: 'Rhythm Spin 45', studio: 'Studio 3 Cycle', coach: 'David Kim', time: '17:30 - 18:15', booked: 28, capacity: 30, waitlist: 0, tag: 'ALMOST FULL' },
    { id: '5', title: 'Contrast Hydro & Sauna', studio: 'Recovery Zone', coach: 'Soren Lindqvist', time: '19:00 - 20:00', booked: 15, capacity: 15, waitlist: 6, tag: 'FULL' }
  ]);

  const filteredSessions = sessions.filter((s) => {
    if (selectedStudio === 'ALL') return true;
    return s.studio.toLowerCase().includes(selectedStudio.toLowerCase());
  });

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const cap = parseInt(newCapacity, 10) || 20;
    const newSession = {
      id: String(Date.now()),
      title: newTitle.trim(),
      studio: newStudio,
      coach: newCoach,
      time: newTime,
      booked: 0,
      capacity: cap,
      waitlist: 0,
      tag: 'OPEN'
    };
    setSessions([newSession, ...sessions]);
    setNewTitle('');
    setIsAddSessionModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Timetable Engine
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Class Schedule & Studio Allocation
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddSessionModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            + Add Session
          </Button>
        </div>
      </div>

      {/* Week Navigator + Studio Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-kf-surface-1 border border-kf-border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek((w) => w - 1)}
            aria-label="Previous week"
            className="p-1.5 bg-kf-surface-2 hover:bg-kf-surface-3 rounded border border-kf-border text-white focus:outline-none focus:ring-1 focus:ring-kf-lime"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-xs text-white px-2">
            Week {currentWeek} {currentWeek === 43 ? '(Current)' : ''}
          </span>
          <button
            onClick={() => setCurrentWeek((w) => w + 1)}
            aria-label="Next week"
            className="p-1.5 bg-kf-surface-2 hover:bg-kf-surface-3 rounded border border-kf-border text-white focus:outline-none focus:ring-1 focus:ring-kf-lime"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'Studio 1 MetCon', 'Studio 2 Yoga', 'Studio 3 Cycle', 'Studio 4 Oly', 'Recovery'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStudio(st)}
              className={`px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedStudio === st ? 'bg-kf-surface-2 text-kf-lime border border-kf-lime/40' : 'bg-kf-surface-lowest text-kf-text-steel border border-kf-border hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-kf-surface-1 border border-kf-border rounded-lg text-kf-text-steel font-mono text-xs">
            No training sessions scheduled for {selectedStudio} in Week {currentWeek}.
          </div>
        ) : (
          filteredSessions.map((s) => (
            <div key={s.id} className="bg-kf-surface-1 border border-kf-border rounded-lg p-4 space-y-3 hover:border-slate-500 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-kf-cyan font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {s.time}
                </span>
                <BadgeChip variant={s.tag === 'FULL' ? 'danger' : s.tag === 'ALMOST FULL' ? 'cyan' : 'active'}>
                  {s.tag}
                </BadgeChip>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-white">{s.title}</h3>
                <p className="font-body text-xs text-kf-text-steel mt-0.5">{s.studio} • Coach {s.coach}</p>
              </div>

              <div className="pt-2 border-t border-kf-border/60 flex items-center justify-between font-mono text-xs">
                <span className="text-kf-text-steel">
                  Capacity: <strong className="text-white">{s.booked}/{s.capacity}</strong>
                </span>
                {s.waitlist > 0 && (
                  <span className="text-kf-danger font-semibold">Waitlist: {s.waitlist}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Session Modal */}
      <Modal
        isOpen={isAddSessionModalOpen}
        onClose={() => setIsAddSessionModalOpen(false)}
        title="Schedule New Training Session"
        subtitle="Allocate studio floor and assign Master Coach"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSession}>
              Confirm Session
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSession} className="space-y-4">
          <Input
            label="Session Title"
            placeholder="e.g. High-Intensity MetCon"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-semibold tracking-wider uppercase text-kf-text-steel block mb-1">
                Studio Allocation
              </label>
              <select
                value={newStudio}
                onChange={(e) => setNewStudio(e.target.value)}
                className="w-full h-10 px-3 bg-kf-surface-lowest text-white font-body text-sm border border-kf-border rounded focus:outline-none focus:border-kf-lime"
              >
                <option value="Studio 1 MetCon">Studio 1 MetCon</option>
                <option value="Studio 2 Yoga">Studio 2 Yoga</option>
                <option value="Studio 3 Cycle">Studio 3 Cycle</option>
                <option value="Studio 4 Oly Lifting">Studio 4 Oly Lifting</option>
                <option value="Recovery Zone">Recovery Zone</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-xs font-semibold tracking-wider uppercase text-kf-text-steel block mb-1">
                Coach Assignment
              </label>
              <select
                value={newCoach}
                onChange={(e) => setNewCoach(e.target.value)}
                className="w-full h-10 px-3 bg-kf-surface-lowest text-white font-body text-sm border border-kf-border rounded focus:outline-none focus:border-kf-lime"
              >
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Jaxson Hayes">Jaxson Hayes</option>
                <option value="Maya Lin">Maya Lin</option>
                <option value="David Kim">David Kim</option>
                <option value="Soren Lindqvist">Soren Lindqvist</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Time Range"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <Input
              label="Max Capacity"
              type="number"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
