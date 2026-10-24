import React, { useState } from 'react';
import { Utensils, Download, Plus, Flame, Activity } from 'lucide-react';
import { Button, BadgeChip, ProgressRing } from '@kineticfit/ui';

export const NutritionPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const protocols = [
    { id: '1', title: 'Hypertrophy & Mass Gain', kcal: '3,200 - 3,500', split: '40C / 35P / 25F', athletes: 312, tier: 'PRO', status: 'ACTIVE' },
    { id: '2', title: 'Fat Loss & Metabolic Cut', kcal: '1,800 - 2,100', split: '30C / 45P / 25F', athletes: 243, tier: 'STANDARD', status: 'ACTIVE' },
    { id: '3', title: 'Keto & Metabolic Flexibility', kcal: '2,200', split: '5C / 30P / 65F', athletes: 54, tier: 'PRO', status: 'ACTIVE' },
    { id: '4', title: 'Endurance & Stamina Engine', kcal: '2,800', split: '55C / 25P / 20F', athletes: 31, tier: 'ELITE_BLACK', status: 'ACTIVE' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold">
            Nutritional Protocols
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Chrono-Nutrition & Kitchen Lab Protocols
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Meal Guide PDF
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            + Create New Protocol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {protocols.map((p) => (
          <div key={p.id} className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4 hover:border-slate-500 transition-colors">
            <div className="flex items-center justify-between">
              <BadgeChip variant="active">{p.tier}</BadgeChip>
              <span className="font-mono text-xs text-kf-lime font-bold">{p.athletes} Enrolled</span>
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-white">{p.title}</h3>
              <p className="font-mono text-xs text-kf-cyan mt-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {p.kcal} kcal/day
              </p>
            </div>

            <div className="pt-2 border-t border-kf-border/60 font-mono text-[11px] text-kf-text-steel">
              Macro Target: <span className="text-white font-semibold">{p.split}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
