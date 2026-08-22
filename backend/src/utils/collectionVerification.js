const { isProtectedSuperadminIdentity } = require("../config/superadmin");

const TERMINAL_APPROVED = "APPROVED_FOUNDER";

const FOUNDER_ROLES = new Set(["superadmin", "super_admin", "founder"]);
const FINANCE_CONTROLLER_ROLES = new Set(["finance_controller"]);

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function isCollectionVerified(approvalStatus) {
  return normalizeStatus(approvalStatus) === TERMINAL_APPROVED;
}

function isCollectionRejected(approvalStatus, status) {
  return (
    normalizeStatus(approvalStatus) === "REJECTED" ||
    normalizeStatus(status) === "REJECTED"
  );
}

/**
 * Authoritative display status for a customer collection.
 * A collection is VERIFIED only after the single Founder/FC approval step.
 * OpsClientPayment.status ("Verified") alone is not enough.
 */
function canonicalCollectionStatus(approvalStatus, status) {
  if (isCollectionVerified(approvalStatus)) return "VERIFIED";
  if (isCollectionRejected(approvalStatus, status)) return "REJECTED";
  if (approvalStatus) return "PENDING";
  const normalized = normalizeStatus(status);
  if (normalized === "APPROVED" || normalized === "VERIFIED" || normalized === "COMPLETED") {
    return "VERIFIED";
  }
  return "PENDING";
}

function isCollectionPending(approvalStatus, status) {
  return canonicalCollectionStatus(approvalStatus, status) === "PENDING";
}

function isFounderIdentity(user) {
  if (!user) return false;
  const role = String(user.role || "")
    .toLowerCase()
    .trim();
  if (FOUNDER_ROLES.has(role)) return true;
  return isProtectedSuperadminIdentity({
    email: user.email,
    name: user.name,
  });
}

function isFinanceControllerIdentity(user) {
  if (!user) return false;
  const role = String(user.role || "")
    .toLowerCase()
    .trim();
  return FINANCE_CONTROLLER_ROLES.has(role);
}

/**
 * Strict incoming-collection verification.
 * Only Founder (superadmin / founder / protected founder identity)
 * or Finance Controller may verify. Permissions and custom roles do not grant this.
 */
function canCompleteCollectionVerification(user) {
  return isFounderIdentity(user) || isFinanceControllerIdentity(user);
}

function requireCollectionVerifier(req, res, next) {
  const user = req.user || req.admin;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthenticated",
    });
  }
  if (!canCompleteCollectionVerification(user)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: only Founder or Finance Controller can verify collections",
    });
  }
  return next();
}

function denyCollectionVerification(res) {
  return res.status(403).json({
    success: false,
    message: "Forbidden: only Founder or Finance Controller can verify collections",
  });
}

/**
 * An accounting entry is an incoming customer collection when it resolves
 * to a tenant booking. Those entries must not settle financially except via
 * Founder / Finance Controller verification.
 */
function isIncomingCustomerCollection(entry, booking) {
  return Boolean(entry && booking);
}

module.exports = {
  TERMINAL_APPROVED,
  FOUNDER_ROLES,
  FINANCE_CONTROLLER_ROLES,
  isCollectionVerified,
  isCollectionRejected,
  isCollectionPending,
  canonicalCollectionStatus,
  isFounderIdentity,
  isFinanceControllerIdentity,
  canCompleteCollectionVerification,
  requireCollectionVerifier,
  denyCollectionVerification,
  isIncomingCustomerCollection,
};
