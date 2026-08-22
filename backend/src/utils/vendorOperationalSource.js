const SOURCE_HOTEL = "OPS_HOTEL_BOOKING";
const SOURCE_FLEET = "OPS_TRANSPORT_FLEET";
const SOURCE_GUIDE = "OPS_GUIDE_PAYMENT";
const SOURCE_ACTIVITY = "OPS_ACTIVITY";

const CANONICAL_SOURCE_TYPES = [SOURCE_HOTEL, SOURCE_FLEET, SOURCE_GUIDE, SOURCE_ACTIVITY];

function stripOperationalSourcePrefix(targetId) {
  return String(targetId || "").replace(/^(hb-|fl-|gp-|act-vendor-|act-|vnd-)/i, "").trim();
}

function isCanonicalSource(sourceType, sourceId) {
  return Boolean(sourceType && sourceId && CANONICAL_SOURCE_TYPES.includes(String(sourceType)));
}

function sourceKey(sourceType, sourceId) {
  if (!isCanonicalSource(sourceType, sourceId)) return null;
  return `${sourceType}:${sourceId}`;
}

function departureWorkspaceHref(tripId, departureDate) {
  if (!tripId || !departureDate) return null;
  const dateKey = new Date(departureDate).toISOString().split("T")[0];
  if (!dateKey || dateKey === "Invalid Date") return null;
  return `/admin/departure-workspace?departureId=${encodeURIComponent(`${tripId}_${dateKey}`)}&tab=overview`;
}

function resolveSourceFromBody(body = {}) {
  const explicitType = body.sourceType ? String(body.sourceType).trim() : "";
  const explicitId = stripOperationalSourcePrefix(body.sourceId);
  if (isCanonicalSource(explicitType, explicitId)) {
    return { sourceType: explicitType, sourceId: explicitId };
  }
  const hotelId = stripOperationalSourcePrefix(body.hotelBookingId);
  if (hotelId) return { sourceType: SOURCE_HOTEL, sourceId: hotelId };
  const fleetId = stripOperationalSourcePrefix(body.fleetBookingId);
  if (fleetId) return { sourceType: SOURCE_FLEET, sourceId: fleetId };
  const guideId = stripOperationalSourcePrefix(body.guideId);
  if (guideId) return { sourceType: SOURCE_GUIDE, sourceId: guideId };
  const activityId = stripOperationalSourcePrefix(body.activityId);
  if (activityId) return { sourceType: SOURCE_ACTIVITY, sourceId: activityId };
  return { sourceType: null, sourceId: null };
}

function sourceFromOperationalRecord(hotel, fleet, guide, activity) {
  if (hotel) return { sourceType: SOURCE_HOTEL, sourceId: hotel.id, record: hotel };
  if (fleet) return { sourceType: SOURCE_FLEET, sourceId: fleet.id, record: fleet };
  if (guide) return { sourceType: SOURCE_GUIDE, sourceId: guide.id, record: guide };
  if (activity) return { sourceType: SOURCE_ACTIVITY, sourceId: activity.id, record: activity };
  return null;
}

async function findOperationalSource(db, id, tenantId) {
  const rawId = stripOperationalSourcePrefix(id);
  if (!rawId || !tenantId || !db) return null;

  const hotel = await db.opsHotelBooking.findFirst({ where: { id: rawId, tenantId } });
  if (hotel) return sourceFromOperationalRecord(hotel, null, null, null);

  const fleet = await db.opsTransportFleet.findFirst({ where: { id: rawId, tenantId } });
  if (fleet) return sourceFromOperationalRecord(null, fleet, null, null);

  const guide = await db.opsGuidePayment.findFirst({ where: { id: rawId, tenantId } });
  if (guide) return sourceFromOperationalRecord(null, null, guide, null);

  if (typeof db.opsActivity?.findFirst === "function") {
    const activity = await db.opsActivity.findFirst({ where: { id: rawId, tenantId } });
    if (activity) return sourceFromOperationalRecord(null, null, null, activity);
  }

  return null;
}

function vendorFieldsFromOperationalSource(source) {
  if (!source?.record) return null;
  const { sourceType, record } = source;
  if (sourceType === SOURCE_HOTEL) {
    return {
      vendorName: String(record.hotelName || "").trim() || "Hotel",
      category: "Hotels",
      agreed: Number(record.totalAmount || 0),
      paid: Number(record.advancePaid || 0),
      serviceDescription: record.notes || record.location || "Hotel stay",
    };
  }
  if (sourceType === SOURCE_FLEET) {
    return {
      vendorName: String(record.vendorName || record.driverName || "Transport Fleet").trim(),
      category: "Transport",
      agreed: Number(record.totalAmount || 0),
      paid: Number(record.advancePaid || 0),
      serviceDescription: record.vehicleType || record.route || "Transport fleet",
    };
  }
  if (sourceType === SOURCE_GUIDE) {
    return {
      vendorName: String(record.guideName || "Lead Guide").trim(),
      category: "Guides",
      agreed: Number(record.agreedAmount || 0),
      paid: Number(record.advancePaid || 0),
      serviceDescription: record.assignmentType || "Guide assignment",
    };
  }
  return {
    vendorName: String(record.vendorName || record.name || "Activity vendor").trim(),
    category: "Activities",
    agreed: Number(record.actualCost || record.estimatedCost || 0),
    paid: Number(record.actualCost || 0),
    serviceDescription: record.name || record.type || "Activity",
  };
}

function operationalModelForSourceType(db, sourceType) {
  if (!db) return null;
  switch (sourceType) {
    case SOURCE_HOTEL:
      return db.opsHotelBooking;
    case SOURCE_FLEET:
      return db.opsTransportFleet;
    case SOURCE_GUIDE:
      return db.opsGuidePayment;
    case SOURCE_ACTIVITY:
      return db.opsActivity || db.opsDepartureActivity || null;
    default:
      return null;
  }
}

function writeBackDataForSourceType(sourceType, agreed, advance) {
  const remaining = Math.max(0, (agreed || 0) - (advance || 0));
  if (sourceType === SOURCE_GUIDE) {
    const statusLabel = advance >= agreed && agreed > 0 ? "PAID" : advance > 0 ? "PARTIAL" : "PENDING";
    return { advancePaid: advance, balanceAmount: remaining, paymentStatus: statusLabel };
  }
  if (sourceType === SOURCE_ACTIVITY) {
    return { actualCost: advance };
  }
  return { advancePaid: advance, balanceAmount: remaining };
}

/**
 * Write-back SETS operational paid amounts. Never increments. Never name-matches.
 * Requires canonical sourceType + sourceId + tenantId.
 */
async function syncOperationalVendorRecord({ tenantId, sourceType, sourceId, agreed, advance } = {}, db) {
  if (!db) {
    return {
      resolved: false,
      updatedCount: 0,
      message: "Operational write-back requires a database client",
    };
  }
  const rawId = stripOperationalSourcePrefix(sourceId);
  if (!tenantId || !isCanonicalSource(sourceType, rawId)) {
    return {
      resolved: false,
      updatedCount: 0,
      message: "Operational record unavailable: missing canonical sourceType, sourceId, or tenantId",
    };
  }

  const model = operationalModelForSourceType(db, sourceType);
  if (!model || typeof model.updateMany !== "function") {
    return {
      resolved: false,
      updatedCount: 0,
      message: `Unsupported operational sourceType for write-back: ${sourceType}`,
    };
  }

  const data = writeBackDataForSourceType(sourceType, agreed, advance);
  const result = await model.updateMany({
    where: { id: rawId, tenantId },
    data,
  });
  const updatedCount = result.count || 0;
  if (updatedCount === 0) {
    return {
      resolved: false,
      updatedCount: 0,
      message: "Operational record not found for canonical sourceId + tenantId; write-back skipped",
    };
  }
  return { resolved: true, updatedCount, message: null };
}

async function writeBackOrThrow(db, payment, { agreed, advance, tenantId }) {
  const result = await syncOperationalVendorRecord(
    {
      tenantId,
      sourceType: payment?.sourceType,
      sourceId: payment?.sourceId,
      agreed,
      advance,
    },
    db,
  );
  if (isCanonicalSource(payment?.sourceType, payment?.sourceId) && !result.resolved) {
    throw {
      statusCode: 409,
      message: result.message || "Operational record unavailable for write-back",
    };
  }
  return result;
}

module.exports = {
  SOURCE_HOTEL,
  SOURCE_FLEET,
  SOURCE_GUIDE,
  SOURCE_ACTIVITY,
  CANONICAL_SOURCE_TYPES,
  stripOperationalSourcePrefix,
  isCanonicalSource,
  sourceKey,
  departureWorkspaceHref,
  resolveSourceFromBody,
  sourceFromOperationalRecord,
  findOperationalSource,
  vendorFieldsFromOperationalSource,
  operationalModelForSourceType,
  writeBackDataForSourceType,
  syncOperationalVendorRecord,
  writeBackOrThrow,
};
