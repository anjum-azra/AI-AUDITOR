import React from 'react';
import { ShieldAlert, Key, History, Sun, Moon, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenApiKey, onToggleHistory, currentReport, theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <div className="w-full sticky top-0 z-50">

      {/* LangChain-style Top Announcement Bar */}
      <div className="w-full py-1.5 px-4 text-center text-[12px] font-medium transition-colors"
        style={{ background: 'var(--top-banner-bg)', color: 'var(--top-banner-text)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <span>Automated WCAG 2.1 Remediation Engine · AI Bounding Box Pinpointing &amp; Code Fixes</span>
          <span className="hidden md:inline-flex items-center gap-1 opacity-90 font-mono text-[11px] underline cursor-pointer hover:opacity-100 ml-2"
            onClick={onOpenApiKey}>
            Configure LLM Key <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Main Navbar Header */}
      <header className="w-full transition-colors" style={{
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-4">

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: isDark ? '0 0 20px rgba(56,189,248,0.4)' : '0 4px 12px rgba(2,132,199,0.25)',
              }}>
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[18px] tracking-tight" style={{ color: 'var(--text-main)' }}>
                  AI <span className="gradient-text-lang">Accessibility</span> Auditor
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(2,132,199,0.1)',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    border: isDark ? '1px solid rgba(56,189,248,0.25)' : '1px solid rgba(2,132,199,0.2)',
                  }}>
                  WCAG 2.1
                </span>
              </div>
            </div>
          </div>

          {/* Active Scan URL Indicator */}
          {currentReport && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
              style={{
                background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(16,185,129,0.08)',
                border: isDark ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(16,185,129,0.2)',
                color: isDark ? '#6ee7b7' : '#047857',
              }}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[200px]">{currentReport.url}</span>
            </div>
          )}

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">

            {/* Dark / Light Mode Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="btn-lang-outline text-xs p-2 shrink-0"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
              <span className="hidden sm:inline text-xs font-semibold">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {/* API Key Modal Button */}
            <button
              id="api-key-btn"
              onClick={onOpenApiKey}
              className="btn-lang-outline text-xs"
              title="Configure LLM API Key"
            >
              <Key className="h-3.5 w-3.5 text-sky-500" />
              <span className="hidden sm:inline">API Key</span>
            </button>

            {/* History Drawer Button */}
            <button
              id="history-btn"
              onClick={onToggleHistory}
              className="btn-lang-outline text-xs"
              title="View Scan History"
            >
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>

        </div>
      </header>
    </div>
  );
}
