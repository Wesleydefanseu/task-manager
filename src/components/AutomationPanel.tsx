'use client';
import { useEffect, useState } from 'react';
import type { AutomationRule, MemberRole } from '@/lib/types';
import { canManageMembers } from '@/lib/types';

const TRIGGER_LABELS: Record<string, string> = {
  STATUS_CHANGE: 'Changement de statut',
  DUE_DATE_NEAR: 'Échéance proche',
  TASK_ASSIGNED: 'Assignation de tâche',
};

const ACTION_LABELS: Record<string, string> = {
  CHANGE_PRIORITY: 'Changer priorité',
  CHANGE_STATUS: 'Changer statut',
  ASSIGN_USER: 'Assigner un membre',
  SEND_NOTIFICATION: 'Envoyer notification',
};

const TRIGGER_VALUE_LABELS: Record<string, { label: string; options?: { value: string; label: string }[] }> = {
  STATUS_CHANGE: {
    label: 'Quand le statut devient',
    options: [
      { value: 'TODO', label: 'À faire' },
      { value: 'IN_PROGRESS', label: 'En cours' },
      { value: 'DONE', label: 'Terminé' },
    ],
  },
  DUE_DATE_NEAR: {
    label: 'Seuil (heures)',
    options: [
      { value: '0', label: 'Immédiatement' },
      { value: '1', label: '1 heure' },
      { value: '24', label: '24 heures' },
      { value: '48', label: '48 heures' },
      { value: '72', label: '72 heures' },
      { value: 'OVERDUE', label: 'En retard' },
    ],
  },
  TASK_ASSIGNED: {
    label: 'Quand un membre est assigné',
  },
};

const ACTION_VALUE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  CHANGE_PRIORITY: [
    { value: 'LOW', label: 'Basse' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH', label: 'Haute' },
  ],
  CHANGE_STATUS: [
    { value: 'TODO', label: 'À faire' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'DONE', label: 'Terminé' },
  ],
  ASSIGN_USER: [],
  SEND_NOTIFICATION: [],
};

export default function AutomationPanel({
  projectId,
  rules: initialRules,
  myRole,
}: {
  projectId: string;
  rules: AutomationRule[];
  myRole: MemberRole | undefined;
}) {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New rule form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<string>('STATUS_CHANGE');
  const [triggerValue, setTriggerValue] = useState('');
  const [actionType, setActionType] = useState<string>('CHANGE_PRIORITY');
  const [actionValue, setActionValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = canManageMembers(myRole);

  useEffect(() => {
    setRules(initialRules);
  }, [initialRules]);

  async function loadRules() {
    setLoading(true);
    try {
      const res = await fetch(`/api/automation?projectId=${projectId}`);
      if (res.ok) setRules(await res.json());
    } catch {
      setError('Erreur lors du chargement des règles');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError('Le nom est requis.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, triggerType, triggerValue: triggerValue || null,
          actionType, actionValue: actionValue || null, projectId,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Erreur'); }
      setName(''); setTriggerType('STATUS_CHANGE'); setTriggerValue('');
      setActionType('CHANGE_PRIORITY'); setActionValue(''); setShowForm(false);
      await loadRules();
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setSaving(false); }
  }

  async function handleToggle(rule: AutomationRule) {
    try {
      const res = await fetch('/api/automation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      if (res.ok) await loadRules();
    } catch { setError('Erreur lors de la mise à jour'); }
  }

  async function handleDelete(ruleId: string) {
    if (!confirm('Supprimer cette règle ?')) return;
    try {
      const res = await fetch(`/api/automation?id=${ruleId}`, { method: 'DELETE' });
      if (res.ok) await loadRules();
    } catch { setError('Erreur lors de la suppression'); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">Règles d&apos;automatisation</h3>
          <p className="text-xs text-[var(--muted-light)] mt-0.5">
            Déclenchez des actions automatiquement lors d&apos;événements sur les tâches.
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {showForm ? 'Annuler' : 'Nouvelle règle'}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* New rule form */}
      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          {formError && <div className="text-sm text-red-600">{formError}</div>}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Nom de la règle</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Baisser priorité quand terminé" className="input-field text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Déclencheur</label>
              <select value={triggerType} onChange={(e) => { setTriggerType(e.target.value); setTriggerValue(''); }}
                className="input-field text-sm">
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                {TRIGGER_VALUE_LABELS[triggerType]?.label || 'Valeur'}
              </label>
              {TRIGGER_VALUE_LABELS[triggerType]?.options ? (
                <select value={triggerValue} onChange={(e) => setTriggerValue(e.target.value)}
                  className="input-field text-sm">
                  <option value="">—</option>
                  {TRIGGER_VALUE_LABELS[triggerType].options!.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={triggerValue} onChange={(e) => setTriggerValue(e.target.value)}
                  placeholder="Optionnel" className="input-field text-sm" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Action</label>
              <select value={actionType} onChange={(e) => { setActionType(e.target.value); setActionValue(''); }}
                className="input-field text-sm">
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Valeur</label>
              {ACTION_VALUE_OPTIONS[actionType]?.length ? (
                <select value={actionValue} onChange={(e) => setActionValue(e.target.value)}
                  className="input-field text-sm">
                  <option value="">—</option>
                  {ACTION_VALUE_OPTIONS[actionType].map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={actionValue} onChange={(e) => setActionValue(e.target.value)}
                  placeholder="Message ou userId" className="input-field text-sm" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary text-xs px-3 py-1.5">
              {saving ? 'Création...' : 'Créer la règle'}
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      {loading ? (
        <div className="text-sm text-[var(--muted-light)]">Chargement...</div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface)] py-12 text-center">
          <div className="text-3xl mb-3">⚡</div>
          <p className="text-sm font-medium text-[var(--foreground)]">Aucune règle d&apos;automatisation</p>
          <p className="text-xs text-[var(--muted-light)] mt-1">Créez des règles pour automatiser vos processus.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id}
              className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                rule.isActive
                  ? 'border-[var(--border)] bg-[var(--background)]'
                  : 'border-dashed border-[var(--border-2)] bg-[var(--surface)] opacity-60'
              }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{rule.name}</span>
                  {!rule.isActive && <span className="text-[10px] text-[var(--muted-light)]">(désactivée)</span>}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {TRIGGER_LABELS[rule.triggerType] || rule.triggerType}
                  {rule.triggerValue && ` → ${rule.triggerValue}`}
                  <span className="mx-1.5">➜</span>
                  {ACTION_LABELS[rule.actionType] || rule.actionType}
                  {rule.actionValue && ` → ${rule.actionValue}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isAdmin && (
                  <>
                    <button onClick={() => handleToggle(rule)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        rule.isActive ? 'bg-[#2d9e63]' : 'bg-[var(--border-2)]'
                      }`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                        rule.isActive ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`} />
                    </button>
                    <button onClick={() => handleDelete(rule.id)}
                      className="p-1.5 rounded-lg text-[var(--muted-light)] hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Supprimer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAdmin && (
        <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)] text-center">
          👁 Seuls les admins peuvent gérer les règles d&apos;automatisation.
        </div>
      )}
    </div>
  );
}

