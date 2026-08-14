import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Circle, Plus, Trash2, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import KanbanBoard from "@/components/KanbanBoard";

const PRIORITY_BADGE = {
  high: { label: "High", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  medium: { label: "Med", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  low: { label: "Low", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export default function TodoDashboard() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [view, setView] = useState("list");
  const { toast } = useToast();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await base44.entities.Todo.list("-created_date", 50);
      setTodos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const todo = await base44.entities.Todo.create({ title: newTitle, priority: newPriority });
      setTodos((prev) => [todo, ...prev]);
      setNewTitle("");
      toast({ description: "Task added" });
    } catch (e) {
      toast({ variant: "destructive", description: "Failed to add task" });
    }
  };

  const toggleTodo = async (todo) => {
    const newStatus = todo.status === "done" ? "todo" : "done";
    try {
      await base44.entities.Todo.update(todo.id, { status: newStatus });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t)));
    } catch (e) {
      toast({ variant: "destructive", description: "Update failed" });
    }
  };

  const moveTodo = async (id, status) => {
    try {
      await base44.entities.Todo.update(id, { status });
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (e) {
      toast({ variant: "destructive", description: "Move failed" });
    }
  };

  const deleteTodo = async (id) => {
    try {
      await base44.entities.Todo.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      toast({ variant: "destructive", description: "Delete failed" });
    }
  };

  const active = todos.filter((t) => t.status !== "done");
  const done = todos.filter((t) => t.status === "done");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">To-Do</h3>
          <span className="text-xs text-slate-500">{active.length} active</span>
        </div>
        <div className="flex items-center gap-0.5 bg-slate-950 rounded-md p-0.5">
          <button
            onClick={() => setView("list")}
            className={`px-2 py-1 text-xs rounded transition-colors ${view === "list" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
          >
            List
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-2 py-1 text-xs rounded transition-colors ${view === "kanban" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Kanban
          </button>
        </div>
      </div>

      {view === "list" && (
      <form onSubmit={addTodo} className="p-3 border-b border-slate-800 flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="bg-slate-950 border-slate-700 text-white text-sm placeholder:text-slate-600 h-9"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-md h-9 px-2 shrink-0"
        >
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
        <Button type="submit" size="icon" className="bg-slate-700 hover:bg-slate-600 shrink-0 h-9 w-9">
          <Plus className="w-4 h-4" />
        </Button>
      </form>
      )}

      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading tasks…</div>
        ) : view === "kanban" ? (
          <div className="p-2 h-full">
            <KanbanBoard todos={todos} onMove={moveTodo} onDelete={deleteTodo} />
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {active.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
            {done.length > 0 && (
              <div className="px-4 py-1.5 text-[10px] text-slate-600 uppercase tracking-widest bg-slate-950/50">
                Completed
              </div>
            )}
            {done.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
            {todos.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">No tasks yet. Add one above.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  const isDone = todo.status === "done";
  const config = PRIORITY_BADGE[todo.priority] || PRIORITY_BADGE.medium;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/40 transition-colors group">
      <button onClick={() => onToggle(todo)} className="shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400 transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isDone ? "text-slate-500 line-through" : "text-slate-200"}`}>{todo.title}</p>
      </div>
      {!isDone && (
        <span className={`px-1.5 py-0.5 text-[10px] rounded border ${config.cls}`}>{config.label}</span>
      )}
      <button onClick={() => onDelete(todo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
      </button>
    </div>
  );
}