import { useState } from "react";
import { createPortal } from "react-dom";
import type { Task, TaskPriority } from "../types";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const defaultTask: Task = {
  id: "new-task",
  columnId: "todo",
  title: "Task 1",
  description: "Add more context for this task.",
  priority: "Medium",
};

function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [draft, setDraft] = useState<Task>(task ?? defaultTask);

  const updateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    setDraft((prevDraft) => ({
      ...prevDraft,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      title: draft.title.trim() || defaultTask.title,
      description: draft.description,
      priority: draft.priority,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-blue-400 bg-gray-700 p-4 text-left shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-30 flex-col gap-2">
          <input
            className="rounded bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-blue-400"
            value={draft.title}
            autoFocus
            placeholder="Task title"
            onChange={(event) => updateField("title", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
          <textarea
            className="min-h-18 rounded bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-blue-400"
            value={draft.description}
            placeholder="Describe the task"
            onChange={(event) => updateField("description", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onClose();
                return;
              }

              if (event.key === "Enter" && !event.shiftKey) {
                event.currentTarget.blur();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded bg-gray-600 px-3 py-1 text-sm font-medium text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-400"
              >
                Done
              </button>
            </div>

            <select
              className="rounded bg-gray-800 px-2 py-1 text-sm text-white outline-none"
              value={draft.priority}
              onChange={(event) =>
                updateField("priority", event.target.value as TaskPriority)
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default TaskModal;
