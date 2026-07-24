'use client';
import { useState, FormEvent } from 'react';
import type { ProjectMember, MemberRole } from '@/lib/types';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-[#d8f3e3] text-[#1e4d38] text-xs font-bold flex items-center justify-center ring-2 ring-[#b2e8c8] shrink-0">
      {initials}
    </div>
  );
}

const ROLE_STYLE: Record<string, string> = {
  ADMIN:  'bg-purple-50 text-purple-700 border-purple-200',
  MEMBER: 'bg-[#f0faf4] text-[#1e4d38] border-[#b2e8c8]',
};

export default function MembersPanel({ projectId, members, myRole, onUpdate }: {
  projectId: string;
  members: ProjectMember[];
  myRole: MemberRole | undefined;
  onUpdate: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = myRole === 'ADMIN';

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setEmail('');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally { setLoading(false); }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role: newRole }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Erreur'); return; }
    onUpdate();
  }

  async function handleRemove(memberId: string, name: string) {
    if (!confirm(`Retirer ${name} du projet ?`)) return;
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Erreur'); return; }
    onUpdate();
  }

  return (
    <div className="max-w-xl space-y-3">
      <p className="section-label mb-4">Membres de l'équipe ({members.length})</p>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {/* Members list */}
      {members.map((m) => (
        <div key={m.id} className="card flex items-center gap-3 px-4 py-3">
          <Avatar name={m.user.name} />
          <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[var(--foreground)] truncate">{m.user.name}</p>
          <p className="text-xs text-[var(--muted-light)] truncate">{m.user.email}</p>
          </div>

          {isAdmin ? (
            <select
              value={m.role}
              onChange={(e) => handleRoleChange(m.id, e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[#2d9e63]"
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Membre</option>
            </select>
          ) : (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[m.role]}`}>
              {m.role === 'ADMIN' ? 'Admin' : 'Membre'}
            </span>
          )}

          {isAdmin && (
            <button onClick={() => handleRemove(m.id, m.user.name)}
              className="text-[var(--border-2)] hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50" title="Retirer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      ))}

      {/* Permissions legend */}
<div className="card p-4 bg-[var(--surface)]">
      <p className="text-xs font-semibold text-[var(--muted)] mb-2">Permissions</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLE.ADMIN}`}>Admin</span>
            <span className="text-xs text-[var(--muted-light)]">Gestion complète du projet et des membres</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLE.MEMBER}`}>Membre</span>
            <span className="text-xs text-[var(--muted-light)]">Peut créer et modifier les tâches</span>
          </div>
        </div>
      </div>

      {/* Invite form — ADMIN only */}
      {isAdmin && (
    <div className="card p-5 border-dashed border-[var(--border-2)]">
      <p className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Inviter un membre
          </p>
          <form onSubmit={handleInvite} className="space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com" className="input-field" />
            <div className="flex gap-2">
              <select value={role} onChange={(e) => setRole(e.target.value as MemberRole)} className="input-field flex-1">
                <option value="MEMBER">Membre — peut modifier les tâches</option>
                <option value="ADMIN">Admin — gestion complète</option>
              </select>
              <button type="submit" disabled={loading} className="btn-primary shrink-0">
                {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Inviter'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
