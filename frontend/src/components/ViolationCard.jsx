import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import CodeDiffViewer from './CodeDiffViewer';

const SEV = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: AlertOctagon, label: 'Critical' },
  serious:  { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', icon: AlertTriangle,label: 'Serious' },
  moderate: { color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.25)',  icon: Info,          label: 'Moderate' },
  minor:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', icon: Info,          label: 'Minor' },
};

const TABS = [
  { id: 'fix',         icon: Sparkles,    label: 'AI Fix' },
  { id: 'explanation', icon: Lightbulb,   label: 'Impact' },
  { id: 'spec',        icon: ShieldAlert, label: 'WCAG Spec' },
];

export default function ViolationCard({ violation, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(isSelected);
  const [tab, setTab]           = useState('fix');

  const impact = (violation.impact || 'moderate').toLowerCase();
  const sev    = SEV[impact] || SEV.moderate;
  const Icon   = sev.icon;
  const aiFix  = violation.ai_fix || {};

  return (
    <div
      id={`violation-card-${violation.id}`}
      className="rounded-xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(15,22,40,0.6)',
        border: isSelected ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.12)' : 'none',
      }}
      onClick={() => onSelect(violation)}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
    >
      {/* ── Header ── */}
      <div className="p-3.5 flex items-start gap-3">
        {/* Number badge */}
        <div className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-black"
          style={{ background: `${sev.color}18`, color: sev.color, border: `1px solid ${sev.color}30` }}>
          {violation.violation_number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-sm font-bold text-white">{violation.rule_id}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color }}>
              <Icon className="h-2.5 w-2.5" />{sev.label}
            </span>
            {(violation.tags || []).slice(0, 2).map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {t}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {violation.description || violation.help}
          </p>

          {violation.target_selector && (
            <div className="mt-1.5 text-[11px] font-mono text-slate-500 truncate px-2 py-0.5 rounded"
              style={{ background: 'rgba(0,0,0,0.3)' }}>
              <span style={{ color: '#818cf8' }}>selector: </span>
              {violation.target_selector}
            </div>
          )}
        </div>

        <button
          className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}
          onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b'; }}
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── Expanded ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} onClick={e => e.stopPropagation()}>
          {/* Tabs */}
          <div className="flex items-center gap-1 px-3.5 pt-3 pb-2">
            {TABS.map(({ id, icon: TIcon, label }) => (
              <button key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={tab === id
                  ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.05)' }
                }
                onMouseEnter={e => { if (tab !== id) e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={e => { if (tab !== id) e.currentTarget.style.color = '#64748b'; }}
              >
                <TIcon className="h-3 w-3" />{label}
              </button>
            ))}
          </div>

          <div className="px-3.5 pb-3.5">
            {/* AI Fix */}
            {tab === 'fix' && (
              <CodeDiffViewer
                originalHtml={violation.html_snippet}
                correctedHtml={aiFix.corrected_code}
                remediationSteps={aiFix.remediation_steps}
              />
            )}

            {/* Impact */}
            {tab === 'explanation' && (
              <div className="rounded-xl p-4 space-y-3 text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="font-bold text-brand-300 mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" /> Plain-English Explanation
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {aiFix.plain_english_explanation || 'No explanation generated.'}
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <p className="font-bold text-amber-400 mb-1.5">Real-World AT Impact</p>
                  <p className="text-slate-300 leading-relaxed">
                    {aiFix.why_it_matters || 'Affects users relying on screen readers and keyboard navigation.'}
                  </p>
                </div>
              </div>
            )}

            {/* Spec */}
            {tab === 'spec' && (
              <div className="rounded-xl p-4 space-y-3 text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="font-bold text-slate-300 mb-1.5">Failure Summary</p>
                  <pre className="text-[11px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed p-3 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {violation.failure_summary || 'No detailed failure log recorded.'}
                  </pre>
                </div>
                {violation.help_url && (
                  <a href={violation.help_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold transition-colors"
                    style={{ color: '#818cf8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                    onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>
                    View Deque WCAG Specification <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
