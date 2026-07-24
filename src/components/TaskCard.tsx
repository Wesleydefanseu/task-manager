'use client';
import { useState } from 'react';
import type { Task, TaskStatus, MemberRole } from '@/lib/types';
import { canEdit } from '@/lib/types';

const PRIORITY: Record<Task['priority'], { label: string; color: string; dot: string }> = {
  HIGH:   { label: 'Haute',   color: 'bg-red-50 text-red-700 border-red-200',              dot: 'bg-red-500' },
  MEDIUM: { label: 'Moyenne', color: 'bg-orange-50 text-orange-700 border-orange-200',     dot: 'bg-orange-400' },
  LOW:    { label: 'Basse',   color: 'bg-[#f0faf4] text-[#1e4d38] border-[#b2e8c8]',      dot: 'bg-[#2d9e63]' },
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div title={name} className="h-6 w-6 rounded-full bg-[#d8f3e3] text-[#1e4d38] text-[10px] font-bold flex items-center justify-center ring-1 ring-[#b2e8c8] shrink-0">
      {initials}
    </div>
  );
}

function isOverdue(task: Task) {
  return task.status !== 'DONE' && !!task.dueDate && new Date(task.dueDate) < new Date();
}

export default function TaskCard({ task, myRole, onClick }: {
  task: Task;
  myRole: MemberRole | undefined;
  onClick: (task: Task) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const p = PRIORITY[task.priority];
  const overdue = isOverdue(task);
  const editable = canEdit(myRole);

  return (
    <div
      draggable={editable}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onClick(task)}
      className={`group bg-[var(--background)] rounded-xl border transition-all duration-150 p-3.5 select-none ${
        editable ? 'cursor-pointer' : 'cursor-default'
      } ${dragging ? 'opacity-50 scale-95 shadow-lg' : ''} ${
        overdue ? 'border-red-200 shadow-sm shadow-red-50' : 'border-[var(--border)] hover:border-[var(--border-2)] hover:shadow-sm'
      }`}
    >
      {/* Title */}
      <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2 leading-snug mb-2">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-[var(--muted-light)] line-clamp-1 mb-2">{task.description}</p>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium mb-2 ${
          overdue ? 'bg-red-100 text-red-700' : 'bg-[var(--surface-2)] text-[var(--muted)]'
        }`}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {overdue && '⚠ '}
          {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </span>
        <div className="flex items-center gap-1.5">
          {task.dependencies && task.dependencies.length > 0 && (
            <span className="text-[var(--muted-light)]" title={`${task.dependencies.length} dépendance(s)`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </span>
          )}
          <div className="flex -space-x-1">
          {task.assignees?.slice(0, 3).map((a) => <Avatar key={a.id} name={a.name} />)}
          {(task.assignees?.length ?? 0) > 3 && (
            <div className="h-6 w-6 rounded-full bg-[var(--border)] text-[var(--muted)] text-[10px] font-bold flex items-center justify-center ring-1 ring-[var(--background)]">+{(task.assignees?.length ?? 0) - 3}</div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
