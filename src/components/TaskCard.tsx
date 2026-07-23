import type { Id, Task } from "../types"
import TrashIcon from "../Icons/TrashIcon";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface props {
  task: Task;
  deleteTask:(id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

function TaskCard({ task, deleteTask, updateTask }: props) {
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
      type: 'Task',
      task,
    },
    disabled: editMode,
  });
  
const style = {
  transition,
  transform: CSS.Transform.toString(transform),
};


  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
    <div ref={setNodeRef}
          style={style} className="
          opacity-50
          relative flex min-h-25 items-center rounded-xl bg-gray-700 p-2.5 pr-10 text-left border-2 border-blue-400 cursor-grab task"
          ></div>
    );
  }

  if (editMode) {
    return ( 
     <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="relative flex min-h-25 items-center rounded-xl bg-gray-700 p-2.5 pr-10 text-left hover:ring-2 hover:ring-inset hover:ring-blue-400 cursor-grab"
          >
           <textarea 
            className="
           h-[90%]
           w-full resize-none border-none rounded bg-transparent
           text-white focus:outline-none
           "
           value={task.content}
           autoFocus
           placeholder="Task Content Here"
           onBlur={toggleEditMode}
           onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) toggleEditMode();
           }}
            onChange={(e) => updateTask(task.id, e.target.value)}
            ></textarea>
        </div>
    );
  }


  return (
    <div
      ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
      onClick={toggleEditMode}
      className="relative flex min-h-25 items-center rounded-xl bg-gray-700 p-2.5 pr-10 text-left hover:ring-2 hover:ring-inset hover:ring-blue-400 cursor-grab task"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <p className="my-auto-h-[90%] w-full overflow-y-auto
      overflow-x-hidden whitespace-pre-wrap">
         {task.content} 
         </p>
      
      {mouseIsOver && (
        <button
          onClick={() => {
            deleteTask(task.id);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-gray-700 p-2 stroke-white opacity-70 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard