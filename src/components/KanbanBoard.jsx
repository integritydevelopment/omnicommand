import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "border-t-slate-600" },
  { id: "in_progress", title: "In Progress", color: "border-t-blue-500" },
  { id: "done", title: "Done", color: "border-t-emerald-500" },
];

const PRIORITY_BADGE = {
  high: { label: "High", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  medium: { label: "Med", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  low: { label: "Low", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export default function KanbanBoard({ todos, onMove, onDelete }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onMove(result.draggableId, result.destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-3 h-full min-h-0">
        {COLUMNS.map((col) => {
          const items = todos.filter((t) => t.status === col.id);
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col rounded-lg border border-slate-800 bg-slate-950/40 min-h-0 ${snapshot.isDraggingOver ? "bg-slate-800/30" : ""}`}
                >
                  <div className={`px-3 py-2 border-b border-slate-800 border-t-2 ${col.color} flex items-center justify-between`}>
                    <span className="text-xs font-semibold text-white uppercase tracking-wide">{col.title}</span>
                    <span className="text-xs text-slate-500">{items.length}</span>
                  </div>
                  <div className="flex-1 overflow-auto p-2 space-y-2 min-h-0">
                    {items.map((todo, index) => {
                      const config = PRIORITY_BADGE[todo.priority] || PRIORITY_BADGE.medium;
                      return (
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`group p-3 rounded-lg border border-slate-700 bg-slate-900 cursor-grab active:cursor-grabbing ${
                                snap.isDragging ? "border-slate-500 shadow-xl opacity-90" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm leading-snug ${todo.status === "done" ? "text-slate-500 line-through" : "text-slate-200"}`}>
                                  {todo.title}
                                </p>
                                <button
                                  onClick={() => onDelete(todo.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                                </button>
                              </div>
                              {todo.status !== "done" && (
                                <span className={`mt-2 inline-block px-1.5 py-0.5 text-[10px] rounded border ${config.cls}`}>
                                  {config.label}
                                </span>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center text-slate-600 text-xs py-6">Drop tasks here</div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}