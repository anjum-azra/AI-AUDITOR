import React from 'react';
import { ShieldAlert, Key, History, Zap } from 'lucide-react';

export default function Navbar({ onOpenApiKey, onToggleHistory, currentReport }) {
  return (
    <header className="sticky top-0 z-50 w-full" style={{
      background: 'rgba(5,8,16,0.75)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative h-9 w-9 rounded-xl flex items-center justify-center animate-float"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)', boxShadow: '0 0 18px rgba(99,102,241,0.4)' }}>
            <ShieldAlert className="h-4.5 w-4.5 text-white" style={{ height: 18, width: 18 }} />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[17px] text-white tracking-tight">
                AI <span className="gradient-text">Accessibility</span> Auditor
              </span>
              <span className="badge badge-brand hidden md:inline-flex">
                <Zap className="h-2.5 w-2.5" /> WCAG 2.1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden lg:block leading-none mt-0.5">
              Playwright · axe-core · AI Code Fixes
            </p>
          </div>
        </div>

        {/* Center: active scan indicator */}
        {currentReport && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-mono truncate max-w-[220px]">{currentReport.url}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            id="api-key-btn"
            onClick={onOpenApiKey}
            className="btn-ghost text-xs"
            title="Configure AI API Key"
          >
            <Key className="h-3.5 w-3.5 text-brand-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          <button
            id="history-btn"
            onClick={onToggleHistory}
            className="btn-ghost text-xs"
            title="Scan history"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </div>
    </header>
  );
}
