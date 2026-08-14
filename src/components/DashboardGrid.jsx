import React, { useState, useEffect } from "react";
import WidgetWrapper from "@/components/WidgetWrapper";
import { Lock, Unlock, RotateCcw } from "lucide-react";

const STORAGE_KEY = "mission-control-layout";

const DEFAULT_LAYOUT = {
  reports: { x: 0, y: 0, w: 660, h: 380 },
  todo: { x: 680, y: 0, w: 320, h: 380 },
  watchdogs: { x: 0, y: 400, w: 1000, h: 220 },
  launchpad: { x: 0, y: 640, w: 1000, h: 320 },
};

export default function DashboardGrid({ widgets }) {
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  const handleLayoutChange = (id, newLayout) => {
    setLayout((prev) => ({ ...prev, [id]: newLayout }));
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
  };

  const maxBottom = Math.max(...Object.values(layout).map((l) => l.y + l.h), 400);

  return (
    <div className="relative flex-1 overflow-auto min-h-0 p-4 lg:p-6">
      <div
        className="relative"
        style={{
          minHeight: maxBottom + 24,
          ...(editMode
            ? {
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }
            : {}),
        }}
      >
        {widgets.map((w) => (
          <WidgetWrapper
            key={w.id}
            id={w.id}
            title={w.title}
            layout={layout}
            editMode={editMode}
            onLayoutChange={handleLayoutChange}
          >
            {w.component}
          </WidgetWrapper>
        ))}
      </div>

      <div className="fixed top-[4.5rem] right-5 z-50 flex gap-2">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-lg ${
            editMode
              ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
          }`}
        >
          {editMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {editMode ? "Done" : "Edit Layout"}
        </button>
        {editMode && (
          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 shadow-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}