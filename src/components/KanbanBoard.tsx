import Plusicon from '../Icons/Plusicon';
import { useEffect, useMemo, useState } from 'react';
import type { Column, Id, Task } from '../types';
import ColumnContainer from './ColumnContainer';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

const STORAGE_KEY = 'kanban-board-state-v2';

const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    columnId: 'todo',
    title: 'goals',
    description: 'Finish the Pending projects',
    priority: 'High',
    
  },
  {
    id: 'task-2',
    columnId: 'in-progress',
    title: 'Projects',
    description: '2 down 1 more to go',
    priority: 'Medium',
    
  },
  {
    id: 'task-3',
    columnId: 'done',
    title: 'Review requirements',
    description: 'Hopefully this meets the required expectation',
    priority: 'Low',
    
  },
];

function getInitialColumns() {
  if (typeof window === 'undefined') {
    return defaultColumns;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultColumns;
    }

    const parsed = JSON.parse(stored) as { columns?: Column[] };
    return Array.isArray(parsed.columns) && parsed.columns.length > 0 ? parsed.columns : defaultColumns;
  } catch {
    return defaultColumns;
  }
}

function getInitialTasks() {
  if (typeof window === 'undefined') {
    return defaultTasks;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultTasks;
    }

    const parsed = JSON.parse(stored) as { tasks?: Task[] };
    return Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(getInitialColumns);
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ columns, tasks }));
  }, [columns, tasks]);

  const createTask = (columnId: Id) => {
    setTasks((prevTasks) => {
      const columnTaskCount = prevTasks.filter((task) => task.columnId === columnId).length;
      const newTask: Task = {
        id: generateId(),
        columnId,
        title: `Task ${columnTaskCount + 1}`,
        description: 'Add more context for this task.',
        priority: 'Medium',
      };

      return [...prevTasks, newTask];
    });
  };

  const deleteTask = (id: Id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const updateTask = (id: Id, updates: Partial<Task>) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, ...updates } : task)));
  };

  const createNewColumn = () => {
    const newColumn: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns((prevColumns) => [...prevColumns, newColumn]);
  };

  const deleteColumn = (id: Id) => {
    setColumns((prevColumns) => prevColumns.filter((column) => column.id !== id));
    setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== id));
  };

  const updateColumn = (_id: Id, title: string) => {
    setColumns((prevColumns) => prevColumns.map((column) => (column.id === _id ? { ...column, title } : column)));
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    if (active.data.current?.type !== 'Column') {
      return;
    }

    setColumns((currentColumns) => {
      const activeColumnIndex = currentColumns.findIndex((column) => column.id === active.id);
      const overColumnIndex = currentColumns.findIndex((column) => column.id === over.id);

      if (activeColumnIndex === -1 || overColumnIndex === -1) {
        return currentColumns;
      }

      return arrayMove(currentColumns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    if (active.data.current?.type !== 'Task') {
      return;
    }

    const activeTaskId = active.id as Id;

    if (over.data.current?.type === 'Task') {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((task) => task.id === activeTaskId);
        const overIndex = prevTasks.findIndex((task) => task.id === over.id);

        if (activeIndex === -1 || overIndex === -1) {
          return prevTasks;
        }

        const updatedTasks = [...prevTasks];
        const [movedTask] = updatedTasks.splice(activeIndex, 1);
        const targetColumnId = updatedTasks[overIndex - 1]?.columnId ?? prevTasks[overIndex].columnId;
        const nextTask = { ...movedTask, columnId: targetColumnId };
        updatedTasks.splice(overIndex, 0, nextTask);
        return updatedTasks;
      });
      return;
    }

    if (over.data.current?.type === 'Column') {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((task) => task.id === activeTaskId);

        if (activeIndex === -1) {
          return prevTasks;
        }

        const updatedTasks = [...prevTasks];
        const [movedTask] = updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(activeIndex, 0, { ...movedTask, columnId: over.id });
        return updatedTasks;
      });
    }
  };

  return (
    <div className='m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-6 py-6'>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className='m-auto flex gap-4'>
          <div className='flex gap-4'>
            <SortableContext items={columnIds}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className='flex h-15 min-w-50 cursor-pointer gap-2 rounded-lg border border-gray-500 bg-gray-600 p-2 text-center text-md text-white ring-blue-400 hover:ring-2'
          >
            <Plusicon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default KanbanBoard;