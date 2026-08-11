import React, { useState } from 'react';
import { Copy, Check, Code2, Sparkles, ArrowRight } from 'lucide-react';

export default function CodeDiffViewer({ originalHtml, correctedHtml, remediationSteps }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!correctedHtml) return;
    navigator.clipboard.writeText(correctedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mt-3 rounded-xl bg-dark-900 border border-slate-800 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Implementation Fix</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 border border-brand-500/30 text-xs font-medium transition-all"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied Fix!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Fix</span>
            </>
          )}
        </button>
      </div>

      {/* Code Comparison Pane */}
      <div className="p-4 space-y-3">
        {/* Original Snippet */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide">Current HTML (Violating):</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
            {originalHtml || '<!-- Missing or unaccessible element markup -->'}
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="flex items-center justify-center my-1 text-slate-600">
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0 text-brand-400 opacity-60" />
        </div>

        {/* Corrected Snippet */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Corrected Production Markup:</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
            {correctedHtml || '<!-- Generated WCAG compliance fix -->'}
          </div>
        </div>
      </div>

      {/* Remediation Steps Bullet Points */}
      {remediationSteps && remediationSteps.length > 0 && (
        <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800 text-xs">
          <p className="font-semibold text-slate-300 mb-1.5">Remediation Steps Applied:</p>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            {remediationSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
