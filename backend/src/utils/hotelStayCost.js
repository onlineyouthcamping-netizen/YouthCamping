/**
 * Hotel stay cost for OpsHotelBooking records.
 *
 * PER PERSON (per-person / PER_PAX):
 *   (doubleRooms×2×doubleRate + tripleRooms×3×tripleRate + quadRooms×4×quadRate + extraPax×extraRate) × nights
 *
 * ROOM-WISE (room-wise / PER_ROOM) — default when method is unknown:
 *   (doubleRooms×doubleRate + tripleRooms×tripleRate + quadRooms×quadRate + extraPax×extraRate) × nights
 *
 * MANUAL:
 *   use provided totalAmount as-is
 */

function toNonNegNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function toNonNegInt(value) {
  return Math.max(0, Math.trunc(toNonNegNumber(value)));
}

function normaliseHotelPricingMethod(raw) {
  if (!raw) return "ROOM_WISE";
  const u = String(raw).trim().toUpperCase().replace(/[-\s]/g, "_");
  if (u === "MANUAL") return "MANUAL";
  if (
    u === "PER_PERSON" ||
    u === "PER_PAX" ||
    u === "PERPAX" ||
    u === "PER_PERSON_PER_NIGHT" ||
    u === "PER_PAX_PER_NIGHT"
  ) {
    return "PER_PERSON";
  }
  return "ROOM_WISE";
}

/**
 * @param {object} input
 * @returns {number} total stay cost for all nights
 */
function calculateHotelStayCost(input = {}) {
  const method = normaliseHotelPricingMethod(input.pricingMethod);

  if (method === "MANUAL") {
    return toNonNegNumber(input.totalAmount);
  }

  const dRooms = toNonNegInt(input.doubleRoomsCount);
  const tRooms = toNonNegInt(input.tripleRoomsCount);
  const qRooms = toNonNegInt(input.quadRoomsCount);
  const exPax = toNonNegInt(input.extraPersonsCount);
  const nights = Math.max(1, toNonNegInt(input.nightsCount || 1) || 1);

  const dRate = toNonNegNumber(input.doubleRate);
  const tRate = toNonNegNumber(input.tripleRate);
  const qRate = toNonNegNumber(input.quadRate);
  const exRate = toNonNegNumber(input.extraBedRate ?? input.extraPersonRate);

  if (method === "PER_PERSON") {
    return (
      (dRooms * 2 * dRate +
        tRooms * 3 * tRate +
        qRooms * 4 * qRate +
        exPax * exRate) *
      nights
    );
  }

  return (dRooms * dRate + tRooms * tRate + qRooms * qRate + exPax * exRate) * nights;
}

module.exports = {
  calculateHotelStayCost,
  normaliseHotelPricingMethod,
};
