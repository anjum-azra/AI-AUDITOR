import React from 'react';
import { Award, AlertOctagon, AlertTriangle, Info, CheckCircle2, TrendingUp } from 'lucide-react';

const SEV_CONFIG = [
  { key: 'critical', label: 'Critical', icon: AlertOctagon, color: '#ef4444', sub: 'Must Remediation' },
  { key: 'serious',  label: 'Serious',  icon: AlertTriangle,color: '#f97316', sub: 'High Barrier' },
  { key: 'moderate', label: 'Moderate', icon: Info,          color: '#eab308', sub: 'Sub-optimal' },
  { key: 'minor',    label: 'Minor',    icon: Info,          color: '#3b82f6', sub: 'Best Practice' },
];

function getTheme(score) {
  if (score >= 90) return { color: '#10b981', grade: 'A', label: 'Excellent – WCAG 2.1 AA Conformant' };
  if (score >= 75) return { color: '#0284c7', grade: 'B', label: 'Good – Minor Remediation Required' };
  if (score >= 60) return { color: '#eab308', grade: 'C', label: 'Fair – Notable Barriers Found' };
  if (score >= 40) return { color: '#f97316', grade: 'D', label: 'Poor – Significant Barriers Found' };
  return { color: '#ef4444', grade: 'F', label: 'Critical – Major Accessibility Barriers' };
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
    <div className="w-full lang-card rounded-2xl p-6 mb-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

        {/* ── Score Circular Gauge ── */}
        <div className="md:col-span-3 flex flex-col items-center gap-3 md:border-r md:pr-6"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
              <circle cx="50" cy="50" r={R} fill="none"
                stroke={theme.color}
                strokeWidth="8"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: theme.color }}>{score}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
              style={{
                background: `${theme.color}18`,
                border: `1px solid ${theme.color}35`,
                color: theme.color,
              }}>
              <Award className="h-3.5 w-3.5" />
              Grade {report.grade || theme.grade}
            </div>
            <p className="text-[11px] font-medium mt-1.5 leading-tight" style={{ color: 'var(--text-sub)' }}>
              {report.grade_label || theme.label}
            </p>
          </div>
        </div>

        {/* ── Severity Metric Cards ── */}
        <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SEV_CONFIG.map(({ key, label, icon: Icon, color, sub }) => (
            <div key={key}
              className="rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200"
              style={{
                background: `${color}0d`,
                border: `1px solid ${color}30`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color }}>{label}</span>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black" style={{ color }}>{counts[key] ?? 0}</span>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary Stats ── */}
        <div className="md:col-span-3 flex flex-col gap-3 md:border-l md:pl-6"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>Total Violations</p>
              <p className="text-lg font-black text-rose-500">{total}</p>
            </div>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>Passing Rules</p>
              <p className="text-lg font-black text-emerald-500">{passes}</p>
            </div>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)' }}>
            <TrendingUp className="h-5 w-5 text-sky-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>Audit Pass Rate</p>
              <p className="text-lg font-black text-sky-500">
                {total + passes > 0 ? Math.round((passes / (total + passes)) * 100) : 100}%
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
