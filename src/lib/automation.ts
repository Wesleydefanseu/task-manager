import type { Task, AutomationRule, TriggerType, ActionType } from './types';

export type AutomationEvent = {
  projectId: string;
  type: TriggerType;
  taskId: string;
  task: Task;
  previousStatus?: string;
};

/**
 * Evaluate all automation rules for a given project against an event.
 * Returns a list of actions that should be executed.
 */
export function evaluateRules(rules: AutomationRule[], event: AutomationEvent): { rule: AutomationRule; taskId: string }[] {
  const triggered: { rule: AutomationRule; taskId: string }[] = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    let matches = false;

    switch (rule.triggerType) {
      case 'STATUS_CHANGE':
        if (event.type === 'STATUS_CHANGE') {
          const targetStatus = rule.triggerValue;
          matches = event.task.status === targetStatus;
        }
        break;

      case 'DUE_DATE_NEAR':
        if (event.type === 'DUE_DATE_NEAR' || event.type === 'STATUS_CHANGE') {
          if (event.task.dueDate && event.task.status !== 'DONE') {
            const due = new Date(event.task.dueDate).getTime();
            const now = Date.now();
            const diffHours = (due - now) / (1000 * 60 * 60);
            const thresholdHours = parseInt(rule.triggerValue || '24', 10);
            if (diffHours <= thresholdHours && diffHours > 0) {
              matches = true;
            }
            if (diffHours < 0 && rule.triggerValue === 'OVERDUE') {
              matches = true;
            }
          }
        }
        break;

      case 'TASK_ASSIGNED':
        if (event.type === 'TASK_ASSIGNED') {
          const targetUserId = rule.triggerValue;
          if (!targetUserId) {
            matches = (event.task.assignees?.length ?? 0) > 0;
          } else {
            matches = event.task.assignees?.some((a) => a.id === targetUserId) ?? false;
          }
        }
        break;
    }

    if (matches) {
      triggered.push({ rule, taskId: event.taskId });
    }
  }

  return triggered;
}

/**
 * Apply a triggered rule's action to produce a mutation payload.
 */
export function applyAction(
  rule: AutomationRule,
  task: Task
): Partial<Task> | null {
  switch (rule.actionType) {
    case 'CHANGE_PRIORITY':
      if (rule.actionValue && ['LOW', 'MEDIUM', 'HIGH'].includes(rule.actionValue)) {
        return { priority: rule.actionValue as Task['priority'] };
      }
      return null;

    case 'CHANGE_STATUS':
      if (rule.actionValue && ['TODO', 'IN_PROGRESS', 'DONE'].includes(rule.actionValue)) {
        return { status: rule.actionValue as Task['status'] };
      }
      return null;

    case 'ASSIGN_USER':
      if (rule.actionValue) {
        return { __assignUserId: rule.actionValue } as any;
      }
      return null;

    case 'SEND_NOTIFICATION':
      if (rule.actionValue) {
        return { __notificationMessage: rule.actionValue } as any;
      }
      return null;

    default:
      return null;
  }
}

/**
 * Create default automation rules for a new project
 */
export function getDefaultRules(projectId: string): Omit<AutomationRule, 'id' | 'createdAt'>[] {
  return [
    {
      name: 'Baisser priorité quand terminé',
      triggerType: 'STATUS_CHANGE',
      triggerValue: 'DONE',
      actionType: 'CHANGE_PRIORITY',
      actionValue: 'LOW',
      projectId,
      isActive: true,
    },
    {
      name: 'Notifier quand une tâche approche de l\'échéance',
      triggerType: 'DUE_DATE_NEAR',
      triggerValue: '24',
      actionType: 'SEND_NOTIFICATION',
      actionValue: '🚨 La tâche approche de son échéance !',
      projectId,
      isActive: true,
    },
    {
      name: 'Passer en cours quand assigné',
      triggerType: 'TASK_ASSIGNED',
      triggerValue: null,
      actionType: 'CHANGE_STATUS',
      actionValue: 'IN_PROGRESS',
      projectId,
      isActive: false,
    },
  ];
}

