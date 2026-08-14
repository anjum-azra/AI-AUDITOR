import React, { useState } from 'react';
import { Globe, Sparkles, ArrowRight, ShieldCheck, Eye, Zap } from 'lucide-react';

const PRESET_SITES = [
  { name: '🎯 W3C Bad Accessibility Demo', url: 'https://www.w3.org/WAI/demos/bad/' },
  { name: '📰 Hacker News', url: 'https://news.ycombinator.com/' },
  { name: '🏦 Testfire Bank Demo', url: 'https://demo.testfire.net/' },
];

const FEATURES = [
  { icon: ShieldCheck, label: 'WCAG 2.1 Level A & AA Audit', color: '#0284c7' },
  { icon: Eye,         label: 'Visual Bounding Box Screenshots', color: '#2563eb' },
  { icon: Zap,         label: 'AI Production Code Fixes', color: '#7c3aed' },
];

export default function UrlForm({ onStartScan, isScanning }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) { setError('Please enter a website URL to audit'); return; }
    setError('');
    onStartScan(url.trim());
  };

  const handlePreset = (presetUrl) => {
    setUrl(presetUrl);
    setError('');
    onStartScan(presetUrl);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 animate-fade-up">

      {/* Feature Pills */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {FEATURES.map(({ icon: Icon, label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-transform hover:scale-105"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-card)',
            }}>
            <Icon className="h-3.5 w-3.5" style={{ color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-2xl transition-all duration-300"
          style={{
            background: 'var(--bg-card)',
            border: focused ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            boxShadow: focused ? '0 0 30px rgba(2,132,199,0.2), 0 20px 40px rgba(0,0,0,0.06)' : 'var(--shadow-card)',
          }}>
          <div className="flex items-center gap-3 p-2 pl-4">
            <Globe className="h-5 w-5 shrink-0 transition-colors duration-200"
              style={{ color: focused ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://example.com — enter target website URL"
              disabled={isScanning}
              className="w-full bg-transparent text-[15px] font-mono focus:outline-none disabled:opacity-50 py-3"
              style={{ color: 'var(--text-main)' }}
              autoComplete="url"
            />
            <button
              id="audit-btn"
              type="submit"
              disabled={isScanning}
              className="btn-lang-primary shrink-0"
            >
              {isScanning ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Audit Website
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2.5 text-xs text-rose-500 font-semibold flex items-center gap-1.5 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </form>

      {/* Preset Chips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest shrink-0" style={{ color: 'var(--text-muted)' }}>
          Quick verification targets:
        </span>
        {PRESET_SITES.map((p, i) => (
          <button
            key={i}
            id={`preset-btn-${i}`}
            onClick={() => handlePreset(p.url)}
            disabled={isScanning}
            className="text-[12px] px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-40"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-sub)',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-sub)';
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

    </div>
  );
}
