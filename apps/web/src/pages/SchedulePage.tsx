import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button, BadgeChip } from '@kineticfit/ui';

export const SchedulePage: React.FC = () => {
  const [selectedStudio, setSelectedStudio] = useState('ALL');

  const sessions = [
    { id: '1', title: 'MetCon Savage Circuit', studio: 'Studio 1 MetCon', coach: 'Elena Rostova', time: '07:00 - 08:00', booked: 24, capacity: 24, waitlist: 4, tag: 'FULL' },
    { id: '2', title: 'Power Vinyasa Flow', studio: 'Studio 2 Yoga', coach: 'Maya Lin', time: '08:30 - 09:30', booked: 18, capacity: 20, waitlist: 0, tag: 'OPEN' },
    { id: '3', title: 'Olympic Weightlifting Clinic', studio: 'Studio 4 Oly Lifting', coach: 'Jaxson Hayes', time: '11:00 - 12:30', booked: 12, capacity: 12, waitlist: 2, tag: 'FULL' },
    { id: '4', title: 'Rhythm Spin 45', studio: 'Studio 3 Cycle', coach: 'David Kim', time: '17:30 - 18:15', booked: 28, capacity: 30, waitlist: 0, tag: 'ALMOST FULL' },
    { id: '5', title: 'Contrast Hydro & Sauna', studio: 'Recovery Zone', coach: 'Soren Lindqvist', time: '19:00 - 20:00', booked: 15, capacity: 15, waitlist: 6, tag: 'FULL' }
  ];

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
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            + Add Session
          </Button>
        </div>
      </div>

      {/* Week Navigator + Studio Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-kf-surface-1 border border-kf-border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <button className="p-1.5 bg-kf-surface-2 hover:bg-kf-surface-3 rounded border border-kf-border text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-xs text-white px-2">Week 43 (Current)</span>
          <button className="p-1.5 bg-kf-surface-2 hover:bg-kf-surface-3 rounded border border-kf-border text-white">
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
        {sessions.map((s) => (
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
        ))}
      </div>
    </div>
  );
};
