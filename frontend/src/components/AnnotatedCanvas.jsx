import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Image as ImageIcon } from 'lucide-react';

export default function AnnotatedCanvas({ scanId, violations, selectedViolation, onSelectViolation, pageDimensions }) {
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const containerRef = useRef(null);

  const screenshotUrl = scanId ? `/api/report/${scanId}/screenshot` : null;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="w-full h-[650px] glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative">
      
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 z-20">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Rendered Page & Bounding Box Annotations</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-300 px-2 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors ml-1 border-l border-slate-700 pl-1.5"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-dark-950 p-4 relative flex justify-center items-start">
        {!screenshotUrl ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <ImageIcon className="h-10 w-10 mb-2 stroke-1 opacity-50" />
            <span>No screenshot available for this scan</span>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-200 origin-top shadow-2xl rounded-lg overflow-hidden border border-slate-800"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={screenshotUrl}
              alt="Annotated Page Screenshot"
              onLoad={() => setImgLoaded(true)}
              className="max-w-full h-auto block rounded-lg"
            />

            {/* Interactive Bounding Box Click Overlays */}
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
                      ? 'ring-4 ring-brand-400 bg-brand-500/20 z-30 animate-pulse'
                      : 'hover:ring-2 hover:ring-white/80 hover:bg-white/10 z-10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between z-20">
        <span>Click any numbered badge or box overlay on the image to inspect the code fix</span>
        {pageDimensions && (
          <span className="font-mono text-[10px]">Viewport: {pageDimensions.viewportWidth}x{pageDimensions.viewportHeight} | Scroll: {pageDimensions.scrollHeight}px</span>
        )}
      </div>

    </div>
  );
}
