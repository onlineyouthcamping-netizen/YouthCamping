const { prisma } = require("../lib/prisma");
const { logAction } = require("./auditLogger");

/** AdminRole enum values that exist on the Admin model (schema source of truth). */
const VALID_ADMIN_ROLES = new Set([
  "superadmin",
  "admin",
  "sales",
  "operations",
  "finance",
  "finance_controller",
  "FINANCE_CONTROLLER",
  "guide",
  "viewer",
  "BOOKING_VERIFIER",
]);

/**
 * Map legacy / module-oriented role aliases to canonical AdminRole values.
 */
function normalizeRole(role) {
  if (!role || typeof role !== "string") return null;
  const key = role.trim();
  const lower = key.toLowerCase();
  const aliases = {
    sales_manager: "sales",
    sales_executive: "sales",
    finance_manager: "finance",
    financecontroller: "finance_controller",
    ops_manager: "operations",
    ops: "operations",
  };
  if (aliases[lower]) return aliases[lower];
  if (VALID_ADMIN_ROLES.has(key)) return key;
  if (VALID_ADMIN_ROLES.has(lower)) return lower;
  return null;
}

function uniqueValidRoles(roles) {
  const out = new Set();
  for (const r of roles) {
    const normalized = normalizeRole(r);
    if (normalized) out.add(normalized);
  }
  return Array.from(out);
}

/**
 * Resolves recipients for a notification based on the module and roles.
 * Recipients are Admin staff — Notification.userId FKs to Admin, not User.
 */
async function resolveRecipients(
  tenantId,
  moduleName,
  entityType,
  entityId,
  explicitRoles = [],
  explicitUsers = [],
  assigneeId = null,
) {
  try {
    const recipients = new Set(explicitUsers);

    // If there is an assignee, they always get it
    if (assigneeId) {
      recipients.add(assigneeId);
    }

    // Admins and Superadmins always receive notifications for critical things, or we can filter based on module
    let targetRoles = ["superadmin"];

    switch ((moduleName || "").toLowerCase()) {
      case "sales":
      case "bookings":
      case "inquiries":
      case "quotations":
        targetRoles.push("sales", "admin");
        break;
      case "finance":
      case "accounting":
      case "payments":
        targetRoles.push(
          "finance",
          "finance_controller",
          "FINANCE_CONTROLLER",
          "admin",
        );
        break;
      case "operations":
      case "ops":
      case "trips":
      case "departures":
        targetRoles.push("operations", "admin");
        break;
      case "marketing":
        targetRoles.push("admin");
        break;
      case "hr":
      case "people":
        targetRoles.push("admin");
        break;
      default:
        targetRoles.push("admin");
        break;
    }

    // Add any explicit roles (normalized to AdminRole)
    if (explicitRoles && explicitRoles.length > 0) {
      targetRoles.push(...explicitRoles);
    }

    const roles = uniqueValidRoles(targetRoles);
    if (roles.length === 0) {
      return Array.from(recipients);
    }

    // Staff notifications live on Admin (has tenantId, isActive, role).
    // Do NOT query User — User has neither isActive nor Notification FK.
    const admins = await prisma.admin.findMany({
      where: {
        tenantId,
        isActive: true,
        role: { in: roles },
      },
      select: { id: true },
    });

    admins.forEach((a) => recipients.add(a.id));

    return Array.from(recipients);
  } catch (error) {
    console.error("Error resolving recipients:", error);
    return Array.from(new Set(explicitUsers || [])); // Fallback — never break caller
  }
}

/**
 * Central event publisher.
 * Dispatches business events to the Activity Timeline, Notifications, and Audit Logs.
 * Failures are logged and swallowed so booking/ticket primary flows are not aborted.
 */
async function publishEvent(eventType, context) {
  const {
    tenantId = "default",
    actorUserId,
    actorName,
    entityType,
    entityId,
    title,
    description,
    metadata,
    audit,
    notify = false,
    moduleName = "System",
    priority = "Low",
    actionUrl = null,
    notifyRoles = [],
    notifyUsers = [],
    assigneeId = null,
  } = context;

  try {
    // 1. Audit Logging (if audit payload provided)
    // Run this first to ensure data changes are securely logged even if notifications fail
    if (audit) {
      await logAction({
        tenantId,
        actorUserId,
        action: audit.action || eventType,
        entityType,
        entityId,
        beforeData: audit.beforeData,
        afterData: audit.afterData,
      });
    }

    // 2. Create Activity Event (Timeline / Audit)
    if (entityType && entityId) {
      if (prisma.activityEvent) {
        await prisma.activityEvent.create({
          data: {
            tenantId,
            entityType,
            entityId,
            eventType,
            title,
            description,
            actorUserId,
            actorName,
            metadata: metadata || null,
            relatedId: context.relatedId || null,
            relatedType: context.relatedType || null,
          },
        });
      } else {
        // Fallback to audit log if activityEvent model is not defined in Prisma schema
        await prisma.auditLog.create({
          data: {
            tenantId,
            actorUserId: actorUserId || null,
            action: eventType,
            entityType,
            entityId,
            changeSummary: title ? `${title}: ${description || ""}` : description,
            afterData: metadata || null,
            changedBy: actorName || null,
          },
        });
      }
    }

    // 3. Notifications
    if (notify && prisma.notification) {
      const recipientIds = await resolveRecipients(
        tenantId,
        moduleName,
        entityType,
        entityId,
        notifyRoles,
        notifyUsers,
        assigneeId,
      );

      if (recipientIds.length > 0) {
        // Prevent duplicate exact notifications in a short timeframe (debounce)
        const recentTime = new Date(Date.now() - 5 * 60 * 1000); // 5 mins

        for (const rId of recipientIds) {
          // Don't notify the actor of their own actions
          if (rId === actorUserId) continue;

          // Deduplication check
          const existing = await prisma.notification.findFirst({
            where: {
              userId: rId,
              title,
              createdAt: { gt: recentTime },
            },
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                tenantId,
                userId: rId,
                title,
                message: description || title,
                link: actionUrl || null,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn(
      `⚠️ [EventBus] Error publishing event ${eventType}:`,
      error.message,
    );
  }
}

module.exports = {
  publishEvent,
  resolveRecipients,
};
