'use client';
import { useState, useEffect, FormEvent } from 'react';
import { Menu, Link2, X, Trash2, AlignJustify, Eye } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, MemberRole } from '@/lib/types';
import { canEdit, canDeleteTasks } from '@/lib/types';

const PRIORITY_STYLE: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  HIGH:   { label: 'Haute',   color: 'text-red-700',     bg: 'bg-red-100 border-red-300' },
  MEDIUM: { label: 'Moyenne', color: 'text-orange-700',  bg: 'bg-orange-100 border-orange-300' },
  LOW:    { label: 'Basse',   color: 'text-[#1e4d38]',   bg: 'bg-[#d8f3e3] border-[#74d0a0]' },
};

const STATUS_STYLE: Record<TaskStatus, { label: string; bg: string }> = {
  TODO:        { label: 'À faire',  bg: 'bg-[#f0f5f2] text-[#6b7c74] border-[#c8ddd4]' },
  IN_PROGRESS: { label: 'En cours', bg: 'bg-blue-50 text-blue-700 border-blue-300' },
  DONE:        { label: 'Terminé',  bg: 'bg-[#d8f3e3] text-[#1e4d38] border-[#74d0a0]' },
};

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const cls = { sm: 'h-6 w-6 text-[10px]', md: 'h-8 w-8 text-xs', lg: 'h-10 w-10 text-sm' }[size];
  return (
    <div className={`${cls} rounded-full bg-[#d8f3e3] text-[#1e4d38] font-bold flex items-center justify-center ring-2 ring-[#b2e8c8] shrink-0`}>
      {initials}
    </div>
  );
}

export default function TaskDetailModal({
  task,
  allTasks,
  members,
  myRole,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  allTasks: Task[];
  members: { id: string; name: string; email: string }[];
  myRole: MemberRole | undefined;
  onClose: () => void;
  onUpdate: (updated: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [editDesc, setEditDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  const editable = canEdit(myRole);
  const deletable = canDeleteTasks(myRole);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
  }, [task]);

  async function patch(data: Partial<Task & { dependencyIds?: string[] }>) {
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, ...data }),
      });
      if (res.ok) onUpdate(await res.json());
    } finally { setSaving(false); }
  }

  async function handleTitleSave() {
    setEditTitle(false);
    if (title.trim() && title !== task.title) await patch({ title });
    else setTitle(task.title);
  }

  async function handleDescSave() {
    setEditDesc(false);
    if (description !== (task.description ?? '')) await patch({ description });
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${task.title}" ?`)) return;
    const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
    if (res.ok) { onDelete(task.id); onClose(); }
  }

  const otherTasks = allTasks.filter((t) => t.id !== task.id);
  const depIds = task.dependencies?.map((d) => d.id) ?? [];

  async function toggleDep(depId: string) {
    const newDeps = depIds.includes(depId) ? depIds.filter((id) => id !== depId) : [...depIds, depId];
    await patch({ dependencyIds: newDeps });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--border)] mb-8">
        {/* Color bar by priority */}
        <div className={`h-1.5 rounded-t-2xl ${task.priority === 'HIGH' ? 'bg-red-400' : task.priority === 'MEDIUM' ? 'bg-orange-400' : 'bg-[#2d9e63]'}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-1">
              {editTitle && editable ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="w-full text-xl font-bold text-[var(--foreground)] bg-[var(--surface)] border border-[#2d9e63] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2d9e63]/20"
                />
              ) : (
                <h2
                  onClick={() => editable && setEditTitle(true)}
                  className={`text-xl font-bold text-[var(--foreground)] leading-snug ${editable ? 'cursor-pointer hover:bg-[var(--surface)] rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors' : ''}`}
                >
                  {title}
                </h2>
              )}
              <p className="text-xs text-[var(--muted-light)] mt-1.5 px-0.5">
                Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={onClose} className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted-light)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left: main content */}
            <div className="col-span-2 space-y-5">

              {/* Status + Priority chips */}
              <div className="flex flex-wrap gap-2">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((s) => (
                  <button key={s} disabled={!editable || saving}
                    onClick={() => editable && patch({ status: s })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      task.status === s ? STATUS_STYLE[s].bg + ' ring-2 ring-offset-1 ring-[#2d9e63]/30' : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-light)] hover:border-[var(--border-2)]'
                    } disabled:cursor-not-allowed`}>
                    {STATUS_STYLE[s].label}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlignJustify size={12} />
                  Description
                </p>
                {editDesc && editable ? (
                  <div>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-[#2d9e63] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#2d9e63]/20 resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleDescSave} className="btn-primary text-xs px-3 py-1.5">Enregistrer</button>
                      <button onClick={() => { setEditDesc(false); setDescription(task.description ?? ''); }} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => editable && setEditDesc(true)}
                    className={`min-h-[60px] rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      editable ? 'cursor-pointer hover:bg-[var(--surface)]' : ''
                    } ${description ? 'text-[var(--foreground)]' : 'text-[var(--muted-light)] italic'}`}
                  >
                    {description || (editable ? 'Cliquez pour ajouter une description...' : 'Aucune description')}
                  </div>
                )}
              </div>

              {/* Dependencies */}
              {otherTasks.length > 0 && (
                <div>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Link2 size={12} />
                    Dépendances
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
                    {otherTasks.map((t) => (
                      <label key={t.id} className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${editable ? 'cursor-pointer hover:bg-[var(--background)]' : 'cursor-default'}`}>
                        <input type="checkbox" checked={depIds.includes(t.id)} disabled={!editable || saving}
                          onChange={() => editable && toggleDep(t.id)}
                          className="accent-[#2d9e63] h-3.5 w-3.5 shrink-0" />
                        <span className={`line-clamp-1 ${depIds.includes(t.id) ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted)]'}`}>{t.title}</span>
                        {depIds.includes(t.id) && <span className="ml-auto text-[10px] badge-green shrink-0">Antécédent</span>}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="space-y-4">

              {/* Assignees */}
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Assignés</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {task.assignees && task.assignees.length > 0 ? task.assignees.map((a) => (
                    <div key={a.id} className="flex items-center gap-1.5 p-1.5 pr-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                      <Avatar name={a.name} size="sm" />
                      <span className="text-xs font-medium text-[var(--foreground)]">{a.name}</span>
                    </div>
                  )) : <p className="text-xs text-[var(--muted-light)] italic">Non assigné</p>}
                </div>
                {editable && (
                  <div className="space-y-1 max-h-32 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
                    {members.map((m) => {
                      const checked = task.assignees?.some((a) => a.id === m.id) ?? false;
                      return (
                        <label key={m.id} className="flex items-center gap-2 px-1.5 py-1 rounded-lg cursor-pointer hover:bg-[var(--background)] text-xs">
                          <input type="checkbox" checked={checked} disabled={saving}
                            onChange={() => {
                              const ids = task.assignees?.map((a) => a.id) ?? [];
                              const newIds = checked ? ids.filter((id) => id !== m.id) : [...ids, m.id];
                              patch({ assigneeIds: newIds } as any);
                            }}
                            className="accent-[#2d9e63] h-3.5 w-3.5" />
                          <span className={checked ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted)]'}>{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Priorité</p>
                <div className="space-y-1">
                  {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
                    <button key={p} disabled={!editable || saving}
                      onClick={() => editable && patch({ priority: p })}
                      className={`w-full flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                        task.priority === p ? PRIORITY_STYLE[p].bg + ' ' + PRIORITY_STYLE[p].color : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-light)] hover:border-[var(--border-2)]'
                      } disabled:cursor-not-allowed`}>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${p === 'HIGH' ? 'bg-red-500' : p === 'MEDIUM' ? 'bg-orange-400' : 'bg-[#2d9e63]'}`} />
                      {PRIORITY_STYLE[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Planning</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-[var(--muted-light)] block mb-0.5">Début</label>
                    <input type="date" disabled={!editable || saving}
                      value={task.startDate ? task.startDate.split('T')[0] : ''}
                      onChange={(e) => patch({ startDate: e.target.value || null } as Partial<Task>)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[#2d9e63] disabled:opacity-60 disabled:cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted-light)] block mb-0.5">Échéance</label>
                    <input type="date" disabled={!editable || saving}
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => patch({ dueDate: e.target.value || null } as Partial<Task>)}
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d9e63] disabled:opacity-60 disabled:cursor-not-allowed ${
                        task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]'
                      }`} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted-light)] block mb-0.5">Durée (jours)</label>
                    <input type="number" min="1" disabled={!editable || saving}
                      value={task.duration ?? ''}
                      onChange={(e) => patch({ duration: e.target.value ? parseInt(e.target.value) : null } as Partial<Task>)}
                      placeholder="—"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[#2d9e63] disabled:opacity-60 disabled:cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* Delete */}
              {deletable && (
                <button onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors mt-2">
                  <Trash2 size={12} />
                  Supprimer la tâche
                </button>
              )}

              {!editable && (
                <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--muted)] text-center flex items-center justify-center gap-1.5">
                  <Eye size={12} /> Mode lecture seule
                </div>
              )}
            </div>
          </div>
        </div>

        {saving && (
          <div className="absolute top-4 right-14 flex items-center gap-1.5 text-xs text-[var(--muted-light)]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2d9e63] border-t-transparent" />
            Enregistrement...
          </div>
        )}
      </div>
    </div>
  );
}
