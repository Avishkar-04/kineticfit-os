import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Radio,
  Layers,
  Activity
} from 'lucide-react';
import { Button, BadgeChip, Modal, Input } from '@kineticfit/ui';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  serialNo: string;
  zone: string;
  status: 'NOMINAL' | 'MAINTENANCE_DUE' | 'OUT_OF_SERVICE';
  lastInspected: string;
}

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  { id: 'eq-01', name: 'Eleiko IWF Weightlifting Bar (20kg)', category: 'FREE_WEIGHTS', serialNo: 'ELK-2026-9041', zone: 'Studio 4 Oly', status: 'NOMINAL', lastInspected: '2026-10-18' },
  { id: 'eq-02', name: 'Wattbike AtomX Smart Trainer #04', category: 'CARDIO', serialNo: 'WTB-2026-4412', zone: 'Studio 3 Cycle', status: 'NOMINAL', lastInspected: '2026-10-20' },
  { id: 'eq-03', name: 'Woodway Curve Treadmill #02', category: 'CARDIO', serialNo: 'WDW-2026-8819', zone: 'Studio 1 MetCon', status: 'MAINTENANCE_DUE', lastInspected: '2026-09-12' },
  { id: 'eq-04', name: 'Cold Plunge Commercial Hydro Suite', category: 'RECOVERY', serialNo: 'CPH-2026-0104', zone: 'Recovery Zone', status: 'NOMINAL', lastInspected: '2026-10-22' },
  { id: 'eq-05', name: 'InBody 770 Multi-Frequency Analyzer', category: 'DIAGNOSTIC', serialNo: 'INB-2026-7701', zone: 'Kitchen Lab', status: 'NOMINAL', lastInspected: '2026-10-24' }
];

export const FacilitiesPage: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [activeTab, setActiveTab] = useState<'equipment' | 'lockers' | 'sectors'>('equipment');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sector Capacities
  const [sectorCaps, setSectorCaps] = useState({
    gymFloor: 180,
    studio1: 30,
    studio2: 24,
    studio3: 30,
    studio4: 20,
    recovery: 16
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateSector = (sector: keyof typeof sectorCaps, val: number) => {
    setSectorCaps({ ...sectorCaps, [sector]: val });
    showToast(`Sector limit updated to ${val} athletes.`);
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
            <Building2 className="w-3.5 h-3.5 text-kf-lime" />
            Facility Operations &amp; Assets
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Equipment Inventory, Lockers &amp; Sectors
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <BadgeChip variant="active">Hub: Downtown Flagship</BadgeChip>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-kf-border pb-2">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'equipment'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Equipment Inventory ({equipment.length})
        </button>

        <button
          onClick={() => setActiveTab('lockers')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'lockers'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Digital Lockers (120 Total)
        </button>

        <button
          onClick={() => setActiveTab('sectors')}
          className={`px-4 py-2 font-mono text-xs rounded-t font-semibold transition-colors ${
            activeTab === 'sectors'
              ? 'bg-kf-surface-1 text-kf-lime border-b-2 border-kf-lime'
              : 'text-kf-text-steel hover:text-white'
          }`}
        >
          Sector Capacity Configuration
        </button>
      </div>

      {/* TAB 1: Equipment Inventory */}
      {activeTab === 'equipment' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-kf-border flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-white uppercase">Certified Athletic Assets</span>
            <span className="text-kf-lime">100% Calibrated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-kf-surface-2 text-kf-text-steel border-b border-kf-border">
                <tr>
                  <th className="py-3 px-4">EQUIPMENT</th>
                  <th className="py-3 px-4">SERIAL NUMBER</th>
                  <th className="py-3 px-4">ZONE</th>
                  <th className="py-3 px-4">LAST INSPECTION</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kf-border/40">
                {equipment.map((item) => (
                  <tr key={item.id} className="hover:bg-kf-surface-2/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-3.5 px-4 text-kf-text-steel">{item.serialNo}</td>
                    <td className="py-3.5 px-4 text-kf-cyan">{item.zone}</td>
                    <td className="py-3.5 px-4 text-kf-text-steel">{item.lastInspected}</td>
                    <td className="py-3.5 px-4">
                      <BadgeChip variant={item.status === 'NOMINAL' ? 'active' : item.status === 'MAINTENANCE_DUE' ? 'cyan' : 'danger'}>
                        {item.status.replace('_', ' ')}
                      </BadgeChip>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => showToast(`Service ticket opened for ${item.serialNo}`)}
                        className="text-kf-lime hover:underline font-bold"
                      >
                        Log Service
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Digital Lockers */}
      {activeTab === 'lockers' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Downtown Flagship Digital Locker Terminal
              </h3>
              <p className="font-body text-xs text-kf-text-steel mt-0.5">
                RFID-linked locker telemetry (84 Occupied / 36 Available)
              </p>
            </div>
            <BadgeChip variant="active">70% Saturation</BadgeChip>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 font-mono text-[11px] text-center">
            {Array.from({ length: 48 }).map((_, i) => {
              const isOccupied = (i * 7) % 3 !== 0;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded border flex flex-col items-center justify-center ${
                    isOccupied
                      ? 'bg-kf-surface-2 border-kf-border text-kf-text-steel'
                      : 'bg-kf-surface-0 border-kf-lime/40 text-kf-lime font-bold'
                  }`}
                >
                  <Lock className="w-3 h-3 mb-1" />
                  <span>#{String(i + 1).padStart(3, '0')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Sector Capacity Configuration */}
      {activeTab === 'sectors' && (
        <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Dynamic Sector Capacity Tuning
            </h3>
            <p className="font-body text-xs text-kf-text-steel mt-0.5">
              Turnstile flow algorithm shedding thresholds applied per zone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 space-y-2">
              <div className="text-white font-bold">Main Gym Floor</div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={sectorCaps.gymFloor}
                  onChange={(e) => handleUpdateSector('gymFloor', Number(e.target.value))}
                />
                <span className="text-kf-text-steel">Athletes</span>
              </div>
            </div>

            <div className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 space-y-2">
              <div className="text-white font-bold">Studio 1 MetCon</div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={sectorCaps.studio1}
                  onChange={(e) => handleUpdateSector('studio1', Number(e.target.value))}
                />
                <span className="text-kf-text-steel">Athletes</span>
              </div>
            </div>

            <div className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 space-y-2">
              <div className="text-white font-bold">Studio 2 Yoga</div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={sectorCaps.studio2}
                  onChange={(e) => handleUpdateSector('studio2', Number(e.target.value))}
                />
                <span className="text-kf-text-steel">Athletes</span>
              </div>
            </div>

            <div className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 space-y-2">
              <div className="text-white font-bold">Studio 3 Cycle</div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={sectorCaps.studio3}
                  onChange={(e) => handleUpdateSector('studio3', Number(e.target.value))}
                />
                <span className="text-kf-text-steel">Athletes</span>
              </div>
            </div>

            <div className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 space-y-2">
              <div className="text-white font-bold">Studio 4 Olympic Oly</div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={sectorCaps.studio4}
                  onChange={(e) => handleUpdateSector('studio4', Number(e.target.value))}
                />
                <span className="text-kf-text-steel">Athletes</span>
              </div>
            </div>

            <div className="bg-kf-surface-2 border border-kf-border rounded-lg p-4 space-y-2">
              <div className="text-white font-bold">Recovery &amp; Hydro Zone</div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={sectorCaps.recovery}
                  onChange={(e) => handleUpdateSector('recovery', Number(e.target.value))}
                />
                <span className="text-kf-text-steel">Athletes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
