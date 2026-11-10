import React, { useState } from 'react';
import {
  Utensils,
  Download,
  Plus,
  Flame,
  Activity,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  Calculator,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button, BadgeChip, ProgressRing, Modal, Input } from '@kineticfit/ui';
import { DietProtocolDto, ProtocolMealDto } from '@kineticfit/contracts';

interface ExtendedProtocol extends DietProtocolDto {
  athletesCount: number;
  macroSplit: string;
}

const DEFAULT_PROTOCOLS: ExtendedProtocol[] = [
  {
    id: '01931668-9000-7000-8000-000000000001',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    title: 'Hypertrophy Surge 3200',
    category: 'MASS_GAIN',
    kcalTarget: 3200,
    proteinGrams: 220,
    carbGrams: 380,
    fatGrams: 75,
    tier: 'ELITE_BLACK',
    version: 1,
    status: 'PUBLISHED',
    athletesCount: 312,
    macroSplit: '45C / 30P / 25F',
    createdAt: '2026-10-01T08:00:00Z',
    meals: [
      {
        name: 'Anabolic Dawn Breakfast',
        timeOffsetMinutes: 30,
        macrosJson: { calories: 850, protein: 55, carbs: 95, fat: 22 },
        prepNotes: 'Organic cage-free eggs, steel-cut oats with whey isolate, wild blueberries.'
      },
      {
        name: 'Mid-Morning Glycogen Primer',
        timeOffsetMinutes: 180,
        macrosJson: { calories: 550, protein: 40, carbs: 65, fat: 12 },
        prepNotes: 'Triple-filtered Greek yogurt with raw Manuka honey, banana, crushed almonds.'
      },
      {
        name: 'Pre-Session Glycogen Load',
        timeOffsetMinutes: 360,
        macrosJson: { calories: 750, protein: 50, carbs: 100, fat: 15 },
        prepNotes: 'Steamed jasmine rice, grass-fed flank steak, broccoli florets with Himalayan pink salt.'
      },
      {
        name: 'Post-Workout Micro-Partition',
        timeOffsetMinutes: 540,
        macrosJson: { calories: 450, protein: 45, carbs: 60, fat: 4 },
        prepNotes: 'Hydrolyzed whey isolate shake with cyclic dextrin and electrolyte mineral salts.'
      },
      {
        name: 'Circadian Repair Dinner',
        timeOffsetMinutes: 720,
        macrosJson: { calories: 600, protein: 30, carbs: 60, fat: 22 },
        prepNotes: 'Atlantic wild-caught salmon, sweet potato mash, steamed asparagus spears.'
      }
    ]
  },
  {
    id: '01931668-9000-7000-8000-000000000002',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    title: 'Fat Loss & Metabolic Cut 2100',
    category: 'FAT_LOSS',
    kcalTarget: 2100,
    proteinGrams: 195,
    carbGrams: 150,
    fatGrams: 55,
    tier: 'PRO',
    version: 1,
    status: 'PUBLISHED',
    athletesCount: 243,
    macroSplit: '30C / 45P / 25F',
    createdAt: '2026-10-05T09:00:00Z',
    meals: [
      {
        name: 'Power Protein Scramble',
        timeOffsetMinutes: 60,
        macrosJson: { calories: 520, protein: 48, carbs: 25, fat: 18 },
        prepNotes: 'Egg whites with 2 pasture-raised eggs, Hass avocado, baby spinach.'
      },
      {
        name: 'Thermogenic Mid-Day Bowl',
        timeOffsetMinutes: 300,
        macrosJson: { calories: 680, protein: 60, carbs: 65, fat: 16 },
        prepNotes: 'Grilled skinless chicken breast, tricolor quinoa, zucchini noodles.'
      },
      {
        name: 'Evening Lean Recovery',
        timeOffsetMinutes: 660,
        macrosJson: { calories: 550, protein: 52, carbs: 40, fat: 14 },
        prepNotes: 'Pacific wild cod fillets, green asparagus, roasted sweet potato wedges.'
      },
      {
        name: 'Slow-Release Casein Pudding',
        timeOffsetMinutes: 840,
        macrosJson: { calories: 350, protein: 35, carbs: 20, fat: 7 },
        prepNotes: 'Micellar casein protein whip with unsweetened almond milk and Ceylon cinnamon.'
      }
    ]
  },
  {
    id: '01931668-9000-7000-8000-000000000003',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    title: 'Keto & Metabolic Flexibility 2200',
    category: 'KETO',
    kcalTarget: 2200,
    proteinGrams: 165,
    carbGrams: 30,
    fatGrams: 160,
    tier: 'PRO',
    version: 1,
    status: 'PUBLISHED',
    athletesCount: 54,
    macroSplit: '5C / 30P / 65F',
    createdAt: '2026-10-10T11:00:00Z',
    meals: [
      {
        name: 'Ketogenic Breakfast Scramble',
        timeOffsetMinutes: 45,
        macrosJson: { calories: 750, protein: 42, carbs: 6, fat: 62 },
        prepNotes: 'Eggs poached in grass-fed ghee, smoked bacon, half avocado.'
      },
      {
        name: 'MCT Fuel & Tuna Avocado Salad',
        timeOffsetMinutes: 330,
        macrosJson: { calories: 780, protein: 65, carbs: 12, fat: 54 },
        prepNotes: 'Albacore tuna in extra virgin olive oil, walnut pieces, mixed greens.'
      },
      {
        name: 'Ribeye Steak with Garlic Butter',
        timeOffsetMinutes: 690,
        macrosJson: { calories: 670, protein: 58, carbs: 12, fat: 44 },
        prepNotes: 'Prime ribeye grilled rare, herb grass-fed butter, sautéed broccolini.'
      }
    ]
  },
  {
    id: '01931668-9000-7000-8000-000000000004',
    orgId: '01931668-8000-7000-8000-000000000001',
    hubId: '01931668-8000-7000-8000-000000000002',
    title: 'Endurance & Stamina Engine 2800',
    category: 'ENDURANCE',
    kcalTarget: 2800,
    proteinGrams: 175,
    carbGrams: 385,
    fatGrams: 62,
    tier: 'ELITE_BLACK',
    version: 1,
    status: 'PUBLISHED',
    athletesCount: 31,
    macroSplit: '55C / 25P / 20F',
    createdAt: '2026-10-12T14:00:00Z',
    meals: [
      {
        name: 'Carbo-Load Oatmeal Bowl',
        timeOffsetMinutes: 30,
        macrosJson: { calories: 720, protein: 35, carbs: 110, fat: 12 },
        prepNotes: 'Rolled oats with maple syrup, chia seeds, sliced bananas and dates.'
      },
      {
        name: 'Midday Complex Fuel Bowl',
        timeOffsetMinutes: 240,
        macrosJson: { calories: 840, protein: 50, carbs: 120, fat: 18 },
        prepNotes: 'Brown basmati rice with black beans, shredded chicken breast, salsa.'
      },
      {
        name: 'Intra-Workout Hydration & Dextrin',
        timeOffsetMinutes: 420,
        macrosJson: { calories: 340, protein: 15, carbs: 70, fat: 0 },
        prepNotes: 'Highly branched cyclic dextrin with amino acids and sodium chloride.'
      },
      {
        name: 'Glycogen Replenishment Dinner',
        timeOffsetMinutes: 660,
        macrosJson: { calories: 900, protein: 75, carbs: 85, fat: 32 },
        prepNotes: 'Roasted turkey tenderloin, baked russet potatoes, green beans.'
      }
    ]
  }
];

export const NutritionPage: React.FC = () => {
  const [protocols, setProtocols] = useState<ExtendedProtocol[]>(DEFAULT_PROTOCOLS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(DEFAULT_PROTOCOLS[0].id);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNewProtocolModalOpen, setIsNewProtocolModalOpen] = useState(false);

  // Calculator State
  const [calcWeight, setCalcWeight] = useState(82);
  const [calcHeight, setCalcHeight] = useState(180);
  const [calcAge, setCalcAge] = useState(29);
  const [calcGoal, setCalcGoal] = useState<'HYPERTROPHY' | 'CUTTING' | 'MAINTENANCE'>('HYPERTROPHY');
  const [calcResult, setCalcResult] = useState<{
    tdee: number;
    targetKcal: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
  } | null>(null);

  // Form State for new protocol
  const [newTitle, setNewTitle] = useState('');
  const [newKcal, setNewKcal] = useState(2500);
  const [newProtein, setNewProtein] = useState(180);
  const [newCarbs, setNewCarbs] = useState(240);
  const [newFat, setNewFat] = useState(70);
  const [newTier, setNewTier] = useState<'STANDARD' | 'PRO' | 'ELITE_BLACK'>('PRO');
  const [newCategory, setNewCategory] = useState('MASS_GAIN');

  const selectedProtocol = protocols.find((p) => p.id === selectedProtocolId) || protocols[0];

  const filteredProtocols =
    selectedCategory === 'ALL'
      ? protocols
      : protocols.filter((p) => p.category === selectedCategory);

  const categories = [
    { id: 'ALL', label: 'All Protocols' },
    { id: 'MASS_GAIN', label: 'Hypertrophy & Mass' },
    { id: 'FAT_LOSS', label: 'Metabolic Cut' },
    { id: 'KETO', label: 'Keto & Flex' },
    { id: 'ENDURANCE', label: 'Endurance Engine' }
  ];

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      // Simulate/trigger PDF generation via fastify function container payload
      const mealsFormatted = (selectedProtocol.meals || []).map((m) => {
        const hours = Math.floor(m.timeOffsetMinutes / 60);
        const mins = m.timeOffsetMinutes % 60;
        const clockTime = `${String(7 + hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        return {
          name: m.name,
          timeOffsetMinutes: m.timeOffsetMinutes,
          clockTime,
          calories: m.macrosJson.calories,
          protein: m.macrosJson.protein,
          carbs: m.macrosJson.carbs,
          fat: m.macrosJson.fat,
          prepNotes: m.prepNotes
        };
      });

      const payload = {
        protocolTitle: selectedProtocol.title,
        category: selectedProtocol.category,
        tier: selectedProtocol.tier,
        targetKcal: selectedProtocol.kcalTarget,
        proteinGrams: selectedProtocol.proteinGrams,
        carbGrams: selectedProtocol.carbGrams,
        fatGrams: selectedProtocol.fatGrams,
        memberName: 'Active Athlete Roster',
        meals: mealsFormatted
      };

      const res = await fetch('http://localhost:3008/export/meal-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf'
        },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (res && res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meal-guide-${selectedProtocol.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback browser printable alert
        alert(`Exporting PDF for "${selectedProtocol.title}" (${selectedProtocol.kcalTarget} kcal). In full cluster mode, this downloads directly from fn-pdf-export.`);
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCalculateMacros = () => {
    const bmr = 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + 5; // male formula
    const tdee = Math.round(bmr * 1.55);
    let target = tdee;
    if (calcGoal === 'HYPERTROPHY') target = Math.round(tdee * 1.15);
    if (calcGoal === 'CUTTING') target = Math.round(tdee * 0.8);

    const protein = Math.round(calcWeight * 2.2);
    const fat = Math.round(calcWeight * 0.85);
    const carbs = Math.max(0, Math.round((target - (protein * 4 + fat * 9)) / 4));

    setCalcResult({
      tdee,
      targetKcal: target,
      proteinGrams: protein,
      carbGrams: carbs,
      fatGrams: fat
    });
  };

  const handleCreateProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newProto: ExtendedProtocol = {
      id: `01931668-9000-7000-8000-${String(protocols.length + 1).padStart(12, '0')}`,
      orgId: '01931668-8000-7000-8000-000000000001',
      hubId: '01931668-8000-7000-8000-000000000002',
      title: newTitle,
      category: newCategory,
      kcalTarget: Number(newKcal),
      proteinGrams: Number(newProtein),
      carbGrams: Number(newCarbs),
      fatGrams: Number(newFat),
      tier: newTier,
      version: 1,
      status: 'PUBLISHED',
      athletesCount: 1,
      macroSplit: `${Math.round(((newCarbs * 4) / newKcal) * 100)}C / ${Math.round(((newProtein * 4) / newKcal) * 100)}P / ${Math.round(((newFat * 9) / newKcal) * 100)}F`,
      createdAt: new Date().toISOString(),
      meals: [
        {
          name: 'Precision Morning Foundation',
          timeOffsetMinutes: 45,
          macrosJson: {
            calories: Math.round(newKcal * 0.3),
            protein: Math.round(newProtein * 0.35),
            carbs: Math.round(newCarbs * 0.35),
            fat: Math.round(newFat * 0.3)
          },
          prepNotes: 'Nutrient-dense morning fueling window.'
        },
        {
          name: 'Midday Glycogen Support',
          timeOffsetMinutes: 300,
          macrosJson: {
            calories: Math.round(newKcal * 0.4),
            protein: Math.round(newProtein * 0.4),
            carbs: Math.round(newCarbs * 0.45),
            fat: Math.round(newFat * 0.4)
          },
          prepNotes: 'Sustained energy partitioning.'
        },
        {
          name: 'Evening Cellular Recovery',
          timeOffsetMinutes: 660,
          macrosJson: {
            calories: Math.round(newKcal * 0.3),
            protein: Math.round(newProtein * 0.25),
            carbs: Math.round(newCarbs * 0.2),
            fat: Math.round(newFat * 0.3)
          },
          prepNotes: 'Protein synthesis and restful recovery.'
        }
      ]
    };

    setProtocols([newProto, ...protocols]);
    setSelectedProtocolId(newProto.id);
    setIsNewProtocolModalOpen(false);
    setNewTitle('');
  };

  // Macro calculation percentages for Progress Ring
  const totalProteinKcal = selectedProtocol.proteinGrams * 4;
  const totalCarbKcal = selectedProtocol.carbGrams * 4;
  const totalFatKcal = selectedProtocol.fatGrams * 9;
  const proteinPct = Math.round((totalProteinKcal / selectedProtocol.kcalTarget) * 100);
  const carbPct = Math.round((totalCarbKcal / selectedProtocol.kcalTarget) * 100);
  const fatPct = Math.round((totalFatKcal / selectedProtocol.kcalTarget) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-kf-text-steel font-semibold flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-kf-lime" />
            Nutritional Protocols & Kitchen Lab
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-0.5">
            Chrono-Nutrition & Metabolic Partitioning
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCalculatorOpen(true)}
            leftIcon={<Calculator className="w-3.5 h-3.5 text-kf-cyan" />}
          >
            TDEE Calculator
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {isExportingPdf ? 'Exporting...' : 'Export Meal Guide PDF'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewProtocolModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Protocol
          </Button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-full font-mono text-xs whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? 'bg-kf-lime text-kf-surface-0 font-bold'
                : 'bg-kf-surface-1 text-kf-text-steel hover:text-white border border-kf-border'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Protocol Cards (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Protocol Catalog List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-kf-text-steel">
            <span>ACTIVE PROTOCOLS ({filteredProtocols.length})</span>
            <span>SORT: ENROLLED ATHLETES</span>
          </div>

          <div className="space-y-3">
            {filteredProtocols.map((p) => {
              const isSelected = p.id === selectedProtocolId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProtocolId(p.id)}
                  className={`bg-kf-surface-1 border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-kf-lime ring-1 ring-kf-lime/30 bg-kf-surface-2'
                      : 'border-kf-border hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <BadgeChip variant={p.tier === 'ELITE_BLACK' ? 'active' : p.tier === 'PRO' ? 'cyan' : 'neutral'}>
                      {p.tier}
                    </BadgeChip>
                    <span className="font-mono text-xs text-kf-lime font-bold">
                      {p.athletesCount} Athletes
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white">{p.title}</h3>

                  <div className="flex items-center justify-between mt-3 font-mono text-xs">
                    <span className="text-kf-cyan flex items-center gap-1 font-semibold">
                      <Flame className="w-3.5 h-3.5" />
                      {p.kcalTarget} kcal/day
                    </span>
                    <span className="text-kf-text-steel">{p.macroSplit}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-kf-border/40 font-mono text-[11px] text-kf-text-steel">
                    <span>Version v{p.version}</span>
                    <span className="text-kf-lime flex items-center gap-0.5 hover:underline">
                      View Timeline <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Protocol Inspector & Circadian Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Macro Breakdown Header Card */}
          <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-kf-border">
              <div>
                <span className="font-mono text-xs text-kf-text-steel uppercase tracking-wider">
                  Chrono-Nutritional Calibration
                </span>
                <h2 className="font-display font-bold text-xl text-white mt-0.5">
                  {selectedProtocol.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <BadgeChip variant="active">v{selectedProtocol.version} Immutable</BadgeChip>
                  <span className="font-mono text-xs text-kf-text-steel">
                    Category: {selectedProtocol.category}
                  </span>
                </div>
              </div>

              {/* Progress Ring Visual */}
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={Math.min(100, Math.round((selectedProtocol.kcalTarget / 3500) * 100))}
                  size={72}
                  color="lime"
                  label="Energy"
                />
                <div className="font-mono text-xs space-y-1">
                  <div className="text-white font-bold text-base">{selectedProtocol.kcalTarget} kcal</div>
                  <div className="text-kf-text-steel text-[11px]">Daily Ceiling</div>
                </div>
              </div>
            </div>

            {/* Macro Splits Grid */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-kf-surface-0 border border-kf-border/70 rounded p-3 text-center">
                <div className="font-mono text-[11px] text-kf-cyan uppercase font-semibold">Protein</div>
                <div className="font-display font-bold text-lg text-white mt-1">
                  {selectedProtocol.proteinGrams}g
                </div>
                <div className="font-mono text-[11px] text-kf-text-steel">{proteinPct}% daily kcal</div>
              </div>

              <div className="bg-kf-surface-0 border border-kf-border/70 rounded p-3 text-center">
                <div className="font-mono text-[11px] text-kf-lime uppercase font-semibold">Carbs</div>
                <div className="font-display font-bold text-lg text-white mt-1">
                  {selectedProtocol.carbGrams}g
                </div>
                <div className="font-mono text-[11px] text-kf-text-steel">{carbPct}% daily kcal</div>
              </div>

              <div className="bg-kf-surface-0 border border-kf-border/70 rounded p-3 text-center">
                <div className="font-mono text-[11px] text-amber-400 uppercase font-semibold">Fats</div>
                <div className="font-display font-bold text-lg text-white mt-1">
                  {selectedProtocol.fatGrams}g
                </div>
                <div className="font-mono text-[11px] text-kf-text-steel">{fatPct}% daily kcal</div>
              </div>
            </div>
          </div>

          {/* Circadian Chrono-Nutritional Timeline */}
          <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-kf-lime" />
                  Circadian Nutrient Partitioning Timeline
                </h3>
                <p className="font-body text-xs text-kf-text-steel mt-0.5">
                  Synchronized with cortisol awakening curve and insulin sensitivity windows.
                </p>
              </div>
              <span className="font-mono text-xs text-kf-cyan">
                {selectedProtocol.meals?.length || 0} Scheduled Meals
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-kf-border">
              {(selectedProtocol.meals || []).map((meal, idx) => {
                const hours = Math.floor(meal.timeOffsetMinutes / 60);
                const mins = meal.timeOffsetMinutes % 60;
                const clockTime = `${String(7 + hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

                let circadianWindow = 'REST_RECOVERY';
                if (meal.timeOffsetMinutes <= 120) circadianWindow = 'CORTISOL_SYNC_AWAKENING';
                else if (meal.timeOffsetMinutes <= 400) circadianWindow = 'INSULIN_SENSITIVITY_PEAK';
                else if (meal.timeOffsetMinutes <= 600) circadianWindow = 'INTRA_WORKOUT_PARTITIONING';
                else circadianWindow = 'MELATONIN_SYNTHESIS_RESTORATION';

                return (
                  <div key={idx} className="relative bg-kf-surface-2 border border-kf-border/80 rounded-lg p-4">
                    {/* Circle Node */}
                    <div className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-kf-lime border-2 border-kf-surface-0 ring-2 ring-kf-surface-1" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-kf-lime bg-kf-surface-0 px-2 py-0.5 rounded border border-kf-border">
                          {clockTime}
                        </span>
                        <h4 className="font-display font-bold text-sm text-white">{meal.name}</h4>
                      </div>
                      <BadgeChip variant="neutral">{circadianWindow}</BadgeChip>
                    </div>

                    <p className="font-body text-xs text-kf-text-steel mt-2 italic">
                      "{meal.prepNotes}"
                    </p>

                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-kf-border/40 font-mono text-xs">
                      <span className="text-white font-bold">{meal.macrosJson.calories} kcal</span>
                      <span className="text-kf-cyan">P: {meal.macrosJson.protein}g</span>
                      <span className="text-kf-lime">C: {meal.macrosJson.carbs}g</span>
                      <span className="text-amber-400">F: {meal.macrosJson.fat}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* InBody Body Composition Tracker Preview */}
          <div className="bg-kf-surface-1 border border-kf-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-kf-cyan" />
                InBody 770 Composition Trends (Active Cohort)
              </h3>
              <BadgeChip variant="active">30-Day Deltas</BadgeChip>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-kf-surface-0 p-3 rounded border border-kf-border">
                <div className="text-kf-text-steel text-[11px]">AVG BODY FAT %</div>
                <div className="text-lg font-bold text-white mt-1">14.8%</div>
                <div className="text-kf-lime text-[11px] flex items-center gap-1 mt-0.5">
                  <TrendingDown className="w-3 h-3" /> -2.4% last month
                </div>
              </div>

              <div className="bg-kf-surface-0 p-3 rounded border border-kf-border">
                <div className="text-kf-text-steel text-[11px]">SKELETAL MUSCLE MASS</div>
                <div className="text-lg font-bold text-white mt-1">39.4 kg</div>
                <div className="text-kf-cyan text-[11px] flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +1.8 kg lean gain
                </div>
              </div>

              <div className="bg-kf-surface-0 p-3 rounded border border-kf-border">
                <div className="text-kf-text-steel text-[11px]">ADHERENCE RATING</div>
                <div className="text-lg font-bold text-white mt-1">94.2%</div>
                <div className="text-kf-lime text-[11px] flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> High Compliance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TDEE Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Mifflin-St Jeor TDEE & Macro Formulation"
      >
        <div className="space-y-4">
          <p className="font-body text-xs text-kf-text-steel">
            Calculates basal metabolic rate and adjusts macronutrient grams based on athletic goal and training volume.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Weight (kg)</label>
              <Input
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Height (cm)</label>
              <Input
                type="number"
                value={calcHeight}
                onChange={(e) => setCalcHeight(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Age (y)</label>
              <Input
                type="number"
                value={calcAge}
                onChange={(e) => setCalcAge(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Target Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {(['HYPERTROPHY', 'CUTTING', 'MAINTENANCE'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setCalcGoal(g)}
                  className={`py-2 text-xs font-mono rounded border ${
                    calcGoal === g
                      ? 'bg-kf-lime text-kf-surface-0 font-bold border-kf-lime'
                      : 'bg-kf-surface-2 text-white border-kf-border'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={handleCalculateMacros}>
            Calculate Precision Target
          </Button>

          {calcResult && (
            <div className="bg-kf-surface-0 border border-kf-border rounded-lg p-4 space-y-2 mt-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-kf-text-steel">Calculated TDEE:</span>
                <span className="text-white font-bold">{calcResult.tdee} kcal</span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm border-t border-kf-border/40 pt-2">
                <span className="text-kf-lime font-bold">Target Calories:</span>
                <span className="text-kf-lime font-bold text-base">{calcResult.targetKcal} kcal/day</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono text-xs">
                <div className="bg-kf-surface-2 p-2 rounded">
                  <div className="text-kf-cyan font-bold">{calcResult.proteinGrams}g</div>
                  <div className="text-[10px] text-kf-text-steel">Protein</div>
                </div>
                <div className="bg-kf-surface-2 p-2 rounded">
                  <div className="text-kf-lime font-bold">{calcResult.carbGrams}g</div>
                  <div className="text-[10px] text-kf-text-steel">Carbs</div>
                </div>
                <div className="bg-kf-surface-2 p-2 rounded">
                  <div className="text-amber-400 font-bold">{calcResult.fatGrams}g</div>
                  <div className="text-[10px] text-kf-text-steel">Fats</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* New Protocol Modal */}
      <Modal
        isOpen={isNewProtocolModalOpen}
        onClose={() => setIsNewProtocolModalOpen(false)}
        title="Author New Diet Protocol"
      >
        <form onSubmit={handleCreateProtocol} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-kf-text-steel mb-1">Protocol Title</label>
            <Input
              placeholder="e.g. Olympic Hypertrophy 3400"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-kf-surface-2 border border-kf-border rounded px-3 py-2 font-mono text-xs text-white"
              >
                <option value="MASS_GAIN">Hypertrophy & Mass Gain</option>
                <option value="FAT_LOSS">Fat Loss & Metabolic Cut</option>
                <option value="KETO">Keto & Metabolic Flexibility</option>
                <option value="ENDURANCE">Endurance Engine</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-kf-text-steel mb-1">Tier Requirement</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as any)}
                className="w-full bg-kf-surface-2 border border-kf-border rounded px-3 py-2 font-mono text-xs text-white"
              >
                <option value="STANDARD">Standard Gym</option>
                <option value="PRO">Pro Performance</option>
                <option value="ELITE_BLACK">Elite Black VIP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block font-mono text-[11px] text-kf-text-steel mb-1">Total Kcal</label>
              <Input
                type="number"
                value={newKcal}
                onChange={(e) => setNewKcal(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-kf-cyan mb-1">Protein (g)</label>
              <Input
                type="number"
                value={newProtein}
                onChange={(e) => setNewProtein(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-kf-lime mb-1">Carbs (g)</label>
              <Input
                type="number"
                value={newCarbs}
                onChange={(e) => setNewCarbs(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-amber-400 mb-1">Fat (g)</label>
              <Input
                type="number"
                value={newFat}
                onChange={(e) => setNewFat(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-kf-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewProtocolModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Protocol (v1)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
