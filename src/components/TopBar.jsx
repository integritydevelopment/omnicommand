import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";

export default function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2.5">
        <Activity className="w-4 h-4 text-emerald-400" />
        <h2 className="text-sm font-semibold text-white">Dashboard</h2>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono text-white tabular-nums">{timeString}</p>
        <p className="text-[10px] text-slate-500">{dateString}</p>
      </div>
    </header>
  );
}