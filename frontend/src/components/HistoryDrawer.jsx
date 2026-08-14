import React, { useEffect, useState } from 'react';
import { X, History, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/reports')
        .then((res) => res.json())
        .then((data) => {
          setReports(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(3,6,13,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md h-full flex flex-col p-6 overflow-y-auto shadow-2xl animate-fade-up"
        style={{
          background: 'rgba(10,15,30,0.95)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              <History className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Audit Scan History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading scan history...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No past scan reports found.</div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  onSelectReport(r.id);
                  onClose();
                }}
                className="p-4 rounded-xl cursor-pointer transition-all duration-200 space-y-2 group"
                style={{
                  background: 'rgba(15,22,40,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(15,22,40,0.6)';
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[210px] group-hover:text-brand-300 transition-colors">
                    {r.url}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black"
                    style={{
                      background: r.score >= 90 ? 'rgba(52,211,153,0.15)' : r.score >= 75 ? 'rgba(96,165,250,0.15)' : 'rgba(239,68,68,0.15)',
                      color: r.score >= 90 ? '#6ee7b7' : r.score >= 75 ? '#93c5fd' : '#fca5a5',
                      border: r.score >= 90 ? '1px solid rgba(52,211,153,0.3)' : r.score >= 75 ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(239,68,68,0.3)',
                    }}>
                    {r.score}/100 ({r.grade})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {new Date(r.timestamp || Date.now()).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-rose-400">
                    {r.total_violations} Violations
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
