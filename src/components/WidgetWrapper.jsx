import React from "react";
import { GripVertical } from "lucide-react";

const GRID = 20;
const MIN_W = 240;
const MIN_H = 180;

export default function WidgetWrapper({ id, title, layout, editMode, onLayoutChange, children }) {
  const pos = layout[id] || { x: 0, y: 0, w: 400, h: 300 };
  const snap = (val) => Math.round(val / GRID) * GRID;

  const handleDragStart = (e) => {
    if (!editMode) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { x: pos.x, y: pos.y };

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onLayoutChange(id, { ...pos, x: snap(startPos.x + dx), y: snap(startPos.y + dy) });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleResizeStart = (e) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { w: pos.w, h: pos.h };

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onLayoutChange(id, {
        ...pos,
        w: Math.max(MIN_W, snap(startSize.w + dx)),
        h: Math.max(MIN_H, snap(startSize.h + dy)),
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className={`absolute flex flex-col ${editMode ? "z-20" : ""}`}
      style={{ left: pos.x, top: pos.y, width: pos.w, height: pos.h }}
    >
      {editMode && (
        <div
          onMouseDown={handleDragStart}
          className="shrink-0 h-7 flex items-center gap-1.5 px-2.5 rounded-t-md bg-slate-800 border border-slate-700 border-b-0 cursor-move select-none"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-300 font-medium">{title}</span>
        </div>
      )}
      <div
        className={`flex-1 min-h-0 overflow-auto ${editMode ? "border border-slate-700 border-t-0 rounded-b-md" : ""}`}
      >
        {children}
      </div>
      {editMode && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-center p-1"
        >
          <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-slate-500 rounded-br-sm" />
        </div>
      )}
    </div>
  );
}