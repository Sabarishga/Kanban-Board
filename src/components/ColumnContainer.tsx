import { SortableContext, useSortable } from '@dnd-kit/sortable';
import TrashIcon from '../Icons/TrashIcon';
import PlusIcon from '../Icons/Plusicon';
import type { Column, Id, Task } from '../types';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import TaskCard from './TaskCard';

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  updateTask: (id: Id, updates: Partial<Task>) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
}

function ColumnContainer(props: Props) {
  const { column, deleteColumn, updateColumn, createTask, tasks, deleteTask, updateTask } = props;

  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: editMode,
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
        className='flex h-105 w-70 flex-col rounded-md border-2 border-blue-400 bg-gray-600 opacity-20'
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex h-105 w-70 flex-col rounded-md bg-gray-600'
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className='flex h-12 items-center justify-between rounded-t-md border-b border-gray-800 bg-gray-700 px-3 py-2 text-center text-md font-bold text-white'
      >
        <div className='flex items-center gap-3'>
          <div className='flex h-7 min-w-7 items-center justify-center rounded-full bg-gray-800 px-2 text-sm'>
            {tasks.length}
          </div>

          {!editMode && <span>{column.title}</span>}
          {editMode && (
            <input
              className='rounded border border-gray-500 bg-gray-800 px-3 py-1 outline-none focus:border-blue-400'
              value={column.title}
              onChange={(event) => updateColumn(column.id, event.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setEditMode(false);
                }
              }}
            />
          )}
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            deleteColumn(column.id);
          }}
          className='rounded px-1 py-1 stroke-gray-300 hover:bg-gray-600 hover:stroke-white'
        >
          <TrashIcon />
        </button>
      </div>

      <div className='flex grow flex-col gap-3 overflow-x-hidden overflow-y-auto p-3'>
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
          ))}
        </SortableContext>
      </div>

      <button
        className='flex items-center justify-center gap-2 rounded-b-md border-t border-gray-500 bg-gray-700 p-3 text-sm text-gray-200 hover:bg-gray-800 hover:text-blue-400'
        onClick={() => createTask(column.id)}
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
}

export default ColumnContainer