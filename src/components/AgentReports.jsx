import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AGENT_BADGE = {
  "Claude Code": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Codex": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Hermes": "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const STATUS_DOT = {
  active: "bg-blue-400",
  completed: "bg-emerald-400",
  failed: "bg-red-400",
  info: "bg-slate-400",
};

export default function AgentReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadReports();
    const unsub = base44.entities.AgentReport.subscribe(() => loadReports());
    return unsub;
  }, []);

  const loadReports = async () => {
    try {
      const data = await base44.entities.AgentReport.list("-created_date", 50);
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.agent_name === filter);
  const filters = ["all", "Claude Code", "Codex", "Hermes"];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Agent Reports</h3>
          <span className="text-xs text-slate-500">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                filter === f ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto divide-y divide-slate-800/50 min-h-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No reports yet. Agent summaries will appear here automatically.
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelected(report)}
              className="p-4 hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-[10px] rounded-md border ${AGENT_BADGE[report.agent_name] || AGENT_BADGE["Hermes"]}`}>
                    {report.agent_name}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">{report.report_type}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[report.status] || STATUS_DOT.info}`} />
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(report.created_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <h4 className="text-sm font-medium text-white mb-1">{report.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{report.content}</p>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {selected && (
                <span className={`px-2 py-0.5 text-xs rounded-md border ${AGENT_BADGE[selected.agent_name] || AGENT_BADGE["Hermes"]}`}>
                  {selected.agent_name}
                </span>
              )}
              <span className="text-base font-semibold">{selected?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">{new Date(selected.created_date).toLocaleString()}</span>
                <span>·</span>
                <span className="uppercase">{selected.report_type}</span>
                <span>·</span>
                <span className="uppercase">{selected.status}</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 max-h-[400px] overflow-auto">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{selected.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}