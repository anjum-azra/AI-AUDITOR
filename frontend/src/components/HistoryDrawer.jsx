import React, { useEffect, useState } from 'react';
import { X, History, ExternalLink, Award, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex justify-end bg-dark-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md h-full glass-panel border-l border-slate-800 bg-dark-900/95 p-6 overflow-y-auto flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand-400" />
            <h3 className="text-base font-bold text-white">Scan History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading audit history...</div>
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
                className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800/80 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[220px]">{r.url}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-brand-600/20 text-brand-300 text-xs font-black border border-brand-500/30">
                    {r.score}/100 ({r.grade})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.timestamp || Date.now()).toLocaleDateString()}
                  </span>
                  <span>{r.total_violations} Violations</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
