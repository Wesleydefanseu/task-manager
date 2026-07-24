'use client';
import { useEffect, useState, FormEvent } from 'react';
import Modal from '@/components/Modal';
import ProjectCard from '@/components/ProjectCard';
import type { Project, MemberRole } from '@/lib/types';
import {RotateCcw, User } from 'lucide-react';

type ProjectWithRole = Project & { myRole: MemberRole };

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadProjects(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError('Le nom du projet est requis.'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Erreur'); }
      setName(''); setDescription(''); setModalOpen(false);
      await loadProjects();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally { setCreating(false); }
  }

  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length ?? 0), 0);
  const doneTasks = projects.reduce((acc, p) => acc + (p.tasks?.filter((t) => t.status === 'DONE').length ?? 0), 0);
  const adminCount = projects.filter((p) => p.myRole === 'ADMIN').length;
  const memberCount = projects.filter((p) => p.myRole === 'MEMBER').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tableau de bord</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Gérez vos projets et suivez l'avancement</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau projet
        </button>
      </div>

      {/* Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Projets', value: projects.length, icon: '📁', sub: `${adminCount} admin · ${memberCount} membre${memberCount !== 1 ? 's' : ''}` },
            { label: 'Tâches totales', value: totalTasks, icon: '📋', sub: 'sur tous les projets' },
            { label: 'Terminées', value: doneTasks, icon: '✅', sub: totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}% d'avancement` : '—' },
            { label: 'En cours', value: projects.reduce((acc, p) => acc + (p.tasks?.filter((t) => t.status === 'IN_PROGRESS').length ?? 0), 0), icon: '⚡', sub: 'tâches actives' },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-xs text-[var(--muted-light)]">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-[14px] bg-[var(--border)]" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[var(--border-2)] bg-[var(--background)] py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-2xl mb-4">📋</div>
          <h3 className="font-semibold text-[var(--foreground)] mb-1">Aucun projet pour le moment</h3>
          <p className="text-sm text-[var(--muted)] mb-6 max-w-xs">Créez votre premier projet ou attendez qu'un collègue vous invite.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              myRole={project.myRole}
              onDelete={project.myRole === 'ADMIN' ? async (id) => {
                try {
                  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error('Impossible de supprimer');
                  await loadProjects();
                } catch (err) { setError(err instanceof Error ? err.message : 'Erreur'); }
              } : undefined}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau projet">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nom du projet</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Refonte du site vitrine" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description <span className="text-[var(--muted-light)] font-normal">(optionnel)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les objectifs du projet..." rows={3} className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {creating ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
