export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type MemberRole = "ADMIN" | "MEMBER";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  duration: number | null;
  projectId: string;
  assignees?: { id: string; name: string; email: string }[];
  dependencies?: { id: string; title: string }[];
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: MemberRole;
  user: { id: string; name: string; email: string };
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  tasks?: Task[];
  members?: ProjectMember[];
  myRole?: MemberRole;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
}

export interface CpmNode {
  id: string;
  title: string;
  duration: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  slack: number;
  isCritical: boolean;
}

// Permissions : ADMIN peut tout faire, MEMBER peut créer/modifier les tâches
export function canEdit(role: MemberRole | undefined): boolean {
  return role === "ADMIN" || role === "MEMBER";
}

export function canManageMembers(role: MemberRole | undefined): boolean {
  return role === "ADMIN";
}

export function canDeleteTasks(role: MemberRole | undefined): boolean {
  return role === "ADMIN";
}

export function canDeleteProject(role: MemberRole | undefined): boolean {
  return role === "ADMIN";
}
