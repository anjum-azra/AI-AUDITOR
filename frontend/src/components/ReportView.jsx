import React, { useState } from 'react';
import Scorecard from './Scorecard';
import AnnotatedCanvas from './AnnotatedCanvas';
import ViolationCard from './ViolationCard';
import { Search, Download, FileJson, Share2, AlertCircle, CheckCircle2, FileSpreadsheet, Printer, FileText } from 'lucide-react';

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

  const handleExportCsv = () => {
    const headers = ['Violation Number', 'Rule ID', 'Severity Impact', 'Description', 'Selector', 'HTML Snippet', 'AI Code Fix'];
    const rows = violations.map(v => [
      `"${v.violation_number || ''}"`,
      `"${(v.rule_id || '').replace(/"/g, '""')}"`,
      `"${(v.impact || '').replace(/"/g, '""')}"`,
      `"${(v.description || '').replace(/"/g, '""')}"`,
      `"${(v.target_selector || '').replace(/"/g, '""')}"`,
      `"${(v.html_snippet || '').replace(/"/g, '""')}"`,
      `"${(v.ai_fix?.corrected_code || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-audit-${report.id}.csv`;
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

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-up">
      
      {/* Top Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl lang-card">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500">Executive Audit Report</span>
          <h2 className="text-xl font-extrabold truncate max-w-xl mt-0.5" style={{ color: 'var(--text-main)' }}>{report.url}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>
            Scanned on {new Date(report.timestamp || Date.now()).toLocaleString()} · Playwright &amp; axe-core 4.9
          </p>
        </div>

        {/* Multi-Format Export Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className="btn-lang-outline text-xs"
            title="Export JSON audit data"
          >
            <FileJson className="h-4 w-4 text-sky-500" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="btn-lang-outline text-xs"
            title="Export CSV for Excel or Jira"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadScreenshot}
            className="btn-lang-outline text-xs"
            title="Download full annotated screenshot"
          >
            <Download className="h-4 w-4 text-purple-500" />
            <span>PNG Screenshot</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="btn-lang-outline text-xs"
            title="Print or save as PDF"
          >
            <Printer className="h-4 w-4 text-indigo-500" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="btn-lang-primary text-xs"
          >
            <Share2 className="h-4 w-4" />
            <span>{copiedSummary ? 'Copied Summary!' : 'Share Summary'}</span>
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
          <div className="p-4 rounded-2xl space-y-3 lang-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <AlertCircle className="h-4 w-4 text-sky-500" />
                <span>Detected Violations ({filteredViolations.length} / {violations.length})</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule ID, description, or element selector..."
                className="w-full text-xs font-mono pl-9 pr-4 py-2.5 rounded-xl focus:outline-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'critical', 'serious', 'moderate', 'minor'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap"
                  style={severityFilter === sev
                    ? { background: 'var(--accent-gradient)', color: '#fff', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }
                    : { background: 'var(--bg-card-subtle)', color: 'var(--text-sub)', border: '1px solid var(--border-subtle)' }
                  }
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Violation Cards List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredViolations.length === 0 ? (
              <div className="rounded-2xl p-8 text-center text-xs lang-card">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-90" />
                <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>No violations match filter</p>
                <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Try clearing your search query or selecting a different severity tab.</p>
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
