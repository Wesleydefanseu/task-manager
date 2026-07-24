'use client';
import { useMemo } from 'react';
import MermaidChart from './MermaidChart';
import { computeCPM } from '@/lib/cpm';
import { Calendar } from 'lucide-react';
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

function taskMermaidId(taskId: string) {
  return `t${taskId.replace(/-/g, '')}`;
}

function computeTaskOrder(taskList: Task[]): Map<string, number> {
  const order = new Map<string, number>();
  function getOrder(id: string): number {
    if (order.has(id)) return order.get(id)!;
    const t = taskList.find((x) => x.id === id);
    if (!t) { order.set(id, 0); return 0; }
    const depIds = (t.dependencies ?? []).map((d) => d.id);
    if (depIds.length === 0) { order.set(id, 0); return 0; }
    const maxDep = Math.max(...depIds.map((d) => getOrder(d))) + 1;
    order.set(id, maxDep);
    return maxDep;
  }
  for (const t of taskList) getOrder(t.id);
  return order;
}

export default function GanttView({ tasks }: { tasks: Task[] }) {
  const cpmNodes = useMemo(() => computeCPM(tasks), [tasks]);
  const criticalIds = new Set(cpmNodes.filter((n) => n.isCritical).map((n) => n.id));
  const taskOrder = useMemo(() => computeTaskOrder(tasks), [tasks]);

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
        const mid = taskMermaidId(t.id);
        const isCrit = criticalIds.has(t.id);
        const statusPrefix = isCrit ? 'crit' : t.status === 'DONE' ? 'done' : t.status === 'IN_PROGRESS' ? 'active' : '';
        const start = toDateStr(t.startDate);
        const end = toDateStr(t.dueDate);
        const dur = t.duration ? `${t.duration}d` : null;

        // Use Mermaid's "after" syntax and/or status + dates
        let line = `  ${name} :`;

        // Determine if we need "after" for tasks without startDate
        const depIds = (t.dependencies ?? []).map((d) => d.id);
        const needsAfter = !start && depIds.length > 0;
        const afterId = needsAfter ? taskMermaidId(depIds[0]) : null;

        // If we have start date, use it directly
        if (start && end) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${start}, ${end}`;
        } else if (start && dur) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${start}, ${dur}`;
        } else if (start) {
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${start}, 1d`;
        } else if (dur && afterId) {
          // Use "after" syntax — place after the first dependency
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `after ${afterId}, ${dur}`;
        } else if (dur) {
          // Duration only, no start date, no dep — NO status modifier to prevent Mermaid parsing error
          line += `${dur}`;
        } else if (end) {
          // Has dueDate but no startDate — show as milestone-ish
          if (statusPrefix) line += `${statusPrefix}, `;
          line += `${end}, 1d`;
        } else {
          line += '1d';
        }

        lines.push(line);
      }
    }

    return lines.join('\n');
  }, [tasks, criticalIds, taskOrder]);

  if (!chart) {
    return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface)] py-16 text-center">
        <Calendar size={24} className="text-[var(--muted-light)] mb-3" />
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

