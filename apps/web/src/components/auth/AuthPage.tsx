import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Check,
  X,
  Radio,
  Clock,
  Users,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Logo, Button, Input, Checkbox, BadgeChip } from '@kineticfit/ui';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCompactParam = searchParams.get('compact') === '1';

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedTier, setSelectedTier] = useState<'STANDARD' | 'PRO' | 'ELITE_BLACK'>('PRO');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Live password validation checklist
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError('Please fill in all required credentials.');
      return;
    }

    if (activeTab === 'register' && (!hasMinLength || !hasNumber || !hasSpecial)) {
      setAuthError('Password must fulfill all security criteria.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 800);
  };

  const tiers = [
    { id: 'STANDARD', name: 'Standard Gym', price: 129, desc: 'Full floor & locker access' },
    { id: 'PRO', name: 'Pro Performance', price: 199, desc: 'Includes classes & recovery plunge' },
    { id: 'ELITE_BLACK', name: 'Elite Black VIP', price: 289, desc: 'Dietitian protocols + 24/7 priority' }
  ];

  return (
    <div className="min-h-screen w-full bg-kf-bg text-kf-text flex items-center justify-center p-4 lg:p-8">
      <div
        className={`w-full max-w-6xl grid ${
          isCompactParam ? 'grid-cols-1 max-w-md' : 'grid-cols-1 lg:grid-cols-12'
        } bg-kf-surface-1 border border-kf-border rounded-xl overflow-hidden shadow-2xl`}
      >
        {/* Left Live Club Telemetry Showcase (Hidden in compact view) */}
        {!isCompactParam && (
          <div className="lg:col-span-5 bg-kf-surface-lowest p-8 border-b lg:border-b-0 lg:border-r border-kf-border flex flex-col justify-between">
            <div>
              <Logo size="lg" className="mb-8" />

              <div className="space-y-6">
                <div>
                  <div className="font-mono text-xs text-kf-lime uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-kf-lime animate-pulse" />
                    <span>Downtown Flagship Hub</span>
                  </div>
                  <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-white tracking-tight leading-tight">
                    Athletic Precision & Telemetry Operating System
                  </h1>
                </div>

                {/* Live Occupancy Metric Box */}
                <div className="p-4 bg-kf-surface-1 border border-kf-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-kf-text-steel uppercase tracking-widest font-semibold">
                      Current Saturation
                    </span>
                    <BadgeChip variant="active">Live 74%</BadgeChip>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-3xl text-white">222</span>
                    <span className="font-mono text-xs text-kf-text-steel">/ 300 athletes on-site</span>
                  </div>

                  <div className="w-full bg-kf-surface-3 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-kf-lime h-full w-[74%] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] text-kf-text-steel pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-kf-cyan" />
                      Peak surge in ~42m
                    </span>
                    <span>Air 412 ppm (sim)</span>
                  </div>
                </div>

                {/* Upcoming High-Demand Class */}
                <div className="p-4 bg-kf-surface-1 border border-kf-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-kf-text-steel uppercase tracking-widest">Next Session</span>
                    <span className="text-kf-cyan font-bold">18m to start</span>
                  </div>
                  <div className="font-display font-bold text-sm text-white">
                    MetCon Savage Circuit • Studio 01
                  </div>
                  <div className="font-mono text-xs text-kf-text-steel flex items-center gap-2">
                    <span>Coach Elena Rostova</span>
                    <span>•</span>
                    <span className="text-kf-lime">24/24 Full (4 Waitlist)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Hardware Signature */}
            <div className="mt-8 pt-4 border-t border-kf-border/60 flex items-center justify-between font-mono text-[10px] text-kf-text-steel">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-kf-lime" />
                TLS 1.3 Verified
              </span>
              <span>Node: LATENCY 1.2ms</span>
            </div>
          </div>
        )}

        {/* Right Form Card */}
        <div
          className={`${
            isCompactParam ? 'col-span-1 p-6' : 'lg:col-span-7 p-8 lg:p-12'
          } flex flex-col justify-center bg-kf-surface-1`}
        >
          {/* Sign In / Register Tab Toggle */}
          <div className="flex items-center p-1 bg-kf-surface-lowest border border-kf-border rounded-lg mb-8 max-w-sm">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 text-xs font-display font-bold rounded tracking-wider uppercase transition-all ${
                activeTab === 'signin'
                  ? 'bg-kf-surface-2 text-kf-lime shadow-sm'
                  : 'text-kf-text-muted hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-display font-bold rounded tracking-wider uppercase transition-all ${
                activeTab === 'register'
                  ? 'bg-kf-surface-2 text-kf-lime shadow-sm'
                  : 'text-kf-text-muted hover:text-white'
              }`}
            >
              Athlete Registration
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              {activeTab === 'signin' ? 'Sign into Facility Terminal' : 'Join KineticFit Athletic OS'}
            </h2>
            <p className="font-body text-xs text-kf-text-steel mt-1">
              {activeTab === 'signin'
                ? 'Authenticate your operational or member account to proceed.'
                : 'Configure your membership tier and keycard access credentials.'}
            </p>
          </div>

          {/* Quick OAuth & Hardware Access Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="h-10 px-3 bg-kf-surface-2 hover:bg-kf-surface-3 border border-kf-border hover:border-slate-500 rounded text-xs font-display font-semibold text-white flex items-center justify-center gap-2 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15s.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/kiosk')}
              className="h-10 px-3 bg-kf-surface-2 hover:bg-kf-surface-3 border border-kf-border hover:border-slate-500 rounded text-xs font-display font-semibold text-white flex items-center justify-center gap-2 transition-colors focus:outline-none"
            >
              <Radio className="w-4 h-4 text-kf-lime" />
              <span>Tap RFID / GymKit</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-kf-border w-full" />
            <span className="bg-kf-surface-1 px-3 font-mono text-[10px] text-kf-text-steel uppercase tracking-widest shrink-0">
              Or email credentials
            </span>
          </div>

          {authError && (
            <div className="p-3 mb-4 bg-kf-danger/15 border border-kf-danger/40 rounded font-mono text-xs text-kf-danger flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <Input
                label="Full Athlete Name"
                placeholder="e.g. Aria Sterling"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              type="email"
              label="Email Address"
              placeholder="e.g. director@kineticfit.dev"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              isPassword
              label="Passphrase"
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Live Password Checklist for Registration */}
            {activeTab === 'register' && (
              <div className="p-3 bg-kf-surface-lowest border border-kf-border rounded text-xs space-y-1.5 font-mono">
                <div className="text-[10px] uppercase tracking-wider text-kf-text-steel font-semibold mb-1">
                  Security Criteria
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-kf-lime' : 'text-kf-text-steel'
                  }`}
                >
                  {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Minimum 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? 'text-kf-lime' : 'text-kf-text-steel'
                  }`}
                >
                  {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Contains at least one number</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasSpecial ? 'text-kf-lime' : 'text-kf-text-steel'
                  }`}
                >
                  {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Contains at least one symbol (!@#$)</span>
                </div>
              </div>
            )}

            {/* Tier Picker for Registration */}
            {activeTab === 'register' && (
              <div className="space-y-2 pt-2">
                <label className="font-mono text-xs font-semibold tracking-wider uppercase text-kf-text-steel">
                  Select Membership Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTier(tier.id as any)}
                      className={`p-3 rounded border text-left transition-all ${
                        selectedTier === tier.id
                          ? 'bg-kf-surface-2 border-kf-lime shadow-lime-glow text-white'
                          : 'bg-kf-surface-lowest border-kf-border text-kf-text-muted hover:border-slate-500'
                      }`}
                    >
                      <div className="font-display font-bold text-xs truncate">{tier.name}</div>
                      <div className="font-display font-extrabold text-base text-white mt-1">
                        ${tier.price}
                        <span className="font-mono text-[10px] text-kf-text-steel font-normal">/mo</span>
                      </div>
                      <div className="font-mono text-[10px] text-kf-text-steel mt-1 truncate">
                        {tier.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                label="Remember terminal session for 30 days"
              />
              {activeTab === 'signin' && (
                <button
                  type="button"
                  className="font-mono text-xs text-kf-lime hover:underline focus:outline-none"
                >
                  Forgot Key?
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {activeTab === 'signin' ? 'Authenticate Access' : 'Register & Issue RFID Keycard'}
            </Button>
          </form>

          {/* Demo account credentials quick reference */}
          <div className="mt-8 pt-4 border-t border-kf-border/60 text-center font-mono text-[11px] text-kf-text-steel">
            <span>Demo logins: </span>
            <button
              onClick={() => {
                setEmail('director@kineticfit.dev');
                setPassword('KineticFit2026!');
              }}
              className="text-kf-lime hover:underline mx-1"
            >
              director@kineticfit.dev
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setEmail('trainer@kineticfit.dev');
                setPassword('KineticFit2026!');
              }}
              className="text-kf-cyan hover:underline mx-1"
            >
              trainer@kineticfit.dev
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
