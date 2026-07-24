'use client';
import { useMemo } from 'react';
import MermaidChart from './MermaidChart';
import { computeCPM } from '@/lib/cpm';
import { Link } from 'lucide-react';
import type { Task } from '@/lib/types';

function sanitize(s: string) {
  return s.replace(/["\[\](){}|]/g, '').trim().slice(0, 30) || 'Tâche';
}

export default function PertView({ tasks }: { tasks: Task[] }) {
  const cpmNodes = useMemo(() => computeCPM(tasks), [tasks]);
  const cpmMap = useMemo(() => new Map(cpmNodes.map((n) => [n.id, n])), [cpmNodes]);

  const chart = useMemo(() => {
    if (tasks.length === 0) return '';

    const lines: string[] = ['flowchart LR'];

    // Node definitions
    for (const t of tasks) {
      const node = cpmMap.get(t.id);
      const dur = node?.duration ?? t.duration ?? 1;
      const es = node?.es ?? 0;
      const ef = node?.ef ?? dur;
      const slack = node?.slack ?? 0;
      const isCrit = node?.isCritical ?? false;
      const label = `${sanitize(t.title)}<br/>D:${dur}j | ES:${es} EF:${ef}<br/>Marge:${slack}j`;
      const shortId = `T${t.id.slice(0, 6)}`;

      if (isCrit) {
        lines.push(`  ${shortId}["${label}"]:::critical`);
      } else {
        lines.push(`  ${shortId}["${label}"]`);
      }
    }

    // Edges
    for (const t of tasks) {
      const shortId = `T${t.id.slice(0, 6)}`;
      for (const dep of t.dependencies ?? []) {
        const depShortId = `T${dep.id.slice(0, 6)}`;
        const fromNode = cpmMap.get(dep.id);
        const toNode = cpmMap.get(t.id);
        const isCritEdge = fromNode?.isCritical && toNode?.isCritical;
        if (isCritEdge) {
          lines.push(`  ${depShortId} -->|critique| ${shortId}`);
        } else {
          lines.push(`  ${depShortId} --> ${shortId}`);
        }
      }
    }

    lines.push('  classDef critical fill:#fee2e2,stroke:#ef4444,color:#991b1b,font-weight:bold');

    return lines.join('\n');
  }, [tasks, cpmMap]);

  if (!chart) {
    return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface)] py-16 text-center">
        <Link size={24} className="text-[var(--muted-light)] mb-3" />
        <p className="text-sm font-medium text-[var(--foreground)]">Aucune tâche disponible</p>
        <p className="text-xs text-[var(--muted-light)] mt-1">Ajoutez des tâches avec des dépendances pour générer le réseau PERT.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-light)]">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-200 border border-red-400 inline-block" /> Chemin critique (marge = 0)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-400 inline-block" /> Tâche normale</span>
        <span className="text-[var(--muted-light)]">D = Durée | ES = Début au plus tôt | EF = Fin au plus tôt</span>
      </div>

      {/* CPM Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs">
          <thead className="bg-[var(--surface-2)] text-[var(--foreground)]">
            <tr>
              {['Tâche', 'Durée', 'ES', 'EF', 'LS', 'LF', 'Marge', 'Critique'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {cpmNodes.map((n) => (
              <tr key={n.id} className={n.isCritical ? 'bg-red-50' : 'bg-[var(--background)]'}>
                <td className="px-3 py-2 font-medium text-[var(--foreground)] max-w-[150px] truncate">{n.title}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{n.duration}j</td>
                <td className="px-3 py-2 text-[var(--muted)]">{n.es}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{n.ef}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{n.ls}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{n.lf}</td>
                <td className="px-3 py-2 font-medium text-[var(--foreground)]">{n.slack}j</td>
                <td className="px-3 py-2">
                  {n.isCritical
                    ? <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 font-semibold">Oui</span>
                    : <span className="rounded-full bg-[var(--surface-2)] text-[var(--muted)] px-2 py-0.5">Non</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MermaidChart chart={chart} key={chart} />
    </div>
  );
}
