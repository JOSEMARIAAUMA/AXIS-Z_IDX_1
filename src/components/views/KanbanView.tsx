import React, { useState } from 'react';

// Datos de ejemplo. En el futuro, esto vendrá de las props.
const initialTasks = {
  'todo': [
    { id: '1', content: 'Implementar Supabase Auth' },
    { id: '2', content: 'Definir Roles en DB' },
    { id: '3', content: 'Políticas RLS estrictas' },
  ],
  'in-progress': [
    { id: '4', content: 'Módulo Documental: Generación de PDFs' },
  ],
  'done': [
    { id: '5', content: 'Auditoría de acciones (Logs)' },
    { id: '6', content: 'Plano Interactivo (SVG)' },
  ],
};

const columns = {
  'todo': 'Por Hacer',
  'in-progress': 'En Progreso',
  'done': 'Hecho',
};

const KanbanView = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceCol: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceCol', sourceCol);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, destCol: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    const sourceCol = e.dataTransfer.getData('sourceCol');

    if (sourceCol === destCol) return;

    const sourceTasks = [...tasks[sourceCol as keyof typeof tasks]];
    const destTasks = [...tasks[destCol as keyof typeof tasks]];
    const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
    const [movedTask] = sourceTasks.splice(taskIndex, 1);

    destTasks.push(movedTask);

    setTasks({
      ...tasks,
      [sourceCol]: sourceTasks,
      [destCol]: destTasks,
    });
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex space-x-4 p-4 h-full bg-brand-bg-dark text-white">
      {Object.entries(columns).map(([colId, colName]) => (
        <div 
          key={colId} 
          className="bg-brand-surface rounded-lg w-1/3 flex flex-col"
          onDrop={(e) => onDrop(e, colId)}
          onDragOver={onDragOver}
        >
          <h2 className="p-4 font-bold text-lg text-brand-text-primary border-b border-brand-border">{colName}</h2>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {tasks[colId as keyof typeof tasks].map(task => (
              <div 
                key={task.id} 
                draggable
                onDragStart={(e) => onDragStart(e, task.id, colId)}
                className="bg-brand-bg-dark p-4 rounded-md shadow-md cursor-grab active:cursor-grabbing border border-brand-border"
              >
                {task.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
