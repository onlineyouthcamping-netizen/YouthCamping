/**
 * Founder/Superadmin-only profit visibility (RBAC).
 *
 * Uses existing role semantics from permissions.js unrestricted tier
 * (superadmin / founder / owner / super_admin) — no email hardcoding,
 * no parallel permission system.
 */

const PROFIT_VIEW_ROLES = new Set([
  "superadmin",
  "super_admin",
  "founder",
  "owner",
]);

/** Explicit profit / margin / profitability field names to omit from API payloads. */
const PROFIT_FIELD_KEYS = new Set([
  "estimatedProfit",
  "actualProfit",
  "profitPerTrip",
  "profitPerPax",
  "grossProfit",
  "netProfit",
  "profitMargin",
  "profitMarginPercent",
  "profitability",
  "isProfitable",
  "blendedMargin",
  "marginPercent",
]);

/**
 * @param {object|string|null|undefined} userOrRole - req.user or role string
 * @returns {boolean}
 */
function canViewProfit(userOrRole) {
  if (!userOrRole) return false;

  if (typeof userOrRole === "string") {
    return PROFIT_VIEW_ROLES.has(userOrRole.toLowerCase().trim());
  }

  const role = String(userOrRole.role || "")
    .toLowerCase()
    .trim();
  if (PROFIT_VIEW_ROLES.has(role)) return true;
  if (userOrRole.isSuperuser === true) return true;
  return false;
}

/**
 * Deep-clone-ish omit of profit keys from plain objects/arrays.
 * Does not mutate the input.
 * @param {*} value
 * @returns {*}
 */
function stripProfitFields(value) {
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => stripProfitFields(item));
  }
  if (typeof value !== "object") return value;

  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (PROFIT_FIELD_KEYS.has(key)) continue;
    out[key] = stripProfitFields(child);
  }
  return out;
}

/**
 * Attach profit fields only when the viewer is allowed; otherwise omit them.
 * @param {object|null|undefined} user
 * @param {object} payload
 * @param {object} profitFields
 * @returns {object}
 */
function withProfitFields(user, payload, profitFields = {}) {
  if (canViewProfit(user)) {
    return { ...payload, ...profitFields };
  }
  return { ...payload };
}

module.exports = {
  canViewProfit,
  stripProfitFields,
  withProfitFields,
  PROFIT_FIELD_KEYS,
  PROFIT_VIEW_ROLES,
};
