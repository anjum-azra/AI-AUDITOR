import React, { useState } from 'react';
import { Search, Globe, Play, Sparkles, AlertCircle } from 'lucide-react';

const PRESET_SITES = [
  { name: 'W3C Accessibility Demo (Bad)', url: 'https://www.w3.org/WAI/demos/bad/' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/' },
  { name: 'Testfire Online', url: 'https://demo.testfire.net/' }
];

export default function UrlForm({ onStartScan, isScanning }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }
    setError('');
    onStartScan(url.trim());
  };

  const handlePresetSelect = (presetUrl) => {
    setUrl(presetUrl);
    setError('');
    onStartScan(presetUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel p-2 rounded-2xl border border-slate-700/60 shadow-2xl shadow-brand-500/5 focus-within:border-brand-500/80 transition-all">
          <div className="flex items-center gap-3 px-3 py-1">
            <Globe className="h-5 w-5 text-brand-400 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL to audit (e.g., https://example.com)"
              disabled={isScanning}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono py-2"
            />
            <button
              type="submit"
              disabled={isScanning}
              className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isScanning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Audit Website</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-rose-400 px-3">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Target Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Sample Verification Targets:</span>
        {PRESET_SITES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetSelect(preset.url)}
            disabled={isScanning}
            className="text-xs px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 border border-slate-700/50 hover:border-brand-500/40 transition-all font-mono"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
