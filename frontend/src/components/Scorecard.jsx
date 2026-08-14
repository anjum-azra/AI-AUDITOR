import React from 'react';
import { Award, AlertOctagon, AlertTriangle, Info, CheckCircle2, TrendingUp } from 'lucide-react';

const SEV_CONFIG = [
  { key: 'critical', label: 'Critical', icon: AlertOctagon, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', sub: 'Must Fix' },
  { key: 'serious',  label: 'Serious',  icon: AlertTriangle,color: '#f97316', bg: 'rgba(249,115,22,0.08)',border: 'rgba(249,115,22,0.2)', sub: 'High Barrier' },
  { key: 'moderate', label: 'Moderate', icon: Info,          color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)',  sub: 'Should Fix' },
  { key: 'minor',    label: 'Minor',    icon: Info,          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',border: 'rgba(59,130,246,0.2)', sub: 'Best Practice' },
];

function getTheme(score) {
  if (score >= 90) return { color: '#34d399', glow: 'rgba(52,211,153,0.4)', grade: 'A', label: 'Excellent – WCAG Conformant' };
  if (score >= 75) return { color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', grade: 'B', label: 'Good – Minor Issues Present' };
  if (score >= 60) return { color: '#eab308', glow: 'rgba(234,179,8,0.4)',   grade: 'C', label: 'Fair – Notable Barriers' };
  if (score >= 40) return { color: '#f97316', glow: 'rgba(249,115,22,0.4)', grade: 'D', label: 'Poor – Significant Barriers' };
  return { color: '#ef4444', glow: 'rgba(239,68,68,0.4)', grade: 'F', label: 'Critical – Major Accessibility Failure' };
}

export default function Scorecard({ report }) {
  if (!report) return null;
  const score  = report.score ?? 0;
  const counts = report.severity_counts || { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const theme  = getTheme(score);
  const total  = report.total_violations ?? 0;
  const passes = report.passes_count ?? 0;

  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ - (circ * score) / 100;

  return (
    <div className="w-full rounded-2xl p-5 mb-6 animate-fade-up"
      style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">

        {/* ── Score ring ── */}
        <div className="md:col-span-3 flex flex-col items-center gap-3 md:border-r md:border-white/5 md:pr-5">
          <div className="relative w-32 h-32">
            {/* Glow ring behind */}
            <div className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 30px ${theme.glow}`, opacity: 0.4 }} />
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r={R} fill="none"
                stroke={theme.color}
                strokeWidth="8"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${theme.glow})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: theme.color }}>{score}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">/ 100</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black"
              style={{ background: `${theme.color}18`, border: `1px solid ${theme.color}30`, color: theme.color }}>
              <Award className="h-3.5 w-3.5" />
              Grade {report.grade || theme.grade}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-tight">{report.grade_label || theme.label}</p>
          </div>
        </div>

        {/* ── Severity counters ── */}
        <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SEV_CONFIG.map(({ key, label, icon: Icon, color, bg, border, sub }) => (
            <div key={key} className="rounded-xl p-3.5 flex flex-col gap-2 transition-all duration-200"
              style={{ background: bg, border: `1px solid ${border}` }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <div>
                <span className="text-2xl font-black" style={{ color }}>{counts[key] ?? 0}</span>
                <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary stats ── */}
        <div className="md:col-span-3 flex flex-col gap-3 md:border-l md:border-white/5 md:pl-5">
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">Total Violations</p>
              <p className="text-lg font-black text-rose-400">{total}</p>
            </div>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">Passing Rules</p>
              <p className="text-lg font-black text-emerald-400">{passes}</p>
            </div>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <TrendingUp className="h-5 w-5 text-brand-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">Pass Rate</p>
              <p className="text-lg font-black text-brand-400">
                {total + passes > 0 ? Math.round((passes / (total + passes)) * 100) : 100}%
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
