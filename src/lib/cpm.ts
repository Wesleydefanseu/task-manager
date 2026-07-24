import type { Task, CpmNode } from "./types";

export function computeCPM(tasks: Task[]): CpmNode[] {
  if (tasks.length === 0) return [];

  const nodeMap = new Map<string, CpmNode>();

  // Init nodes
  for (const t of tasks) {
    nodeMap.set(t.id, {
      id: t.id,
      title: t.title,
      duration: t.duration ?? 1,
      es: 0,
      ef: 0,
      ls: 0,
      lf: 0,
      slack: 0,
      isCritical: false,
    });
  }

  const depMap = new Map<string, string[]>(); // taskId -> list of predecessor ids
  for (const t of tasks) {
    depMap.set(t.id, (t.dependencies ?? []).map((d) => d.id));
  }

  // Topological sort (Kahn's algorithm)
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>(); // predecessor -> successors

  for (const t of tasks) {
    if (!inDegree.has(t.id)) inDegree.set(t.id, 0);
    if (!adjList.has(t.id)) adjList.set(t.id, []);
  }

  for (const t of tasks) {
    for (const depId of depMap.get(t.id) ?? []) {
      adjList.get(depId)?.push(t.id);
      inDegree.set(t.id, (inDegree.get(t.id) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const topoOrder: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    topoOrder.push(cur);
    for (const succ of adjList.get(cur) ?? []) {
      const newDeg = (inDegree.get(succ) ?? 1) - 1;
      inDegree.set(succ, newDeg);
      if (newDeg === 0) queue.push(succ);
    }
  }

  // Forward pass (ES / EF)
  for (const id of topoOrder) {
    const node = nodeMap.get(id)!;
    const preds = depMap.get(id) ?? [];
    node.es = preds.length === 0 ? 0 : Math.max(...preds.map((p) => nodeMap.get(p)?.ef ?? 0));
    node.ef = node.es + node.duration;
  }

  // Project duration
  const projectEnd = Math.max(...Array.from(nodeMap.values()).map((n) => n.ef));

  // Backward pass (LS / LF)
  for (const id of [...topoOrder].reverse()) {
    const node = nodeMap.get(id)!;
    const succs = adjList.get(id) ?? [];
    node.lf = succs.length === 0 ? projectEnd : Math.min(...succs.map((s) => nodeMap.get(s)?.ls ?? projectEnd));
    node.ls = node.lf - node.duration;
    node.slack = node.ls - node.es;
    node.isCritical = node.slack === 0;
  }

  return Array.from(nodeMap.values());
}
