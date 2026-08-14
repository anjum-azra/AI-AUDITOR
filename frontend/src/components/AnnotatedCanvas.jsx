import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';

export default function AnnotatedCanvas({ scanId, violations, selectedViolation, onSelectViolation, pageDimensions }) {
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const containerRef = useRef(null);

  const screenshotUrl = scanId ? `/api/report/${scanId}/screenshot` : null;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="w-full h-[660px] rounded-2xl border flex flex-col overflow-hidden relative"
      style={{
        background: 'rgba(10,15,30,0.75)',
        borderColor: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
      
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 z-20"
        style={{ background: 'rgba(15,22,40,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200 tracking-tight">Live Rendered Page & Bounding Box Overlay</span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-300 px-2 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-0.5 border-l border-white/10 pl-2"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Container */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4 relative flex justify-center items-start custom-scrollbar" style={{ background: '#03060d' }}>
        {!screenshotUrl ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 text-xs">
            <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
            <span>No screenshot available</span>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-200 origin-top shadow-2xl rounded-xl overflow-hidden"
            style={{ transform: `scale(${zoom})`, border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <img
              src={screenshotUrl}
              alt="Annotated Page Screenshot"
              onLoad={() => setImgLoaded(true)}
              className="max-w-full h-auto block rounded-xl"
            />

            {/* Bounding Box Overlays */}
            {imgLoaded && violations && violations.map((v) => {
              const bbox = v.bounding_box;
              if (!bbox || bbox.width <= 0 || bbox.height <= 0) return null;

              const isSelected = selectedViolation?.id === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => onSelectViolation(v)}
                  title={`Violation #${v.violation_number}: ${v.rule_id}`}
                  style={{
                    left: `${bbox.x}px`,
                    top: `${bbox.y}px`,
                    width: `${bbox.width}px`,
                    height: `${bbox.height}px`,
                  }}
                  className={`absolute cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-4 ring-indigo-400 bg-indigo-500/25 z-30 animate-pulse'
                      : 'hover:ring-2 hover:ring-white/80 hover:bg-white/10 z-10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between z-20"
        style={{ background: 'rgba(15,22,40,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="h-3 w-3 text-brand-400" />
          Click any bounding box or numbered badge to jump to its AI code fix
        </span>
        {pageDimensions && (
          <span className="font-mono text-[10px] text-slate-500">
            Viewport: {pageDimensions.viewportWidth}x{pageDimensions.viewportHeight}
          </span>
        )}
      </div>

    </div>
  );
}
