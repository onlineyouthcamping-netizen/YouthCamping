const { hasPermission } = require("../config/permissions");

/**
 * Managers/founders with tasks.view_all may list any assignee (or ALL).
 * Everyone else is forced to their own assigned tasks.
 */
function canViewAllTasks(user) {
  return hasPermission(user, "tasks.view_all");
}

/**
 * Resolve assignedToId for task list queries.
 * Returns a concrete admin id for non-privileged users (ignores client ALL).
 * Returns undefined for privileged users when no/ALL filter (no assignee constraint).
 */
function resolveTaskAssigneeScope(user, requestedAssignee) {
  if (!canViewAllTasks(user)) {
    return user?.id || null;
  }
  if (requestedAssignee && requestedAssignee !== "ALL") {
    return requestedAssignee;
  }
  return undefined;
}

/**
 * Whether the user may mutate/view a specific task row.
 */
function canAccessAssignedTask(user, task) {
  if (!task) return false;
  if (canViewAllTasks(user)) return true;
  return Boolean(user?.id && task.assignedToId === user.id);
}

module.exports = {
  canViewAllTasks,
  resolveTaskAssigneeScope,
  canAccessAssignedTask,
};
