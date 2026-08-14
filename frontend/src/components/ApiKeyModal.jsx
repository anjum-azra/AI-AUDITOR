import React, { useState } from 'react';
import { X, Key, ShieldCheck, Lock, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,6,13,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden animate-fade-up"
        style={{
          background: 'rgba(15,22,40,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.15)',
        }}>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Configure AI Provider API Key</h3>
            <p className="text-xs text-slate-400">Optional: Anthropic Claude, Gemini, or OpenAI</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>API Key</span>
              <span className="text-[10px] text-slate-500 font-mono">Stored in browser local state</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-... or AIzaSy... or sk-..."
              className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              🔒 <strong>Safe & Private:</strong> Keys are stored locally in your browser. If left blank, the app automatically uses the built-in intelligent WCAG rule remediator!
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7' }}>
              <Check className="h-4 w-4 shrink-0" />
              <span>API Key saved successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
