import React, { useState } from 'react';
import { Globe, Sparkles, ArrowRight, Zap, Shield, Eye } from 'lucide-react';

const PRESET_SITES = [
  { name: '🎯 W3C Bad Demo', url: 'https://www.w3.org/WAI/demos/bad/' },
  { name: '📰 Hacker News', url: 'https://news.ycombinator.com/' },
  { name: '🏦 Testfire Bank', url: 'https://demo.testfire.net/' },
];

const FEATURES = [
  { icon: Shield, label: 'WCAG 2.1 AA/AAA', color: '#818cf8' },
  { icon: Eye,    label: 'Visual Bounding Boxes', color: '#a78bfa' },
  { icon: Zap,    label: 'AI Code Fixes', color: '#f472b6' },
];

export default function UrlForm({ onStartScan, isScanning }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) { setError('Enter a URL to audit'); return; }
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

      {/* Feature pills */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {FEATURES.map(({ icon: Icon, label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>

      {/* URL Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-2xl transition-all duration-300"
          style={{
            background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(15,22,40,0.7)',
            border: focused ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12), 0 20px 40px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(20px)',
          }}>
          <div className="flex items-center gap-3 p-2 pl-4">
            <Globe className="h-5 w-5 shrink-0 transition-colors duration-200"
              style={{ color: focused ? '#818cf8' : '#475569' }} />
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://example.com — enter any website URL"
              disabled={isScanning}
              className="input-field flex-1 py-3 text-[15px] disabled:opacity-50"
              autoComplete="url"
            />
            <button
              id="audit-btn"
              type="submit"
              disabled={isScanning}
              className="btn-primary shrink-0"
            >
              {isScanning ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Audit Site
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 px-2">
            <span className="h-1 w-1 rounded-full bg-rose-400" />
            {error}
          </p>
        )}
      </form>

      {/* Preset quick-launch chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest shrink-0">
          Quick test:
        </span>
        {PRESET_SITES.map((p, i) => (
          <button
            key={i}
            id={`preset-btn-${i}`}
            onClick={() => handlePreset(p.url)}
            disabled={isScanning}
            className="text-[12px] px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-40"
            style={{
              background: 'rgba(30,41,59,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#94a3b8',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              e.currentTarget.style.color = '#a5b4fc';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(30,41,59,0.6)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
