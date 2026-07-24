'use client';
import { useMemo } from 'react';
import MermaidChart from './MermaidChart';
import { computeCPM } from '@/lib/cpm';
import type { Task } from '@/lib/types';

function sanitize(s: string) {
  return s.replace(/[:#,]/g, ' ').trim() || 'Tâche';
}

function toDateStr(d: string | null | undefined): string {
  if (!d) return '';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export default function GanttView({ tasks }: { tasks: Task[] }) {
  const cpmNodes = useMemo(() => computeCPM(tasks), [tasks]);
  const criticalIds = new Set(cpmNodes.filter((n) => n.isCritical).map((n) => n.id));

  const chart = useMemo(() => {
    const tasksWithDates = tasks.filter((t) => t.startDate || t.dueDate || t.duration);
    if (tasksWithDates.length === 0) return '';

    const lines: string[] = ['gantt', '  title Planning du projet', '  dateFormat YYYY-MM-DD', '  axisFormat %d/%m'];

    const groups: Record<string, Task[]> = { 'À faire': [], 'En cours': [], 'Terminé': [] };
    for (const t of tasksWithDates) {
      if (t.status === 'TODO') groups['À faire'].push(t);
      else if (t.status === 'IN_PROGRESS') groups['En cours'].push(t);
      else groups['Terminé'].push(t);
    }

    for (const [section, sectionTasks] of Object.entries(groups)) {
      if (sectionTasks.length === 0) continue;
      lines.push(`  section ${section}`);
      for (const t of sectionTasks) {
        const name = sanitize(t.title);
        const isCrit = criticalIds.has(t.id);
        const statusPrefix = isCrit ? 'crit' : t.status === 'DONE' ? 'done' : t.status === 'IN_PROGRESS' ? 'active' : '';
        const start = toDateStr(t.startDate);
        const end = toDateStr(t.dueDate);
        const dur = t.duration ? `${t.duration}d` : null;

        // Mermaid Gantt: no IDs → task_name : [status,] start_date, end_date
        let line = `  ${name} :`;

        if (start && end) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${start}, ${end}`;
        } else if (start && dur) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${start}, ${dur}`;
        } else if (start) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${start}, 1d`;
        } else if (dur) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${dur}`;
        } else {
          line += '1d';
        }

        lines.push(line);
      }
    }

    return lines.join('\n');
  }, [tasks, criticalIds]);

  if (!chart) {
    return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface)] py-16 text-center">
        <div className="text-3xl mb-3">📅</div>
        <p className="text-sm font-medium text-[var(--foreground)]">Aucune tâche avec des dates</p>
        <p className="text-xs text-[var(--muted-light)] mt-1">Ajoutez des dates de début/fin ou une durée aux tâches pour générer le Gantt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-[var(--muted-light)]">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-300 inline-block" /> Chemin critique</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[var(--primary)] inline-block" /> En cours</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[var(--border-2)] inline-block" /> Terminé</span>
      </div>
      <MermaidChart chart={chart} key={chart} />
    </div>
  );
}
