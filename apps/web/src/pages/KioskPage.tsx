import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, CheckCircle2, XCircle, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import { Logo, Button } from '@kineticfit/ui';

export const KioskPage: React.FC = () => {
  const navigate = useNavigate();
  const [rfidInput, setRfidInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'GRANTED' | 'DENIED';
    name?: string;
    tier?: string;
    message: string;
  } | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    if (rfidInput.toLowerCase().includes('denied') || rfidInput.includes('9999')) {
      setScanResult({
        status: 'DENIED',
        message: 'Membership Expired or Invalid RFID Keycard UID'
      });
    } else {
      setScanResult({
        status: 'GRANTED',
        name: 'Aria Sterling',
        tier: 'Pro Performance Athlete',
        message: 'Floor Access Verified — Turnstile Gate Unlocked'
      });
    }

    // Auto-reset in 3s per specification
    resetTimerRef.current = setTimeout(() => {
      setScanResult(null);
      setRfidInput('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0e13] text-white flex flex-col justify-between p-8 select-none">
      {/* Kiosk Header */}
      <div className="flex items-center justify-between">
        <Logo size="lg" />
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-kf-text-steel flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-kf-lime animate-pulse" />
            <span>TERMINAL LANE 01 ONLINE</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Exit Kiosk
          </Button>
        </div>
      </div>

      {/* Center Interactive Scan Terminal */}
      <div className="max-w-xl mx-auto w-full text-center space-y-8">
        {!scanResult ? (
          <>
            <div className="relative inline-flex items-center justify-center p-8 rounded-full bg-kf-surface-1 border border-kf-border shadow-lime-glow">
              <Radio className="w-20 h-20 text-kf-lime animate-pulse" />
            </div>

            <div>
              <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-white tracking-tight">
                Tap RFID Keycard or Apple GymKit
              </h1>
              <p className="font-body text-sm text-kf-text-steel mt-2">
                Present athlete credentials or barcode to unlock turnstile barrier.
              </p>
            </div>

            <form onSubmit={handleScan} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Simulate RFID Keycard Tap..."
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                className="w-full h-12 px-4 bg-kf-surface-lowest text-white font-mono text-base border border-kf-border rounded-lg text-center focus:outline-none focus:border-kf-lime focus:shadow-lime-glow"
              />
              <Button type="submit" variant="primary" size="lg">
                Tap
              </Button>
            </form>
          </>
        ) : scanResult.status === 'GRANTED' ? (
          <div className="p-8 rounded-2xl bg-kf-lime/10 border-2 border-kf-lime shadow-[0_0_40px_rgba(195,244,0,0.25)] space-y-4 animate-in zoom-in-95">
            <CheckCircle2 className="w-20 h-20 text-kf-lime mx-auto" />
            <h2 className="font-display font-extrabold text-3xl text-white">ACCESS GRANTED</h2>
            <div className="font-display font-bold text-xl text-kf-lime">{scanResult.name}</div>
            <div className="font-mono text-xs text-kf-text-steel uppercase tracking-widest">{scanResult.tier}</div>
            <p className="font-mono text-xs text-kf-lime mt-2">{scanResult.message}</p>
            <div className="font-mono text-[10px] text-kf-text-steel pt-4">Auto-resetting in 3s...</div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-kf-danger/10 border-2 border-kf-danger shadow-danger-glow space-y-4 animate-in zoom-in-95">
            <XCircle className="w-20 h-20 text-kf-danger mx-auto" />
            <h2 className="font-display font-extrabold text-3xl text-kf-danger">ACCESS DENIED</h2>
            <p className="font-mono text-sm text-white">{scanResult.message}</p>
            <p className="font-body text-xs text-kf-text-steel">Please consult the Front Desk or review billing status.</p>
            <div className="font-mono text-[10px] text-kf-text-steel pt-4">Auto-resetting in 3s...</div>
          </div>
        )}
      </div>

      {/* Kiosk Footer */}
      <div className="flex items-center justify-between font-mono text-xs text-kf-text-steel border-t border-kf-border/40 pt-4">
        <span>Downtown Flagship • Hub Gate #01</span>
        <span>KineticFit OS v1.0.0</span>
      </div>
    </div>
  );
};
