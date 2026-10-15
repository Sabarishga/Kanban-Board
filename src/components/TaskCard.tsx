import type { Id, Task } from "../types";
import TrashIcon from "../Icons/TrashIcon";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  onEdit?: (task: Task) => void;
}

function TaskCard({ task, deleteTask, onEdit }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);

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
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-h-30 shrink-0 rounded-xl border-2 border-blue-400 bg-gray-700 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative flex min-h-30 shrink-0 flex-col gap-2 rounded-xl bg-gray-700 p-3 text-left shadow-sm hover:ring-2 hover:ring-inset hover:ring-blue-400"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 wrap-break-word text-sm font-semibold text-white">
          {task.title}
        </h3>
        <span className="shrink-0 rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-blue-300">
          {task.priority}
        </span>
      </div>

      <p className="wrap-break-word text-sm text-gray-300">
        {task.description || "Add a short description..."}
      </p>

      <div
        className={`mt-auto flex items-center justify-between pt-1 ${mouseIsOver ? "" : "invisible"}`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(task);
          }}
          className="rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-100 opacity-90 shadow-sm hover:bg-gray-600 hover:text-white"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            deleteTask(task.id);
          }}
          className="rounded-md bg-gray-700 p-2.5 stroke-white opacity-80 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="flex min-h-30 flex-col gap-2 rounded-xl bg-gray-700 p-3 text-left shadow-lg ring-2 ring-inset ring-blue-400">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 wrap-break-word text-sm font-semibold text-white">
          {task.title}
        </h3>
        <span className="shrink-0 rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-blue-300">
          {task.priority}
        </span>
      </div>

      <p className="wrap-break-word text-sm text-gray-300">
        {task.description || "Add a short description..."}
      </p>
    </div>
  );
}

export default TaskCard;
