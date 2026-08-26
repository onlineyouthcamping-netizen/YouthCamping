/**
 * Helpers for Aadhaar / govt ID proof presence on booking passengers.
 */

function isUsableIdProofUrl(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Stored as uploaded URL/path, or legacy non-empty string identifier
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.includes("uploads/") ||
    trimmed.includes("bookings/")
  );
}

function passengerHasIdProof(passenger) {
  if (!passenger || typeof passenger !== "object") return false;

  const direct = [
    passenger.aadhaarUrl,
    passenger.idProofUrl,
    passenger.idProof,
    passenger.aadhaar,
  ];
  if (direct.some(isUsableIdProofUrl)) return true;

  if (Array.isArray(passenger.documents) && passenger.documents.length > 0) {
    return passenger.documents.some(
      (d) =>
        isUsableIdProofUrl(d?.url) ||
        isUsableIdProofUrl(d?.storagePath) ||
        Boolean(d?.id),
    );
  }

  return false;
}

function extractPassengerPersons(passengersJson) {
  if (!passengersJson) return [];
  if (Array.isArray(passengersJson)) return passengersJson;
  if (typeof passengersJson === "object" && Array.isArray(passengersJson.persons)) {
    return passengersJson.persons;
  }
  return [];
}

function isCancelledPassenger(passenger) {
  if (!passenger || typeof passenger !== "object") return false;
  const status = String(passenger.status || "").toUpperCase();
  return Boolean(passenger.isCancelled) || status === "CANCELLED";
}

/**
 * Returns 1-based traveler indices (and names) missing Aadhaar/ID proof.
 * Optionally counts BookingDocument rows as satisfying the requirement.
 */
function findPassengersMissingIdProof(passengersJson, bookingDocuments = []) {
  const persons = extractPassengerPersons(passengersJson);
  const docs = Array.isArray(bookingDocuments) ? bookingDocuments : [];

  const missing = [];
  persons.forEach((person, index) => {
    if (isCancelledPassenger(person)) return;
    if (passengerHasIdProof(person)) return;

    const passengerKeys = [
      person.id,
      person.passengerId,
      String(index),
      `pax-${index}`,
      String(index + 1),
    ]
      .filter(Boolean)
      .map(String);

    const hasBookingDoc = docs.some((d) => {
      const docPid = d?.passengerId != null ? String(d.passengerId) : "";
      return docPid && passengerKeys.includes(docPid);
    });

    if (hasBookingDoc) return;

    missing.push({
      index: index + 1,
      name: person.name || person.fullName || `Traveler ${index + 1}`,
    });
  });

  return missing;
}

function assertPassengersHaveIdProof(passengersJson, bookingDocuments = []) {
  const missing = findPassengersMissingIdProof(
    passengersJson,
    bookingDocuments,
  );
  if (missing.length === 0) return null;

  const labels = missing
    .map((m) => `${m.name} (#${m.index})`)
    .join(", ");
  return {
    message: `Aadhaar / Govt ID proof is required for every traveler. Missing for: ${labels}`,
    missing,
  };
}

module.exports = {
  isUsableIdProofUrl,
  passengerHasIdProof,
  extractPassengerPersons,
  findPassengersMissingIdProof,
  assertPassengersHaveIdProof,
};
