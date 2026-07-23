import Plusicon from '../Icons/Plusicon';
import { useMemo, useState } from 'react';
import type { Column, Id, Task } from '../types';
import ColumnContainer from './ColumnContainer';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

function KanbanBoard() {
      const [columns, setColumns] = useState<Column[]>([]);
      console.log(columns);
      const columsId = useMemo(() => columns.map((col) => col.id), [columns]);

      const [tasks, setTasks] = useState<Task[]>([]);

      const [activecolumn, setActiveColumn] = useState<Column | null>(null);

      const [activeTask, setActiveTask] = useState<Task | null>(null);

      const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
          distance: 3,
        },
      })
    );
      
      
  return (
    <div className='
    m-auto
    flex
    min-h-screen
    w-full
    items-center
    overflow-x-auto
    overflow-y-hidden
    px-12.5
    '
    >
      <DndContext 
      sensors={(sensors)} 
      onDragStart={onDragStart} 
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      >
        <div className='m-auto flex gap-4'> 
          <div className='flex gap-4'>
            <SortableContext items={columsId}>
            {columns.map(column => (
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
          onClick={() => {
            createNewColumn();
          }}
          className='
        h-15
        w-200px
        min-w-200px
        cursor-pointer
        rounded-lg
        bg-gray-600
        text-center
        text-md
        text-white
        border
        p-2
        ring-blue-400
        hover:ring-2
        flex
        gap-2
        '
        >
          <Plusicon />
          Add Column
            </button>
          </div>

          {createPortal(
            <DragOverlay>
              {activecolumn && (
                <ColumnContainer
                column={activecolumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter((task) => task.columnId === activecolumn.id)}
                />
              )}
              {activeTask && ( 
               <TaskCard 
                task={activeTask} 
                deleteTask={deleteTask}
                updateTask={updateTask} 
              />
            )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
  );

function createTask(columnId: Id) {
  setTasks((prevTasks) => {
    const columnTaskCount = prevTasks.filter((task) => task.columnId === columnId).length;

    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${columnTaskCount + 1}`,
    };

    return [...prevTasks, newTask];
  });
}

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

function updateTask(id: Id, content: string) {
  const newTasks = tasks.map(task => {
    if (task.id !== id)return task;
    return { ...task, content };
  });

  setTasks(newTasks);
}

  function createNewColumn() {
    const columnToadd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToadd]);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter(column => column.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(newTasks);
  }

function updateColumn(_id: Id, title: string) {
  const newColumns = columns.map((col) => {
    if (col.id === _id) return { ...col, title };
    return col;
  });

  setColumns(newColumns);
}


  function onDragStart(event: DragStartEvent) {
    console.log('DRAG START', event);
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

 function onDragEnd(event: DragEndEvent) {
  setActiveColumn(null);
  setActiveTask(null);

  const { active, over } = event;
  setActiveColumn(null);

  if (!over || active.id === over.id) {
    return;
  }

  setColumns((currentColumns) => {
    const activeColumnIndex = currentColumns.findIndex(
      (column) => column.id === active.id
    );

    const overColumnIndex = currentColumns.findIndex(
      (column) => column.id === over.id
    );

    if (activeColumnIndex === -1 || overColumnIndex === -1) {
      return currentColumns;
    }

    return arrayMove(
      currentColumns,
      activeColumnIndex,
      overColumnIndex
    );
  });
}

function onDragOver(event: DragOverEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id;
  const OverId = over.id;

  if (activeId === OverId) return;

  const isActiveATask = active.data.current?.type === "Task";
  const isOverAtask = over.data.current?.type === "Task";

  if (!isActiveATask) return;

  if (isActiveATask && isOverAtask) {
    setTasks((tasks) => {
      const activeIndex = tasks.findIndex ((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === OverId);

      tasks [activeIndex].columnId = tasks[overIndex].columnId;
      

      return arrayMove(tasks, activeIndex, overIndex);
    });
  }

  const isOverAColumn = over.data.current?.type === "Column";

  if (isActiveATask && isOverAColumn) {
    setTasks((tasks) => {
      const activeIndex = tasks.findIndex ((t) => t.id === activeId);
      
      tasks [activeIndex].columnId = OverId;
      

      return arrayMove(tasks, activeIndex, activeIndex);
    });
  }


}

function generateId() {

  return Math.floor(Math.random() * 10001);
}

}


export default KanbanBoard