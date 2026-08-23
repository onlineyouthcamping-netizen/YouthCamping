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

function looksLikeJsonBlob(value) {
  if (value == null) return false;
  if (typeof value === "object") return true;
  const text = String(value).trim();
  if (!text) return false;
  if (text.includes("__isHotelPricing")) return true;
  if (/"pricingMethod"\s*:/.test(text) || /"doubleRate"\s*:/.test(text) || /"allocations"\s*:/.test(text)) {
    return true;
  }
  if (/^\s*[{\[]/.test(text)) return true;
  if (/[{[]/.test(text) && /"\s*:/.test(text)) return true;
  return false;
}

function parseObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return null;
  const text = value.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function countPart(value, letter) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${Math.round(n)} ${letter}`;
}

function roomMixLabel(source = {}) {
  const alloc = source.allocations && typeof source.allocations === "object" ? source.allocations : source;
  return [
    countPart(alloc.doubleRoomsCount ?? alloc.doubleRooms, "D"),
    countPart(alloc.tripleRoomsCount ?? alloc.tripleRooms, "T"),
    countPart(alloc.quadRoomsCount ?? alloc.quadRooms, "Q"),
    countPart(alloc.extraPersonsCount ?? alloc.extraPersons, "E"),
  ]
    .filter(Boolean)
    .join(" / ");
}

function pricingMethodLabel(method) {
  const normalized = String(method || "room-wise").toLowerCase().replace(/_/g, "-");
  if (normalized.includes("person") || normalized.includes("pax")) return "Per person";
  if (normalized === "per-room" || normalized === "perroom") return "Per room";
  return "Room-wise";
}

function formatHotelPricingSummary(value) {
  const record = parseObject(value);
  if (!record) return null;
  const mix = roomMixLabel(record);
  const method = pricingMethodLabel(record.pricingMethod);
  if (mix) return `${method} · ${mix}`;
  const userNotes = String(record.userNotes || "").replace(/\s+/g, " ").trim();
  if (userNotes && !looksLikeJsonBlob(userNotes)) return userNotes;
  if (record.__isHotelPricing || record.rates || record.allocations) return method;
  return null;
}

function formatVendorDisplayName(value) {
  let text = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*\((hotel|hotels|transport|guide|guides|activity|activities|vendor|misc|miscellaneous)\)\s*$/i, "")
    .trim();
  if (!text) return "Vendor";
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters && (letters === letters.toUpperCase() || letters === letters.toLowerCase())) {
    text = text.toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase());
  }
  return text;
}

function refineServiceAgainstVendor(text, vendorName) {
  const vendor = formatVendorDisplayName(vendorName).toLowerCase();
  const raw = String(text || "")
    .replace(/\s*\((hotel|hotels|transport|guide|guides|activity|activities|vendor)\)\s*/gi, " ")
    .replace(/\s*[•|/]\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";
  return raw
    .split(/\s*·\s*/)
    .map((part) => part.trim())
    .filter((part) => {
      const token = part.toLowerCase();
      if (!token) return false;
      if (vendor && token === vendor) return false;
      if (vendor && vendor.includes(token) && token.length <= 18) return false;
      return true;
    })
    .join(" · ");
}

function hotelStayServiceLine(record = {}) {
  const vendor = formatVendorDisplayName(record.hotelName || record.vendorName || "");
  const rooms = Number(record.numberOfRooms || record.rooms);
  const loc = String(record.location || "").replace(/\s+/g, " ").trim();
  const roomType = String(record.roomType || "").replace(/\s+/g, " ").trim();
  const parts = [];
  if (Number.isFinite(rooms) && rooms > 0) {
    parts.push(`${Math.round(rooms)} ${rooms === 1 ? "room" : "rooms"}`);
  }
  if (roomType && !/^(standard|hotel|custom(\s+prop.*)?)$/i.test(roomType)) {
    parts.push(roomType);
  }
  if (loc && !vendor.toLowerCase().includes(loc.toLowerCase())) {
    parts.push(loc);
  }
  return parts.join(" · ");
}

function defaultServiceLabel(category) {
  switch (String(category || "")) {
    case "Hotels":
      return "Hotel stay";
    case "Transport":
      return "Transport fleet";
    case "Guides":
      return "Guide assignment";
    case "Activities":
      return "Activity";
    default:
      return category || "Service";
  }
}

function humanizeVendorServiceDescription(record = {}, category) {
  const cat = category || record.category || record.vendorType || "";
  const vendor = formatVendorDisplayName(record.vendorName || record.hotelName || record.guideName || "");
  const stay = hotelStayServiceLine(record);
  if (stay && String(cat).toLowerCase().includes("hotel")) return stay;

  const hotelSummary =
    formatHotelPricingSummary(record.serviceDescription) ||
    formatHotelPricingSummary(record.notes) ||
    formatHotelPricingSummary(record.remarks) ||
    formatHotelPricingSummary(record);
  if (hotelSummary) return hotelSummary;

  const candidates = [
    record.serviceDescription,
    record.vehicleType,
    record.assignmentType,
    record.roomType,
    record.notes,
    record.remarks,
    record.location,
  ];
  for (const candidate of candidates) {
    if (candidate == null || candidate === "") continue;
    if (looksLikeJsonBlob(candidate)) continue;
    const text = refineServiceAgainstVendor(String(candidate).replace(/\s+/g, " ").trim(), vendor);
    if (text && text !== cat) return text;
  }
  return stay || defaultServiceLabel(cat);
}

function humanizeBillReference(record = {}) {
  const candidates = [record.transactionId, record.transactionRef, record.invoiceProof, record.serviceDescription];
  for (const candidate of candidates) {
    if (candidate == null || candidate === "" || looksLikeJsonBlob(candidate)) continue;
    const text = String(candidate).trim();
    if (!text) continue;
    if (/^https?:\/\//i.test(text) || text.startsWith("/") || text.includes("/uploads/")) continue;
    const bill = text.match(/BILL-[A-Za-z0-9]+/i);
    if (bill) return `BILL-${bill[0].slice(5)}`;
    if (text.length <= 48) return text;
  }
  return `BILL-${String(record.id || "").slice(-6)}`;
}

function firstHumanText(values = []) {
  for (const value of values) {
    if (value == null || value === "" || looksLikeJsonBlob(value)) continue;
    const text = String(value).replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return "";
}

function vendorFieldsFromOperationalSource(source) {
  if (!source?.record) return null;
  const { sourceType, record } = source;
  if (sourceType === SOURCE_HOTEL) {
    return {
      vendorName: formatVendorDisplayName(record.hotelName || "") || "Hotel",
      category: "Hotels",
      agreed: Number(record.totalAmount || 0),
      paid: Number(record.advancePaid || 0),
      serviceDescription: humanizeVendorServiceDescription(record, "Hotels"),
    };
  }
  if (sourceType === SOURCE_FLEET) {
    return {
      vendorName: formatVendorDisplayName(record.vendorName || record.driverName || "Transport Fleet"),
      category: "Transport",
      agreed: Number(record.totalAmount || 0),
      paid: Number(record.advancePaid || 0),
      serviceDescription: record.vehicleType || record.route || "Transport fleet",
    };
  }
  if (sourceType === SOURCE_GUIDE) {
    return {
      vendorName: formatVendorDisplayName(record.guideName || "Lead Guide"),
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
  humanizeVendorServiceDescription,
  formatVendorDisplayName,
  humanizeBillReference,
  looksLikeJsonBlob,
  firstHumanText,
  operationalModelForSourceType,
  writeBackDataForSourceType,
  syncOperationalVendorRecord,
  writeBackOrThrow,
};
