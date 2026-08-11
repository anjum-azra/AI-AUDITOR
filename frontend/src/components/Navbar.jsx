import React from 'react';
import { ShieldAlert, Key, History, Sparkles, ExternalLink } from 'lucide-react';

export default function Navbar({ onOpenApiKey, onToggleHistory, currentReport }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-brand-500 glow-text-brand" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">
                AI <span className="bg-gradient-to-r from-brand-500 via-indigo-400 to-pink-400 bg-clip-text text-transparent">Accessibility Auditor</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                WCAG 2.1 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Automated Playwright + axe-core scanning & AI code fixes</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {currentReport && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-mono max-w-[180px] truncate">{currentReport.url}</span>
            </div>
          )}

          <button
            onClick={onOpenApiKey}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all hover:border-brand-500/50"
            title="Configure LLM API Key (Anthropic / Gemini / OpenAI)"
          >
            <Key className="h-3.5 w-3.5 text-brand-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          <button
            onClick={onToggleHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all hover:border-brand-500/50"
            title="View scan history"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

      </div>
    </header>
  );
}
