'use client';
import { useState } from 'react';
import TaskCard from '@/components/TaskCard';
import type { Task, TaskStatus, MemberRole } from '@/lib/types';
import { canEdit } from '@/lib/types';

const COL_STYLE: Record<TaskStatus, { header: string; badge: string; border: string; bg: string; dot: string }> = {
  TODO:        { header: 'text-[var(--muted)]', badge: 'bg-[var(--surface-2)] text-[var(--muted)]',     border: 'border-[var(--border)]',   bg: 'bg-[var(--surface)]',    dot: 'bg-[var(--border-2)]' },
  IN_PROGRESS: { header: 'text-blue-700',  badge: 'bg-blue-50 text-blue-700',          border: 'border-blue-200/60', bg: 'bg-blue-50/30',   dot: 'bg-blue-400' },
  DONE:        { header: 'text-[#2d6a4f]', badge: 'bg-[#d8f3e3] text-[#1e4d38]',      border: 'border-[#b2e8c8]',  bg: 'bg-[#f0faf4]/50', dot: 'bg-[#2d9e63]' },
};

export default function KanbanColumn({ title, status, tasks, myRole, onStatusChange, onTaskClick }: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  myRole: MemberRole | undefined;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onTaskClick: (task: Task) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const s = COL_STYLE[status];
  const editable = canEdit(myRole);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (!editable) return;
    const id = e.dataTransfer.getData('text/plain');
    if (id) onStatusChange(id, status);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (editable) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
className={`flex flex-col rounded-[14px] border-2 transition-all duration-150 min-h-[420px] ${
        dragOver ? 'border-[#2d9e63] bg-[#2d9e63]/5 scale-[1.01]' : `${s.border} ${s.bg}`
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          <h3 className={`text-sm font-semibold ${s.header}`}>{title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}>{tasks.length}</span>
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1">
        {tasks.length === 0 ? (
          <div className={`flex-1 flex items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            dragOver ? 'border-[#2d9e63] bg-[var(--surface-2)]' : 'border-[var(--border)]'
          }`}>
            <p className="text-xs text-[var(--border-2)] font-medium">{editable ? 'Glissez ici' : 'Vide'}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} myRole={myRole} onClick={onTaskClick} />
          ))
        )}
      </div>
    </div>
  );
}
