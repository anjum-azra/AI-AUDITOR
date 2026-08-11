import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, Code, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import CodeDiffViewer from './CodeDiffViewer';

const SEVERITY_BADGES = {
  critical: { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', icon: AlertOctagon, label: 'Critical' },
  serious: { bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400', icon: AlertTriangle, label: 'Serious' },
  moderate: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: Info, label: 'Moderate' },
  minor: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: Info, label: 'Minor' }
};

export default function ViolationCard({ violation, isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(isSelected);
  const [activeTab, setActiveTab] = useState('fix'); // 'fix' | 'explanation' | 'spec'

  const impact = (violation.impact || 'moderate').toLowerCase();
  const badgeStyle = SEVERITY_BADGES[impact] || SEVERITY_BADGES.moderate;
  const BadgeIcon = badgeStyle.icon;

  const aiFix = violation.ai_fix || {};
  const tags = violation.tags || [];

  return (
    <div
      id={`violation-card-${violation.id}`}
      onClick={() => onSelect(violation)}
      className={`rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-800/90 border-brand-500/80 ring-2 ring-brand-500/30 shadow-xl shadow-brand-500/10'
          : 'bg-dark-800/70 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Card Summary Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          
          {/* Violation Number Pill */}
          <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-brand-600/20 text-brand-300 font-extrabold text-xs border border-brand-500/30">
            #{violation.violation_number}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-sm text-white tracking-wide">{violation.rule_id}</span>
              
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-bold flex items-center gap-1 ${badgeStyle.bg}`}>
                <BadgeIcon className="h-3 w-3" />
                {badgeStyle.label}
              </span>

              {tags.slice(0, 2).map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800">
                  {t}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-300 leading-snug line-clamp-2">{violation.description || violation.help}</p>

            <div className="mt-2 text-[11px] font-mono text-slate-400 truncate max-w-md bg-dark-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-brand-400 font-sans">Selector: </span>
              {violation.target_selector || 'N/A'}
            </div>
          </div>

        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="shrink-0 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <div className="border-t border-slate-800/80 p-4 bg-slate-900/40 rounded-b-2xl" onClick={(e) => e.stopPropagation()}>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
            <button
              onClick={() => setActiveTab('fix')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'fix'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Code Fix</span>
            </button>

            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'explanation'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Impact Explanation</span>
            </button>

            <button
              onClick={() => setActiveTab('spec')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'spec'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>WCAG Spec</span>
            </button>
          </div>

          {/* Tab 1: AI Code Fix */}
          {activeTab === 'fix' && (
            <CodeDiffViewer
              originalHtml={violation.html_snippet}
              correctedHtml={aiFix.corrected_code}
              remediationSteps={aiFix.remediation_steps}
            />
          )}

          {/* Tab 2: Plain English Impact Explanation */}
          {activeTab === 'explanation' && (
            <div className="space-y-3 p-3 bg-dark-900 rounded-xl border border-slate-800 text-xs">
              <div>
                <h4 className="font-semibold text-brand-300 mb-1">Plain-English Summary</h4>
                <p className="text-slate-300 leading-relaxed">{aiFix.plain_english_explanation || 'No explanation generated.'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 mb-1">Assistive Technology Real-World Impact</h4>
                <p className="text-slate-300 leading-relaxed">{aiFix.why_it_matters || 'Affects users relying on screen readers and keyboard navigation.'}</p>
              </div>
            </div>
          )}

          {/* Tab 3: WCAG Spec & Failure Details */}
          {activeTab === 'spec' && (
            <div className="space-y-3 p-3 bg-dark-900 rounded-xl border border-slate-800 text-xs">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Axe-Core Failure Summary</h4>
                <p className="text-slate-400 font-mono text-[11px] leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {violation.failure_summary || 'No detailed failure log recorded.'}
                </p>
              </div>

              {violation.help_url && (
                <div className="pt-2">
                  <a
                    href={violation.help_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 hover:underline font-semibold"
                  >
                    <span>Read official Deque WCAG rule specification</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
