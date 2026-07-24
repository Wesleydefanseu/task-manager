'use client';
import { useEffect, useState, useMemo, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Zap, AlertTriangle, X } from 'lucide-react';
import Modal from '@/components/Modal';
import KanbanColumn from '@/components/KanbanColumn';
import GanttView from '@/components/GanttView';
import PertView from '@/components/PertView';
import MembersPanel from '@/components/MembersPanel';
import TaskDetailModal from '@/components/TaskDetailModal';
import AutomationPanel from '@/components/AutomationPanel';
import type { Project, Task, TaskStatus, TaskPriority, ProjectMember, MemberRole, AutomationRule } from '@/lib/types';
import { canEdit, canManageMembers } from '@/lib/types';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO',        title: 'À faire' },
  { status: 'IN_PROGRESS', title: 'En cours' },
  { status: 'DONE',        title: 'Terminé' },
];

type Tab = 'kanban' | 'gantt' | 'pert' | 'members' | 'automation';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [myRole, setMyRole] = useState<MemberRole | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('kanban');

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');

  // Modal nouvelle tâche
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState('');
  const [dependencyIds, setDependencyIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal détail tâche (style Trello)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [pRes, tRes, ruleRes, notifRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch(`/api/automation?projectId=${projectId}`),
        fetch('/api/notifications?unreadOnly=true'),
      ]);
      if (!pRes.ok) throw new Error('Projet introuvable ou accès refusé.');
      if (!tRes.ok) throw new Error('Impossible de charger les tâches.');
      const pData = await pRes.json();
      setProject(pData);
      setMembers(pData.members ?? []);
      setMyRole(pData.myRole as MemberRole);
      setTasks(await tRes.json());
      if (ruleRes.ok) setRules(await ruleRes.json());
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setUnreadNotifs(notifs.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally { setLoading(false); }
  }

  useEffect(() => { if (projectId) loadData(); }, [projectId]);

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    if (!canEdit(myRole)) return;
    const prev = tasks;
    setTasks((t) => t.map((x) => x.id === taskId ? { ...x, status: newStatus } : x));
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch { setTasks(prev); setError('Impossible de mettre à jour le statut.'); }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) { setFormError('Le titre est requis.'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, status, projectId, assigneeIds, startDate: startDate || null, dueDate: dueDate || null, duration: duration ? parseInt(duration) : null, dependencyIds }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Erreur'); }
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setStatus('TODO');
      setAssigneeIds([]); setStartDate(''); setDueDate(''); setDuration(''); setDependencyIds([]);
      setModalOpen(false);
      await loadData();
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setCreating(false); }
  }

  function handleTaskUpdate(updated: Task) {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    if (selectedTask?.id === updated.id) setSelectedTask(updated);
  }

  function handleTaskDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTask(null);
  }

  const done = tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const overdue = tasks.filter((t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const filteredTasks = useMemo(() => tasks.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'ALL' && !t.assignees?.some((a) => a.id === filterAssignee)) return false;
    return true;
  }), [tasks, filterPriority, filterAssignee]);

  const allMembers = useMemo(() => {
    return members.map((m) => m.user);
  }, [members]);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'kanban',  label: 'Kanban' },
    { key: 'gantt',   label: 'Gantt' },
    { key: 'pert',    label: 'PERT / CPM' },
    { key: 'members', label: `Équipe (${members.length})` },
    { key: 'automation', label: `Auto` },
  ];

  if (loading) return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-[14px] bg-[var(--border)]" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-96 animate-pulse rounded-[14px] bg-[var(--border)]" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <button onClick={() => router.push('/dashboard')}
              className="mt-0.5 text-[var(--muted-light)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--surface-2)]">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--foreground)]">{project?.name ?? 'Projet'}</h1>
                {myRole && (
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    myRole === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-[#f0faf4] text-[#1e4d38] border-[#b2e8c8]'
                  }`}>
                    {myRole === 'ADMIN' ? 'Admin' : 'Membre'}
                  </span>
                )}
              </div>
              {project?.description && <p className="text-sm text-[var(--muted)] mt-0.5">{project.description}</p>}
            </div>
          </div>
          {canEdit(myRole) && (
            <button onClick={() => setModalOpen(true)} className="btn-primary shrink-0">
              <Plus size={13} />
              Ajouter une tâche
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full rounded-full bg-[#2d9e63] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-bold text-[#2d9e63] w-10 text-right">{progress}%</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="badge-green">{done} terminées</span>
            {inProgress > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 font-medium">{inProgress} en cours</span>}
            {overdue > 0 && <span className="badge-red flex items-center gap-1"><AlertTriangle size={10} /> {overdue} en retard</span>}
            <span className="text-[var(--muted-light)]">{tasks.length} tâches</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tabs + Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-[var(--surface-2)] rounded-xl p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === t.key ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab !== 'members' && (
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[#2d9e63]">
              <option value="ALL">Toutes priorités</option>
              <option value="HIGH">Haute</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LOW">Basse</option>
            </select>
            <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[#2d9e63]">
              <option value="ALL">Tous les membres</option>
              {allMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {(filterPriority !== 'ALL' || filterAssignee !== 'ALL') && (
              <button onClick={() => { setFilterPriority('ALL'); setFilterAssignee('ALL'); }}
                className="btn-ghost text-xs px-3 py-1.5 border border-[var(--border)] rounded-lg"><X size={12} /> Réinitialiser</button>
            )}
          </div>
        )}
      </div>

      {/* Tab content */}
      {tab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.status} title={col.title} status={col.status} myRole={myRole}
              tasks={filteredTasks.filter((t) => t.status === col.status)}
              onStatusChange={handleStatusChange}
              onTaskClick={setSelectedTask} />
          ))}
        </div>
      )}
      {tab === 'gantt' && <GanttView tasks={filteredTasks} />}
      {tab === 'pert' && <PertView tasks={filteredTasks} />}
      {tab === 'members' && project && (
        <MembersPanel projectId={projectId} members={members} myRole={myRole}
          onUpdate={loadData} />
      )}
      {tab === 'automation' && (
        <AutomationPanel projectId={projectId} rules={rules} myRole={myRole} />
      )}

      {/* Modal nouvelle tâche */}
      {canEdit(myRole) && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle tâche">
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Titre <span className="text-red-500">*</span></label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Créer la page d'accueil" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                placeholder="Détails..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Priorité</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="input-field">
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Statut</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="input-field">
                  <option value="TODO">À faire</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Terminé</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Assignés</label>
              <div className="max-h-28 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 space-y-1.5">
                {allMembers.map((m) => (
                  <label key={m.id} className="flex items-center gap-2.5 text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)]">
                    <input type="checkbox" checked={assigneeIds.includes(m.id)}
                      onChange={(e) => setAssigneeIds(e.target.checked ? [...assigneeIds, m.id] : assigneeIds.filter((id) => id !== m.id))}
                      className="accent-[#2d9e63] h-3.5 w-3.5" />
                    <span>{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Début</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Échéance</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Durée (j)</label>
                <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1" className="input-field" />
              </div>
            </div>
            {tasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Dépendances</label>
                <div className="max-h-28 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 space-y-1.5">
                  {tasks.map((t) => (
                    <label key={t.id} className="flex items-center gap-2.5 text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)]">
                      <input type="checkbox" checked={dependencyIds.includes(t.id)}
                        onChange={(e) => setDependencyIds(e.target.checked ? [...dependencyIds, t.id] : dependencyIds.filter((id) => id !== t.id))}
                        className="accent-[#2d9e63] h-3.5 w-3.5" />
                      <span className="line-clamp-1">{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {creating ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal détail tâche style Trello */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={tasks}
          members={allMembers}
          myRole={myRole}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
