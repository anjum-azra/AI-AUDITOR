import React, { useState } from 'react';
import Scorecard from './Scorecard';
import AnnotatedCanvas from './AnnotatedCanvas';
import ViolationCard from './ViolationCard';
import { Search, Download, FileJson, Share2, AlertCircle, CheckCircle2, SlidersHorizontal } from 'lucide-react';

export default function ReportView({ report }) {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!report) return null;

  const violations = report.violations || [];

  const filteredViolations = violations.filter((v) => {
    const matchesSeverity = severityFilter === 'all' || (v.impact || 'moderate').toLowerCase() === severityFilter;
    const matchesSearch =
      !searchQuery ||
      v.rule_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.target_selector?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const handleSelectViolation = (v) => {
    setSelectedViolation(v);
    const el = document.getElementById(`violation-card-${v.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-audit-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadScreenshot = () => {
    const a = document.createElement('a');
    a.href = `/api/report/${report.id}/screenshot`;
    a.download = `annotated-screenshot-${report.id}.png`;
    a.click();
  };

  const handleCopySummary = () => {
    const text = `AI Accessibility Audit Report for ${report.url}\nScore: ${report.score}/100 (${report.grade})\nTotal Violations: ${report.total_violations} (Critical: ${report.severity_counts.critical}, Serious: ${report.severity_counts.serious}, Moderate: ${report.severity_counts.moderate}, Minor: ${report.severity_counts.minor})`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-up">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl"
        style={{
          background: 'rgba(10,15,30,0.7)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Audit Dashboard</span>
          <h2 className="text-xl font-extrabold text-white truncate max-w-xl mt-0.5">{report.url}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Scanned on {new Date(report.timestamp || Date.now()).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="btn-ghost text-xs"
          >
            <FileJson className="h-4 w-4 text-brand-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleDownloadScreenshot}
            className="btn-ghost text-xs"
          >
            <Download className="h-4 w-4 text-violet-400" />
            <span>Screenshot</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="btn-primary text-xs"
          >
            <Share2 className="h-4 w-4" />
            <span>{copiedSummary ? 'Copied!' : 'Share Summary'}</span>
          </button>
        </div>
      </div>

      {/* Scorecard Dashboard */}
      <Scorecard report={report} />

      {/* Main Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Pane: Annotated Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <AnnotatedCanvas
            scanId={report.id}
            violations={violations}
            selectedViolation={selectedViolation}
            onSelectViolation={handleSelectViolation}
            pageDimensions={report.page_dimensions}
          />
        </div>

        {/* Right Pane: Filterable Violation List & Code Fix Drawer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Search & Filter Header */}
          <div className="p-4 rounded-2xl space-y-3"
            style={{
              background: 'rgba(10,15,30,0.7)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
            }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-brand-400" />
                <span>Detected Violations ({filteredViolations.length} / {violations.length})</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule ID, description, or element selector..."
                className="w-full bg-slate-950 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {['all', 'critical', 'serious', 'moderate', 'minor'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap"
                  style={severityFilter === sev
                    ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Violation Cards List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredViolations.length === 0 ? (
              <div className="rounded-2xl p-8 text-center text-slate-400 text-xs border"
                style={{ background: 'rgba(10,15,30,0.6)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-200 text-sm">No violations match filter</p>
                <p className="mt-1 text-slate-500">Try clearing your search query or selecting a different severity tab.</p>
              </div>
            ) : (
              filteredViolations.map((v) => (
                <ViolationCard
                  key={v.id}
                  violation={v}
                  isSelected={selectedViolation?.id === v.id}
                  onSelect={handleSelectViolation}
                />
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
