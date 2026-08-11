import React, { useState } from 'react';
import { X, Key, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, onSaveApiKey, currentApiKey }) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Configure LLM API Key</h3>
            <p className="text-xs text-slate-400">Anthropic Claude / OpenAI / Gemini for AI code fixes</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-... or sk-... or AIzaSy..."
              className="w-full bg-dark-900 text-xs text-slate-200 placeholder-slate-500 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              If left blank, the scanner will automatically use environment keys or the built-in WCAG intelligent rule fix generator.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>API Key saved successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
