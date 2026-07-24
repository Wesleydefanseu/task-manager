'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Project, MemberRole } from '@/lib/types';

const ROLE_BADGE: Record<MemberRole, string> = {
  ADMIN:  'bg-purple-50 text-purple-700 border-purple-200',
  MEMBER: 'bg-[#f0faf4] text-[#1e4d38] border-[#b2e8c8]',
};
const ROLE_LABEL: Record<MemberRole, string> = {
  ADMIN: 'Admin', MEMBER: 'Membre',
};

export default function ProjectCard({ project, myRole, onDelete }: {
  project: Project;
  myRole?: MemberRole;
  onDelete?: (id: string) => Promise<void>;
}) {
  const tasks = project.tasks ?? [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const memberCount = (project.members?.length ?? 0);
  const [deleting, setDeleting] = useState(false);

  const createdAt = new Date(project.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  async function handleDelete() {
    if (!confirm(`Supprimer "${project.name}" ? Cette action est irréversible.`)) return;
    if (!onDelete) return;
    setDeleting(true);
    try { await onDelete(project.id); } finally { setDeleting(false); }
  }

  return (
    <div className={`card flex flex-col p-5 hover:border-[var(--border-2)] hover:shadow-md transition-all duration-200 ${deleting ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-9 w-9 rounded-xl bg-[#f0faf4] flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d9e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          {myRole && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[myRole]}`}>
              {ROLE_LABEL[myRole]}
            </span>
          )}
          {onDelete && myRole === 'ADMIN' && (
          <button onClick={handleDelete} disabled={deleting}
              className="text-[var(--border-2)] hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50" aria-label="Supprimer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                <path d="M10,11v6"/><path d="M14,11v6"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-[var(--foreground)] line-clamp-1 mb-1">{project.name}</h3>
      <p className="text-sm text-[var(--muted)] line-clamp-2 min-h-[2.5rem] mb-4">
        {project.description || 'Aucune description'}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-[var(--muted-light)] mb-1.5">
          <span>{done}/{total} tâches terminées</span>
          <span className="font-semibold text-[#2d9e63]">{progress}%</span>
        </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div className="h-full rounded-full bg-[#2d9e63] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {inProgress > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-medium">
            ⚡ {inProgress} en cours
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium">
          👥 {memberCount} membre{memberCount !== 1 ? 's' : ''}
        </span>
          <span className="text-xs text-[var(--muted-light)] ml-auto">{createdAt}</span>
      </div>

      <Link href={`/dashboard/project/${project.id}`} className="btn-primary w-full justify-center mt-auto">
        Ouvrir
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
        </svg>
      </Link>
    </div>
  );
}
