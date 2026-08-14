import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Grid3x3, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = ["Development", "Productivity", "Media", "System", "Other"];
const DEFAULT_ICONS = { Development: "💻", Productivity: "📊", Media: "🎬", System: "⚙️", Other: "📦" };

export default function AppLaunchpad() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", command: "", icon: "", category: "Development" });
  const { toast } = useToast();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const data = await base44.entities.AppShortcut.list();
      setApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", command: "", icon: "", category: "Development" });
    setDialogOpen(true);
  };

  const openEdit = (app) => {
    setEditing(app);
    setForm({ name: app.name, command: app.command, icon: app.icon || "", category: app.category || "Other" });
    setDialogOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const icon = form.icon || DEFAULT_ICONS[form.category] || "📦";
    try {
      if (editing) {
        await base44.entities.AppShortcut.update(editing.id, { ...form, icon });
        setApps((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...form, icon } : a)));
      } else {
        const created = await base44.entities.AppShortcut.create({ ...form, icon });
        setApps((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      toast({ description: editing ? "Shortcut updated" : "Shortcut added" });
    } catch (e) {
      toast({ variant: "destructive", description: "Save failed" });
    }
  };

  const remove = async (id) => {
    try {
      await base44.entities.AppShortcut.delete(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
      toast({ description: "Shortcut removed" });
    } catch (e) {
      toast({ variant: "destructive", description: "Delete failed" });
    }
  };

  const launch = (app) => {
    toast({ description: `Launching ${app.name}…` });
  };

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    apps: apps.filter((a) => (a.category || "Other") === cat),
  })).filter((g) => g.apps.length > 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">App Launchpad</h3>
          <span className="text-xs text-slate-500">{apps.length}</span>
        </div>
        <Button onClick={openAdd} size="sm" className="bg-slate-700 hover:bg-slate-600 text-xs h-8">
          <Plus className="w-3 h-3 mr-1" /> Add App
        </Button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">Loading shortcuts…</div>
        ) : apps.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            No shortcuts yet. Click "Add App" to configure your launchpad.
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.category}>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{group.category}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {group.apps.map((app) => (
                    <div key={app.id} className="group relative">
                      <button
                        onClick={() => launch(app)}
                        className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-600 hover:bg-slate-800/60 transition-all"
                      >
                        <span className="text-3xl">{app.icon || "📦"}</span>
                        <span className="text-xs text-slate-300 text-center truncate max-w-full">{app.name}</span>
                      </button>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(app)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                          <Pencil className="w-3 h-3 text-slate-400" />
                        </button>
                        <button onClick={() => remove(app.id)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Shortcut" : "Add Shortcut"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">App Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-950 border-slate-700"
                placeholder="VS Code"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Launch Command</Label>
              <Input
                value={form.command}
                onChange={(e) => setForm({ ...form, command: e.target.value })}
                className="bg-slate-950 border-slate-700 font-mono text-sm"
                placeholder="open -a 'Visual Studio Code'"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Icon (emoji)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="bg-slate-950 border-slate-700"
                  placeholder="💻"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-md h-10 px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-200 text-slate-900 hover:bg-white">
                {editing ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}