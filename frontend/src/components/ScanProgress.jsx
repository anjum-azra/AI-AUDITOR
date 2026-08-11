import React, { useEffect, useState } from 'react';
import { Monitor, Camera, ShieldCheck, Crosshair, Cpu, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Launching Headless Playwright Chromium', icon: Monitor, duration: 2500 },
  { id: 2, label: 'Rendering JS Page & Capturing Screenshot', icon: Camera, duration: 4000 },
  { id: 3, label: 'Executing axe-core WCAG 2.1 Engine Audit', icon: ShieldCheck, duration: 3500 },
  { id: 4, label: 'Extracting DOM Element Bounding Boxes', icon: Crosshair, duration: 2500 },
  { id: 5, label: 'Generating AI Contextual Code Fixes', icon: Cpu, duration: 4000 },
];

export default function ScanProgress({ targetUrl }) {
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    let current = 1;
    const advanceStage = () => {
      if (current < STAGES.length) {
        current += 1;
        setActiveStage(current);
        timer = setTimeout(advanceStage, STAGES[current - 1].duration);
      }
    };

    let timer = setTimeout(advanceStage, STAGES[0].duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-6 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
      {/* Top Scan Line Animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500 animate-pulse"></div>

      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-widest text-brand-400 font-bold px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
          Live Audit Pipeline Active
        </span>
        <h3 className="text-lg font-bold text-white mt-2">Auditing Accessibility for</h3>
        <p className="text-xs font-mono text-indigo-300 mt-1 truncate max-w-xl mx-auto px-4 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
          {targetUrl}
        </p>
      </div>

      <div className="space-y-3">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isDone = activeStage > stage.id;
          const isCurrent = activeStage === stage.id;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-brand-600/15 border-brand-500/50 text-white shadow-lg shadow-brand-500/10 scale-[1.01]'
                  : isDone
                  ? 'bg-slate-800/40 border-slate-700/40 text-slate-300 opacity-90'
                  : 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-50'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="relative">
                    <span className="absolute -inset-1 rounded-full bg-brand-500/40 animate-ping"></span>
                    <Icon className="h-5 w-5 text-brand-400 relative z-10" />
                  </div>
                ) : (
                  <Icon className="h-5 w-5 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isCurrent ? 'text-brand-300' : ''}`}>
                  {stage.label}
                </p>
              </div>

              {isCurrent && (
                <div className="shrink-0">
                  <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin block"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
