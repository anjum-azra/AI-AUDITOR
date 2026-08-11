import React from 'react';
import { Award, AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Scorecard({ report }) {
  if (!report) return null;

  const score = report.score ?? 0;
  const grade = report.grade || 'A';
  const gradeLabel = report.grade_label || '';
  const counts = report.severity_counts || { critical: 0, serious: 0, moderate: 0, minor: 0 };

  // Color scheme based on score
  const getScoreColor = (s) => {
    if (s >= 90) return { text: 'text-emerald-400', stroke: '#10B981', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 75) return { text: 'text-amber-400', stroke: '#F59E0B', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { text: 'text-rose-400', stroke: '#EF4444', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const scoreTheme = getScoreColor(score);
  const strokeDasharray = 283; // 2 * pi * 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * score) / 100;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Score Ring Gauge (4 cols) */}
        <div className="md:col-span-4 flex items-center justify-center gap-6 border-b md:border-b-0 md:border-r border-slate-800/80 pb-6 md:pb-0 md:pr-6">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={scoreTheme.stroke}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black ${scoreTheme.text}`}>{score}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Score</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-brand-400" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Conformance</span>
            </div>
            <div className={`px-3 py-1 rounded-xl border text-center ${scoreTheme.bg}`}>
              <span className={`text-lg font-black tracking-wider ${scoreTheme.text}`}>{grade}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[140px] leading-tight">{gradeLabel}</p>
          </div>
        </div>

        {/* Severity Metrics Cards (8 cols) */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Critical */}
          <div className="bg-dark-800/80 rounded-xl p-3.5 border border-rose-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Critical</span>
              <AlertOctagon className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-400">{counts.critical}</span>
              <span className="text-[10px] text-slate-500">Action Required</span>
            </div>
          </div>

          {/* Serious */}
          <div className="bg-dark-800/80 rounded-xl p-3.5 border border-orange-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Serious</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-orange-400">{counts.serious}</span>
              <span className="text-[10px] text-slate-500">High Barrier</span>
            </div>
          </div>

          {/* Moderate */}
          <div className="bg-dark-800/80 rounded-xl p-3.5 border border-amber-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Moderate</span>
              <Info className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{counts.moderate}</span>
              <span className="text-[10px] text-slate-500">Sub-optimal</span>
            </div>
          </div>

          {/* Minor */}
          <div className="bg-dark-800/80 rounded-xl p-3.5 border border-blue-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Minor</span>
              <Info className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-400">{counts.minor}</span>
              <span className="text-[10px] text-slate-500">Best Practice</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
