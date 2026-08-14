import React, { useState } from 'react';
import { Copy, Check, Sparkles, ArrowDown } from 'lucide-react';

export default function CodeDiffViewer({ originalHtml, correctedHtml, remediationSteps }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!correctedHtml) return;
    navigator.clipboard.writeText(correctedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mt-3 rounded-xl overflow-hidden"
      style={{ background: 'rgba(5,8,16,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(15,22,40,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-bold text-slate-200 tracking-tight">AI Code Fix & Remediation</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{
            background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.15)',
            border: copied ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(99,102,241,0.3)',
            color: copied ? '#6ee7b7' : '#a5b4fc',
          }}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Panels */}
      <div className="p-4 space-y-3">
        {/* Original */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Violating HTML Snippet:</span>
          </div>
          <div className="p-3.5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {originalHtml || '<!-- Element markup missing or empty -->'}
          </div>
        </div>

        {/* Transition Divider */}
        <div className="flex items-center justify-center my-1">
          <div className="h-6 w-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <ArrowDown className="h-3.5 w-3.5 text-brand-400" />
          </div>
        </div>

        {/* Corrected */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">WCAG Compliant Production HTML:</span>
          </div>
          <div className="p-3.5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7' }}>
            {correctedHtml || '<!-- Corrected WCAG accessibility markup -->'}
          </div>
        </div>
      </div>

      {/* Steps */}
      {remediationSteps && remediationSteps.length > 0 && (
        <div className="px-4 py-3 text-xs"
          style={{ background: 'rgba(15,22,40,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-bold text-slate-300 mb-1.5">Steps Applied:</p>
          <ul className="space-y-1 text-slate-400">
            {remediationSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-brand-400 font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
