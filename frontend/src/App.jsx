import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UrlForm from './components/UrlForm';
import ScanProgress from './components/ScanProgress';
import ReportView from './components/ReportView';
import ApiKeyModal from './components/ApiKeyModal';
import HistoryDrawer from './components/HistoryDrawer';
import { AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentReport, setCurrentReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanError, setScanError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleStartScan = async (url) => {
    setIsScanning(true);
    setTargetUrl(url);
    setScanError('');
    setCurrentReport(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          api_key: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Scan failed with status ${response.status}`);
      }

      const data = await response.json();
      setCurrentReport(data);
    } catch (err) {
      console.error('Scan error:', err);
      if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        setScanError('Failed to connect to backend server. Please verify the backend API is running on http://127.0.0.1:8000.');
      } else {
        setScanError(err.message || 'An unexpected error occurred during scan.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectReportHistory = async (scanId) => {
    try {
      const res = await fetch(`/api/report/${scanId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentReport(data);
        setScanError('');
      } else {
        const errData = await res.json().catch(() => ({}));
        setScanError(errData.detail || 'Failed to fetch report history item.');
      }
    } catch (err) {
      console.error('Error fetching report history:', err);
      setScanError('Failed to connect to backend server for history item.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        currentReport={currentReport}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* Hero & URL Input Form */}
        <section className="pt-8 pb-4">
          <div className="max-w-4xl mx-auto text-center px-4 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-[11px] uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Automated WCAG 2.1 Remediation Platform
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight py-1">
              Scan, Visualize &amp;{' '}
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent [box-decoration-break:clone] [-webkit-box-decoration-break:clone] inline-block sm:inline">
                Auto-Fix Accessibility
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
              Detect WCAG 2.1 violations on live JS-rendered pages with Playwright & axe-core. Pinpoint exact elements visually with bounding box screenshots and get AI-generated production code fixes.
            </p>
          </div>

          <UrlForm onStartScan={handleStartScan} isScanning={isScanning} />
        </section>

        {/* Scan Error Banner */}
        {scanError && (
          <div className="max-w-3xl mx-auto my-4 px-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-200">Scan Execution Failed</h4>
                <p className="mt-0.5 leading-relaxed">{scanError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Multi-Stage Scan Progress */}
        {isScanning && <ScanProgress targetUrl={targetUrl} />}

        {/* Audit Results Dashboard */}
        {!isScanning && currentReport && <ReportView report={currentReport} />}

        {/* Empty Welcome State */}
        {!isScanning && !currentReport && !scanError && (
          <section className="max-w-5xl mx-auto mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Full axe-core Audit</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluates WCAG 2.1 Level A, AA & AAA success criteria on dynamic client-side JS applications.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Visual Bounding Boxes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Captures full-page screenshots with severity-color-coded bounding boxes mapped directly to DOM elements.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white">AI Code Remediator</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Converts every machine violation into plain-English explanations and production-ready HTML code diffs.
                </p>
              </div>

            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-dark-950">
        <p>AI Accessibility Auditor • Powered by Playwright, axe-core & LLM Engine</p>
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
        onSelectReport={handleSelectReportHistory}
      />
    </div>
  );
}
