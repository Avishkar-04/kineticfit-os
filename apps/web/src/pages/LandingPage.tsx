import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Lock,
  Radio,
  Users
} from 'lucide-react';
import { Logo, Button, BadgeChip } from '@kineticfit/ui';

export const LandingPage: React.FC = () => {
  const [selectedPlanPeriod, setSelectedPlanPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [currentOccupancy, setCurrentOccupancy] = useState(142);
  const maxCapacity = 300;
  const occupancyPercentage = Math.round((currentOccupancy / maxCapacity) * 100);

  const plans = [
    {
      id: 'STANDARD',
      name: 'Standard Gym',
      monthlyPrice: 129,
      annualPrice: 109,
      badge: 'Essential',
      description: 'Full facility access during all operational hours with digital pass and locker room amenities.',
      features: [
        'Unlimited access to Downtown Flagship Hub',
        'Digital RFID Turnstile Pass with offline sync',
        'Standard equipment floor and cardio zones',
        'Member mobile app & workout logging',
        'Locker room & Finnish dry sauna access'
      ],
      popular: false
    },
    {
      id: 'PRO',
      name: 'Pro Performance',
      monthlyPrice: 199,
      annualPrice: 169,
      badge: 'Most Popular',
      description: 'For dedicated athletes wanting unlimited group classes, Olympic lifting, and dietitian meal guides.',
      features: [
        'Everything in Standard Gym',
        'Unlimited MetCon, Spin & Vinyasa classes',
        'Priority booking window (7 days in advance)',
        'Personalized Chrono-Nutritional macro protocol',
        'Monthly InBody 770 body composition scans',
        'Contrast therapy & cold plunge access'
      ],
      popular: true
    },
    {
      id: 'ELITE_BLACK',
      name: 'Elite Black VIP',
      monthlyPrice: 289,
      annualPrice: 249,
      badge: 'VIP All-Inclusive',
      description: 'The pinnacle athletic experience with dedicated personal coaching, private recovery suites, and laundry.',
      features: [
        'Everything in Pro Performance',
        'Multi-hub unrestricted global access',
        '2x monthly 1-on-1 sessions with Master Coach',
        'Quarterly 3D DEXA and lab consultations',
        'Permanent executive locker & laundry service',
        'Full Kitchen Lab circadian nutrition catering'
      ],
      popular: false
    }
  ];

  const featuredClasses = [
    { title: 'Morning Ignite HIIT', time: '06:00 - 06:45', trainer: 'Elena Rostova', studio: 'Studio 1 MetCon', intensity: 'HIGH' },
    { title: 'Olympic Weightlifting Clinic', time: '07:30 - 08:30', trainer: 'Jaxson Hayes', studio: 'Studio 4 Oly', intensity: 'PEAK' },
    { title: 'Power Vinyasa Flow', time: '09:00 - 10:00', trainer: 'Maya Lin', studio: 'Studio 2 Yoga', intensity: 'MODERATE' },
    { title: 'Rhythm Spin 45', time: '17:30 - 18:15', trainer: 'David Kim', studio: 'Studio 3 Cycle', intensity: 'HIGH' }
  ];

  const trainers = [
    { name: 'Elena Rostova', role: 'Strength Master Coach', spec: 'CSCS, USAW L3 • 12 yrs elite training', initial: 'ER' },
    { name: 'David Kim', role: 'Conditioning Specialist', spec: 'Wattbike Master, NSCA-CPT', initial: 'DK' },
    { name: 'Maya Lin', role: 'Mobility & Yoga Coach', spec: 'FRC Mobility, E-RYT 500', initial: 'ML' },
    { name: 'Jaxson Hayes', role: 'Lead Strength Specialist', spec: 'EXOS Performance, CSCS', initial: 'JH' }
  ];

  return (
    <div className="min-h-screen bg-kf-bg text-kf-text font-body selection:bg-kf-lime selection:text-kf-surface-0">
      {/* Top Telemetry Ticker & Navigation */}
      <header className="sticky top-0 z-40 bg-kf-surface-0/90 backdrop-blur-md border-b border-kf-border">
        {/* Live Saturation Micro-Bar */}
        <div className="bg-kf-surface-1 px-4 py-1.5 border-b border-kf-border/60 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-kf-lime animate-pulse" />
            <span className="text-kf-lime font-bold">DOWNTOWN FLAGSHIP LIVE:</span>
            <span className="text-white font-semibold">{currentOccupancy} / {maxCapacity} Athletes on floor</span>
            <span className="text-kf-text-steel">({occupancyPercentage}% Saturation • Nominal Flow)</span>
          </div>

          <div className="flex items-center gap-4 text-kf-text-steel hidden sm:flex">
            <span>Air Quality: <strong className="text-kf-cyan">38 AQI (Pristine)</strong></span>
            <span>Turnstile Latency: <strong className="text-kf-lime">&lt; 95 ms</strong></span>
            <Link to="/auth" className="text-kf-lime hover:underline font-bold">
              Kiosk Check-In &rarr;
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="md" />
            </Link>

            <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-kf-text-steel">
              <a href="#plans" className="hover:text-white transition-colors">PLANS & PRICING</a>
              <a href="#schedule" className="hover:text-white transition-colors">TIMETABLE</a>
              <a href="#nutrition" className="hover:text-white transition-colors">CHRONO-NUTRITION</a>
              <a href="#coaches" className="hover:text-white transition-colors">MASTER COACHES</a>
            </nav>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">
                Director Console
              </Button>
            </Link>

            <Link to="/me">
              <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                Member Portal
              </Button>
            </Link>

            <Link to="/auth">
              <Button variant="primary" size="sm">
                Join KineticFit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 overflow-hidden border-b border-kf-border">
          {/* Subtle Background Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-kf-lime/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-kf-cyan/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kf-surface-1 border border-kf-border text-xs font-mono text-kf-lime">
              <Zap className="w-3.5 h-3.5 text-kf-lime" />
              <span>NEXT-GENERATION ATHLETIC PERFORMANCE OPERATING SYSTEM</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight max-w-5xl mx-auto leading-[1.08]">
              Precision Telemetry. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kf-lime via-white to-kf-cyan">
                Chrono-Nutrition. Elite Conditioning.
              </span>
            </h1>

            <p className="font-body text-base sm:text-lg text-kf-text-steel max-w-2xl mx-auto leading-relaxed">
              KineticFit OS combines real-time turnstile telemetry, Olympic strength coaching, and circadian nutritional calibration to deliver unprecedented athletic longevity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono text-xs">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm px-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start 14-Day Performance Trial
                </Button>
              </Link>

              <Link to="/me" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm px-8">
                  Member Mobile Pass
                </Button>
              </Link>
            </div>

            {/* Live Facility Ticker Card */}
            <div className="pt-12 max-w-3xl mx-auto">
              <div className="bg-kf-surface-1 border border-kf-border rounded-xl p-5 shadow-2xl text-left grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="font-mono text-[11px] text-kf-text-steel uppercase">Gym Saturation</div>
                  <div className="font-display font-black text-2xl text-white mt-1 flex items-baseline gap-1">
                    {occupancyPercentage}% <span className="font-mono text-xs text-kf-lime font-normal">Optimal</span>
                  </div>
                  <div className="w-full bg-kf-surface-2 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-kf-lime h-full rounded-full" style={{ width: `${occupancyPercentage}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="font-mono text-[11px] text-kf-text-steel uppercase">Active Classes Today</div>
                  <div className="font-display font-black text-2xl text-white mt-1 flex items-baseline gap-1">
                    28 <span className="font-mono text-xs text-kf-cyan font-normal">Sessions</span>
                  </div>
                  <div className="font-mono text-[11px] text-kf-text-steel mt-2">
                    MetCon • Oly • Cycle • Yoga
                  </div>
                </div>

                <div className="p-3 bg-kf-surface-0 rounded border border-kf-border">
                  <div className="font-mono text-[11px] text-kf-text-steel uppercase">Average Gate Speed</div>
                  <div className="font-display font-black text-2xl text-white mt-1 flex items-baseline gap-1">
                    94 ms <span className="font-mono text-xs text-kf-lime font-normal">Fast</span>
                  </div>
                  <div className="font-mono text-[11px] text-kf-text-steel mt-2">
                    RFID &amp; Rotating Digital Pass
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section id="plans" className="py-20 border-b border-kf-border bg-kf-surface-0/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <BadgeChip variant="active">Transparent Membership</BadgeChip>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
                Engineered for Every Athletic Ambition
              </h2>
              <p className="font-body text-sm text-kf-text-steel">
                Zero hidden initiation fees. Cancel anytime or freeze up to 60 days per calendar year.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center p-1 bg-kf-surface-1 border border-kf-border rounded-lg mt-4 font-mono text-xs">
                <button
                  onClick={() => setSelectedPlanPeriod('MONTHLY')}
                  className={`px-4 py-1.5 rounded-md font-semibold transition-colors ${
                    selectedPlanPeriod === 'MONTHLY' ? 'bg-kf-lime text-kf-surface-0' : 'text-kf-text-steel hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setSelectedPlanPeriod('ANNUAL')}
                  className={`px-4 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    selectedPlanPeriod === 'ANNUAL' ? 'bg-kf-lime text-kf-surface-0' : 'text-kf-text-steel hover:text-white'
                  }`}
                >
                  Annual Pass
                  <span className="text-[10px] bg-kf-surface-0 px-1 py-0.5 rounded text-kf-cyan">SAVE 15%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => {
                const price = selectedPlanPeriod === 'MONTHLY' ? p.monthlyPrice : p.annualPrice;
                return (
                  <div
                    key={p.id}
                    className={`bg-kf-surface-1 border rounded-xl p-6 flex flex-col justify-between transition-all ${
                      p.popular
                        ? 'border-kf-lime ring-2 ring-kf-lime/40 shadow-xl bg-kf-surface-2'
                        : 'border-kf-border hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <BadgeChip variant={p.popular ? 'active' : 'neutral'}>
                          {p.badge}
                        </BadgeChip>
                        <span className="font-mono text-xs text-kf-text-steel uppercase">Tiers</span>
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-xl text-white">{p.name}</h3>
                        <p className="font-body text-xs text-kf-text-steel mt-1 min-h-[36px]">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-kf-border/60">
                        <div className="flex items-baseline gap-1">
                          <span className="font-display font-black text-4xl text-white">${price}</span>
                          <span className="font-mono text-xs text-kf-text-steel">/ month</span>
                        </div>
                        <div className="font-mono text-[11px] text-kf-lime mt-0.5">
                          {selectedPlanPeriod === 'ANNUAL' ? 'Billed annually ($' + price * 12 + '/yr)' : 'Billed month-to-month'}
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-kf-border/60 font-mono text-xs text-kf-text">
                        {p.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-kf-lime shrink-0 mt-0.5" />
                            <span className="text-kf-text-steel leading-relaxed">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-kf-border/60">
                      <Link to="/auth">
                        <Button
                          variant={p.popular ? 'primary' : 'secondary'}
                          size="md"
                          className="w-full font-mono text-xs font-bold"
                        >
                          Enroll in {p.name}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TIMETABLE PREVIEW */}
        <section id="schedule" className="py-20 border-b border-kf-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <BadgeChip variant="cyan">Daily High-Performance Schedule</BadgeChip>
                <h2 className="font-display font-bold text-3xl text-white mt-1">
                  Today's Featured Group Sessions
                </h2>
                <p className="font-body text-sm text-kf-text-steel mt-0.5">
                  Small cohort sizes with maximum 24 athletes per session guarantee dedicated coach oversight.
                </p>
              </div>

              <Link to="/schedule">
                <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  View Full 7-Day Timetable
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredClasses.map((c, idx) => (
                <div key={idx} className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-kf-lime bg-kf-surface-0 px-2 py-0.5 rounded border border-kf-border">
                      {c.time}
                    </span>
                    <BadgeChip variant={c.intensity === 'PEAK' ? 'danger' : 'active'}>
                      {c.intensity}
                    </BadgeChip>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-white">{c.title}</h4>
                    <p className="font-mono text-xs text-kf-text-steel mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-kf-cyan" />
                      {c.studio}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-kf-border/60 flex items-center justify-between font-mono text-xs">
                    <span className="text-kf-text-steel">Coach: <strong className="text-white">{c.trainer}</strong></span>
                    <Link to="/auth" className="text-kf-lime hover:underline font-bold">Book Spot</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MASTER COACHES SECTION */}
        <section id="coaches" className="py-20 border-b border-kf-border bg-kf-surface-0/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <BadgeChip variant="active">World-Class Coaching Faculty</BadgeChip>
              <h2 className="font-display font-bold text-3xl text-white">
                Led by Master Coaches & Sports Scientists
              </h2>
              <p className="font-body text-sm text-kf-text-steel">
                Every KineticFit trainer holds master-level strength and conditioning credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trainers.map((t, idx) => (
                <div key={idx} className="bg-kf-surface-1 border border-kf-border rounded-lg p-5 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-kf-surface-2 border-2 border-kf-lime mx-auto flex items-center justify-center font-display font-bold text-lg text-white">
                    {t.initial}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">{t.name}</h4>
                    <p className="font-body text-xs text-kf-lime font-semibold">{t.role}</p>
                  </div>
                  <p className="font-mono text-[11px] text-kf-text-steel pt-2 border-t border-kf-border/60">
                    {t.spec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-16 text-center bg-gradient-to-b from-kf-surface-1 to-kf-bg">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
              Ready to Upgrade Your Athletic Operating System?
            </h2>
            <p className="font-body text-base text-kf-text-steel max-w-xl mx-auto">
              Join 1,840+ athletes training at peak physiological efficiency with KineticFit OS.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link to="/auth">
                <Button variant="primary" size="lg" className="px-8">
                  Create Athlete Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-kf-border bg-kf-surface-0 py-8 px-4 sm:px-6 font-mono text-xs text-kf-text-steel">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>&copy; 2026 KineticFit OS Technologies, Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-white">Director Portal</Link>
            <Link to="/me" className="hover:text-white">Athlete Mobile PWA</Link>
            <Link to="/kiosk" className="hover:text-white">Kiosk Terminal</Link>
            <Link to="/auth" className="text-kf-lime font-bold hover:underline">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
