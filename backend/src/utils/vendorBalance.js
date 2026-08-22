function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function vendorIdentityKey({ tripId, departureDate, vendorName, category }) {
  const dateKey = departureDate
    ? new Date(departureDate).toISOString().substring(0, 10)
    : "";
  return [
    String(tripId || "").trim().toLowerCase(),
    dateKey,
    String(vendorName || "").trim().toLowerCase(),
    String(category || "").trim().toLowerCase(),
  ].join("|");
}

/**
 * Canonical vendor balance. Outstanding is signed.
 * Paid > Total is overpaid — do not clamp to 0.
 */
function computeVendorBalance(totalCost, paidAmount) {
  const total = toNumber(totalCost);
  const paid = toNumber(paidAmount);
  const outstandingAmount = total - paid;
  const isOverpaid = outstandingAmount < 0 && paid > 0;
  return {
    totalCost: total,
    paidAmount: paid,
    outstandingAmount,
    dueAmount: Math.max(0, outstandingAmount),
    overpaidAmount: isOverpaid ? Math.abs(outstandingAmount) : 0,
    isOverpaid,
  };
}

function normalizeVendorCategory(category) {
  const cat = String(category || "").toUpperCase();
  if (cat.includes("HOTEL") || cat.includes("STAY") || cat.includes("CAMP") || cat.includes("ACCOM")) {
    return "Hotels";
  }
  if (cat.includes("TRANS") || cat.includes("FLEET") || cat.includes("BUS") || cat.includes("CAB")) {
    return "Transport";
  }
  if (cat.includes("ACT") || cat.includes("PERMIT")) {
    return "Activities";
  }
  if (cat.includes("GUIDE") || cat.includes("LEADER")) {
    return "Guides";
  }
  return category || "Other";
}

module.exports = {
  toNumber,
  vendorIdentityKey,
  computeVendorBalance,
  normalizeVendorCategory,
};
