import React from "react";
import { Terminal, Cpu, Zap } from "lucide-react";

const AGENTS = [
  { name: "Claude Code", icon: Terminal, dot: "bg-amber-400" },
  { name: "Codex", icon: Cpu, dot: "bg-emerald-400" },
  { name: "Hermes", icon: Zap, dot: "bg-violet-400" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-800 bg-slate-950 flex-col hidden md:flex">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-emerald-500 to-violet-500 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white tracking-widest">MISSION CONTROL</h1>
            <p className="text-[10px] text-slate-500 tracking-wide">Mac Mini · Omniroute</p>
          </div>
        </div>
      </div>

      <div className="p-3 flex-1">
        <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest mb-2 px-2">Agents</p>
        <div className="space-y-0.5">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.name} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-900 transition-colors">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300 flex-1">{agent.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${agent.dot} animate-pulse`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
}