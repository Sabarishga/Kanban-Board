import type { Id, Task, TaskPriority } from "../types";
import TrashIcon from "../Icons/TrashIcon";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, updates: Partial<Task>) => void;
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const openEditMode = () => {
    setEditMode(true);
    setMouseIsOver(false);
  };

  const closeEditMode = () => {
    setEditMode(false);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-h-24 rounded-xl border-2 border-blue-400 bg-gray-700 opacity-50"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex min-h-30 flex-col gap-2 rounded-xl border border-blue-400 bg-gray-700 p-3 text-left shadow-sm"
      >
        <input
          className="rounded bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-blue-400 "
          value={task.title}
          autoFocus
          placeholder="Task title"
          onChange={(event) =>
            updateTask(task.id, { title: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
        />
        <textarea
          className="min-h-18 rounded bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-blue-400"
          value={task.description}
          placeholder="Describe the task"
          onChange={(event) =>
            updateTask(task.id, { description: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeEditMode();
              return;
            }

            if (event.key === "Enter" && !event.shiftKey) {
              event.currentTarget.blur();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2">
          <select
            className="rounded bg-gray-800 px-2 py-1 text-sm text-white outline-none"
            value={task.priority}
            onChange={(event) =>
              updateTask(task.id, {
                priority: event.target.value as TaskPriority,
              })
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button
            type="button"
            onClick={closeEditMode}
            className="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-400"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={openEditMode}
      className="relative flex min-h-30 flex-col gap-2 rounded-xl bg-gray-700 p-3 text-left shadow-sm hover:ring-2 hover:ring-inset hover:ring-blue-400"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{task.title}</h3>
        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-blue-300">
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-300">
        {task.description || "Add a short description..."}
      </p>

      {mouseIsOver && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            deleteTask(task.id);
          }}
          className="absolute right-2 bottom-1 rounded bg-gray-700 p-2 stroke-white opacity-70 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
