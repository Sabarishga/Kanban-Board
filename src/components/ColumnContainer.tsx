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
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) =>void;
  tasks: Task[];
}


function ColumnContainer(props: Props) {
  const { column, 
    deleteColumn, 
    updateColumn, 
    createTask, 
    tasks, 
    deleteTask, 
    updateTask,
   } = props;

  const [editMode, setEditMode] = useState(false);

const tasksIds = useMemo(() => {
  return tasks.map(tasks => tasks.id);
}, [tasks]);


const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
} = useSortable({
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
  return <div ref={setNodeRef}
    style={style} className='
  bg-gray-600
  opacity-20
  border-2
  border-blue-400
  max-w-200px
  w-90.5
  h-150.5
  max-h-150.5
  rounded-md
    flex
  flex-col
  '></div>
}

  return (
    
  <div 
    ref={setNodeRef}
    style={style}
    className='
  bg-gray-600
  max-w-200px
  w-90.5
  h-150.5
  max-h-150.5
  rounded-md
    flex
  flex-col
  '>

      {/* Column Title */}
       <div 
       {...attributes}
       {...listeners}
       onClick={() => {
        setEditMode(true);
       }}       
        className='
       bg-gray-700
       text-md
       h-10.5
       cursor-grab
       rounded-mb
       rounded-b-none
       p-1
       font-bold
       border-b-gray-800
       border-b-solid
       border-b-2
       
       text-center
       flex
       justify-between
       '
       >

        <div className='flex gap-5'>
        <div className='
        flex
        justify-center
        items-center
        bg-gray-700
        px-2
        py-1
        rounded-full
        text-sm
        '
        >
          {tasks.length}
        </div>
      
        {!editMode && column.title}
        {editMode && (
          <input 
            className='bg-gray-800 focus:border-blue-400 borderrounded outline-none px-4'
            value={column.title}
            onChange={(e) => updateColumn(column.id, e.target.value)}
        autoFocus
        onBlur={() => {
          setEditMode(false);
        }}
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            setEditMode(false);
          }}
        />
      )}
      </div>
      <button 
      onClick={() => {
        deleteColumn(column.id);
      }}
        className='
      stroke-gray-300
      hover:stroke-white  
      hover:bg-gray-600
      rounded
      px-1
      py-1
      '>
          <TrashIcon />
      </button>
    </div>
    



       {/* column task container */}
      <div className='flex grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto'>
        <SortableContext items = {tasksIds}>
        {tasks.map((task) => (
          <TaskCard 
          key={task.id} 
          task={task} 
          deleteTask={deleteTask} 
          updateTask={updateTask}
          />
        ))}
        </SortableContext>
    </div>
       {/* column footer */}
       <button 
          className='flex gap-4 item bg-center
          border-b-gray-600 border-2 rounded-md p-4 border-x-gray-600
          border-y-gray-600
          hover:bg-gray-700 hover:text-blue-500
          active:bg-black'
          onClick={() => {
            createTask(column.id);
          }}
        >
            <PlusIcon />
              Add Task
        </button>
       
    </div>
  );
}

export default ColumnContainer