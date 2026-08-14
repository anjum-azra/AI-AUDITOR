import React, { useState, useEffect } from 'react';
import { Globe, Code, Cpu, FileSearch, CheckCircle } from 'lucide-react';

const STAGES = [
  { icon: Globe,      label: 'Launching headless browser',     detail: 'Playwright Chromium initializing...',        ms: 0 },
  { icon: FileSearch, label: 'Navigating & rendering page',    detail: 'Waiting for JavaScript hydration...',        ms: 3500 },
  { icon: Code,       label: 'Injecting axe-core audit engine',detail: 'WCAG 2.1 AA / best-practice ruleset loaded', ms: 7000 },
  { icon: Cpu,        label: 'Running accessibility analysis',  detail: 'Evaluating DOM elements & bounding boxes…',  ms: 11000 },
  { icon: CheckCircle,label: 'Generating AI code fixes',       detail: 'Building remediation report…',               ms: 16000 },
];

export default function ScanProgress({ targetUrl }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(Math.floor(ms / 1000));
      const next = STAGES.findLastIndex(s => ms >= s.ms);
      setActiveIdx(Math.max(0, next));
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const progress = Math.min(95, (activeIdx / (STAGES.length - 1)) * 95 + 5);

  return (
    <div className="max-w-2xl mx-auto my-8 px-4 animate-fade-up">
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,15,30,0.8)',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 0 40px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(24px)',
        }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Scanning in progress</span>
            <span className="text-xs font-mono text-slate-400">{elapsed}s</span>
          </div>
          <p className="text-sm text-slate-300 font-mono truncate">{targetUrl}</p>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
                boxShadow: '0 0 10px rgba(139,92,246,0.6)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-600">0%</span>
            <span className="text-[10px] text-slate-500">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Stages */}
        <div className="px-6 pb-6 space-y-3">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const done   = i < activeIdx;
            const active = i === activeIdx;
            const pending = i > activeIdx;
            return (
              <div key={i}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-300"
                style={{
                  background: active ? 'rgba(99,102,241,0.1)' : done ? 'rgba(52,211,153,0.05)' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                }}>
                <div className="shrink-0 mt-0.5">
                  {done ? (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(52,211,153,0.15)' }}>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  ) : active ? (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center animate-pulse-ring"
                      style={{ background: 'rgba(99,102,241,0.2)' }}>
                      <Icon className="h-3.5 w-3.5 text-brand-400" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Icon className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-tight transition-colors ${
                    done ? 'text-emerald-400' : active ? 'text-white' : 'text-slate-600'
                  }`}>
                    {stage.label}
                  </p>
                  {(active || done) && (
                    <p className={`text-[11px] mt-0.5 ${done ? 'text-slate-600' : 'text-slate-400'}`}>
                      {done ? '✓ Complete' : stage.detail}
                    </p>
                  )}
                </div>
                {active && (
                  <div className="ml-auto shrink-0">
                    <span className="inline-flex gap-0.5">
                      {[0,1,2].map(d => (
                        <span key={d} className="h-1 w-1 rounded-full bg-brand-400 animate-bounce"
                          style={{ animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
