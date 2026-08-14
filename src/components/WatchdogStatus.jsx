import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Plus, Pencil, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const STATUS_DOT = {
  active: "bg-emerald-400",
  paused: "bg-slate-500",
  alert: "bg-amber-400",
  error: "bg-red-400",
};

const RESULT_BADGE = {
  ok: { label: "OK", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  warn: { label: "Warn", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  fail: { label: "Fail", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  pending: { label: "Pending", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatInterval(seconds) {
  if (!seconds || seconds < 60) return `Every ${seconds || 300}s`;
  if (seconds < 3600) return `Every ${Math.floor(seconds / 60)}m`;
  return `Every ${Math.floor(seconds / 3600)}h`;
}

export default function WatchdogStatus() {
  const [watchdogs, setWatchdogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", target: "", description: "", interval_seconds: 300 });
  const { toast } = useToast();

  useEffect(() => {
    loadWatchdogs();
    const unsub = base44.entities.Watchdog.subscribe(() => loadWatchdogs());
    return unsub;
  }, []);

  const loadWatchdogs = async () => {
    try {
      const data = await base44.entities.Watchdog.list();
      setWatchdogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", target: "", description: "", interval_seconds: 300 });
    setDialogOpen(true);
  };

  const openEdit = (wd) => {
    setEditing(wd);
    setForm({ name: wd.name, target: wd.target, description: wd.description || "", interval_seconds: wd.interval_seconds || 300 });
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Watchdog.update(editing.id, form);
        setWatchdogs((prev) => prev.map((w) => (w.id === editing.id ? { ...w, ...form } : w)));
      } else {
        const created = await base44.entities.Watchdog.create({ ...form, status: "active", last_result: "pending", alert_count: 0 });
        setWatchdogs((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      toast({ description: editing ? "Watchdog updated" : "Watchdog added" });
    } catch (e) {
      toast({ variant: "destructive", description: "Save failed" });
    }
  };

  const togglePause = async (wd) => {
    const newStatus = wd.status === "paused" ? "active" : "paused";
    try {
      await base44.entities.Watchdog.update(wd.id, { status: newStatus });
      setWatchdogs((prev) => prev.map((w) => (w.id === wd.id ? { ...w, status: newStatus } : w)));
    } catch (e) {
      toast({ variant: "destructive", description: "Update failed" });
    }
  };

  const remove = async (id) => {
    try {
      await base44.entities.Watchdog.delete(id);
      setWatchdogs((prev) => prev.filter((w) => w.id !== id));
      toast({ description: "Watchdog removed" });
    } catch (e) {
      toast({ variant: "destructive", description: "Delete failed" });
    }
  };

  const activeCount = watchdogs.filter((w) => w.status === "active").length;
  const alertCount = watchdogs.filter((w) => w.status === "alert" || w.status === "error").length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Watchdogs</h3>
          <span className="text-xs text-slate-500">{activeCount} active</span>
          {alertCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20">
              {alertCount} {alertCount === 1 ? "alert" : "alerts"}
            </span>
          )}
        </div>
        <Button onClick={openAdd} size="sm" className="bg-slate-700 hover:bg-slate-600 text-xs h-8">
          <Plus className="w-3 h-3 mr-1" /> Add Watchdog
        </Button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-slate-500 text-sm py-6">Loading watchdogs…</div>
        ) : watchdogs.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-6">No watchdogs configured. Click "Add Watchdog" to start monitoring.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {watchdogs.map((wd) => {
              const result = RESULT_BADGE[wd.last_result] || RESULT_BADGE.pending;
              return (
                <div key={wd.id} className="group relative rounded-lg border border-slate-800 bg-slate-950 p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[wd.status] || STATUS_DOT.active} ${wd.status === "error" ? "animate-pulse" : ""}`} />
                      <span className="text-sm font-medium text-white truncate">{wd.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => togglePause(wd)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                        {wd.status === "paused" ? <Play className="w-3 h-3 text-slate-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
                      </button>
                      <button onClick={() => openEdit(wd)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                        <Pencil className="w-3 h-3 text-slate-400" />
                      </button>
                      <button onClick={() => remove(wd.id)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                        <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 truncate font-mono">{wd.target}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Last: <span className="text-slate-400">{timeAgo(wd.last_check)}</span></span>
                    <span className={`px-1.5 py-0.5 rounded border ${result.cls}`}>{result.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span>{formatInterval(wd.interval_seconds)}</span>
                    {wd.alert_count > 0 && <span className="text-amber-400">{wd.alert_count} alerts</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Watchdog" : "Add Watchdog"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-slate-950 border-slate-700" placeholder="API Health Check" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Target</Label>
              <Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="bg-slate-950 border-slate-700 font-mono text-sm" placeholder="https://api.example.com/health" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-slate-950 border-slate-700" placeholder="Monitors API response time" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Check Interval (seconds)</Label>
              <Input type="number" value={form.interval_seconds} onChange={(e) => setForm({ ...form, interval_seconds: parseInt(e.target.value) || 300 })} className="bg-slate-950 border-slate-700" min={10} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-slate-200 text-slate-900 hover:bg-white">{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}