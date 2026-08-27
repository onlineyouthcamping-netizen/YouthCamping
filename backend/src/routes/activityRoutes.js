const express = require("express");
const router = express.Router();
const {
  optionalAuthenticate,
  authenticate,
  requirePermission,
} = require("../middleware/auth");
const activityController = require("../controllers/activityMasterController");

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTERPRISE ACTIVITY MASTER DIRECTORY ROUTES
 * Reads stay optionally authenticated. Every mutation requires a session
 * plus ops.manage (or aliased operations.edit).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const mutateActivity = [authenticate, requirePermission("ops.manage")];

router.use(optionalAuthenticate);

// --- 0. Analytics KPI Dashboard ---
router.get("/analytics/kpis", activityController.getActivityAnalyticsKPIs);

// --- 1. Master Activity Directory (0-Coupled) ---
router.get("/", activityController.listActivityMasters);
router.get(
  "/:id/vendors-comparison",
  activityController.getActivityVendorComparison,
);
router.get("/:id", activityController.getActivityMasterById);
router.post("/", ...mutateActivity, activityController.createActivityMaster);
router.put("/:id", ...mutateActivity, activityController.updateActivityMaster);
router.post(
  "/:id/documents",
  ...mutateActivity,
  activityController.addActivityDocument,
);

// --- 2. 0-Coupled Seasonal Activity-Vendor Contracts ---
router.post(
  "/contracts",
  ...mutateActivity,
  activityController.createActivityContract,
);

// --- 3. Operational Departure Activity Assignments ---
router.post(
  "/departures",
  ...mutateActivity,
  activityController.createDepartureActivity,
);
router.post(
  "/departures/allocate-passenger",
  ...mutateActivity,
  activityController.allocatePassengerActivity,
);
router.post(
  "/departures/:id/voucher",
  ...mutateActivity,
  activityController.generateActivityVoucher,
);
router.put(
  "/departures/:id/status",
  ...mutateActivity,
  activityController.updateDepartureActivityStatus,
);

module.exports = router;
