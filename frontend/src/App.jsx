import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UrlForm from './components/UrlForm';
import ScanProgress from './components/ScanProgress';
import ReportView from './components/ReportView';
import ApiKeyModal from './components/ApiKeyModal';
import HistoryDrawer from './components/HistoryDrawer';
import { AlertTriangle, ShieldCheck, Eye, Zap, BarChart3, Code2 } from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Full axe-core Audit Engine',
    desc: 'Automated evaluation of WCAG 2.1 Level A & AA guidelines on dynamic client-side JS applications.',
    color: '#0284c7',
  },
  {
    icon: Eye,
    title: 'Visual Bounding Box Overlays',
    desc: 'Renders full-page screenshots with severity-color-coded bounding boxes mapped directly to DOM nodes.',
    color: '#2563eb',
  },
  {
    icon: Zap,
    title: 'AI Code Remediator',
    desc: 'Translates technical axe rules into plain-English explanations and production-ready HTML code diffs.',
    color: '#7c3aed',
  },
  {
    icon: BarChart3,
    title: 'Scorecard & Conformance Grade',
    desc: 'Weighted A–F scoring system based on violation impact with scan history comparison over time.',
    color: '#059669',
  },
  {
    icon: Code2,
    title: 'Multi-LLM Engine Support',
    desc: 'Powered by Claude 3.5 Sonnet, Gemini 1.5, or GPT-4o with an intelligent rule-based offline fallback.',
    color: '#d97706',
  },
  {
    icon: ShieldCheck,
    title: 'Report Export & Sharing',
    desc: 'Export full JSON audit logs, download annotated PNG screenshots, or copy instant summaries.',
    color: '#db2777',
  },
];

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });
  const [currentReport, setCurrentReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanError, setScanError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleStartScan = async (url) => {
    setIsScanning(true);
    setTargetUrl(url);
    setScanError('');
    setCurrentReport(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, api_key: apiKey || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      setCurrentReport(await res.json());
    } catch (err) {
      if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        setScanError('Cannot connect to backend server. Make sure Python API server is running on port 8000.');
      } else {
        setScanError(err.message || 'An unexpected error occurred during the scan.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectHistory = async (scanId) => {
    try {
      const res = await fetch(`/api/report/${scanId}`);
      if (res.ok) {
        setCurrentReport(await res.json());
        setScanError('');
      } else {
        setScanError('Failed to fetch report history item.');
      }
    } catch {
      setScanError('Failed to connect to backend server for history item.');
    }
  };

  const showHero = !isScanning && !currentReport && !scanError;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        currentReport={currentReport}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 pb-12">

        {/* Hero Section */}
        <section className="relative pt-12 pb-8 overflow-hidden">
          
          <div className="relative max-w-4xl mx-auto text-center px-4 mb-8 animate-fade-up">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[11px] font-bold uppercase tracking-widest transition-transform hover:scale-105"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}>
              <Zap className="h-3.5 w-3.5" />
              Agent Engineering Platform for Web Accessibility
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-5"
              style={{ color: 'var(--text-main)' }}>
              Ship accessible web apps that{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text-lang">wow every user</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-sub)' }}>
              Observe, evaluate, and remediate WCAG 2.1 accessibility barriers with Playwright &amp; axe-core.
              Pinpoint exact DOM nodes visually with AI code fixes.
            </p>

          </div>

          {/* URL Input Form */}
          <UrlForm onStartScan={handleStartScan} isScanning={isScanning} />
        </section>

        {/* Scan Error Banner */}
        {scanError && (
          <div className="max-w-2xl mx-auto my-6 px-4 animate-fade-up">
            <div className="rounded-2xl p-5 flex items-start gap-4"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                boxShadow: 'var(--shadow-card)',
              }}>
              <div className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-rose-500 text-sm mb-1">Scan Execution Failed</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>{scanError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Scan Progress */}
        {isScanning && <ScanProgress targetUrl={targetUrl} />}

        {/* Audit Results Report View */}
        {!isScanning && currentReport && <ReportView report={currentReport} />}

        {/* Feature Cards Grid (Welcome State) */}
        {showHero && (
          <section className="max-w-6xl mx-auto mt-8 mb-16 px-4">
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Built for modern development teams
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1" style={{ color: 'var(--text-main)' }}>
                Complete End-to-End WCAG Audit Workflow
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURE_CARDS.map(({ icon: Icon, title, desc, color }, i) => (
                <div
                  key={title}
                  className="lang-card rounded-2xl p-6 transition-all duration-300 group cursor-default animate-fade-up"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: 'both',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="text-base font-bold mb-2 tracking-tight" style={{ color: 'var(--text-main)' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[12px] font-medium transition-colors"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          background: 'var(--bg-nav)',
        }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-500" />
            <span>AI Accessibility Auditor · WCAG 2.1 Compliance Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Playwright Engine</span>
            <span>·</span>
            <span>axe-core 4.9</span>
            <span>·</span>
            <span>LLM Remediator</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onSaveApiKey={(key) => setApiKey(key)}
        currentApiKey={apiKey}
      />
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={handleSelectHistory}
      />
    </div>
  );
}
