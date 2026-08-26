/**
 * Build person-wise identity + payment-proof rows for a departure's bookings.
 * Reuses BookingDocument rows, passenger JSON ID fields, and OpsClientPayment proofs.
 */

const {
  extractPassengerPersons,
  isUsableIdProofUrl,
  isCancelledPassenger,
} = require("./passengerIdProof");
const { mergeProofUrls } = require("./paymentProofStorage");

function normalizeCompareName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function passengerKeysFor(person, index, booking) {
  const keys = [
    person?.id,
    person?.passengerId,
    String(index),
    `pax-${index}`,
    String(index + 1),
  ];
  if (index === 0 && booking?.id) {
    keys.push(booking.id, "primary", "lead");
  }
  return keys.filter(Boolean).map(String);
}

function collectIdentityDocs({ person, index, booking, bookingDocuments }) {
  const docs = [];
  const seen = new Set();
  const push = (entry) => {
    if (!entry) return;
    const key = entry.id || entry.url || `${entry.label}-${entry.fileName}`;
    if (!key || seen.has(key)) return;
    seen.add(key);
    docs.push(entry);
  };

  const keys = new Set(passengerKeysFor(person, index, booking));
  (bookingDocuments || []).forEach((d) => {
    const pid = d?.passengerId != null ? String(d.passengerId) : "";
    if (!pid || !keys.has(pid)) return;
    push({
      id: d.id,
      source: "booking_document",
      label: d.documentType || "ID Document",
      fileName: d.originalFileName || "Document",
      mimeType: d.mimeType || null,
      status: d.status || "UPLOADED",
      url: null,
      bookingId: booking.id,
      passengerId: pid,
      createdAt: d.createdAt || null,
    });
  });

  const directFields = [
    { key: "aadhaarUrl", label: "Aadhaar" },
    { key: "idProofUrl", label: "ID Proof" },
    { key: "aadhaar", label: "Aadhaar" },
    { key: "idProof", label: "ID Proof" },
  ];
  directFields.forEach(({ key, label }) => {
    const value = person?.[key];
    if (!isUsableIdProofUrl(value)) return;
    push({
      id: `direct-${key}-${person?.id || index}`,
      source: "passenger_field",
      label,
      fileName: label,
      mimeType: null,
      status: "UPLOADED",
      url: String(value).trim(),
      bookingId: booking.id,
      passengerId: String(person?.id || index),
      createdAt: null,
    });
  });

  if (Array.isArray(person?.documents)) {
    person.documents.forEach((d, di) => {
      const url = d?.url || d?.fileUrl || d?.storagePath || null;
      if (!url && !d?.id) return;
      push({
        id: d.id || `pdoc-${index}-${di}`,
        source: d.id ? "booking_document" : "passenger_json",
        label: d.documentType || d.title || "ID Document",
        fileName: d.originalFileName || d.title || "Document",
        mimeType: d.mimeType || null,
        status: d.status || "UPLOADED",
        url: typeof url === "string" ? url : null,
        bookingId: booking.id,
        passengerId: String(person?.id || index),
        createdAt: d.createdAt || null,
      });
    });
  }

  return docs;
}

function collectPaymentProofs(opsClientPayments = []) {
  const proofs = [];
  const seen = new Set();

  (opsClientPayments || []).forEach((p) => {
    const urls = mergeProofUrls(p.proofUrls, p.proofFileUrl, p.proofUrl);
    if (!urls.length) return;
    urls.forEach((url, ui) => {
      if (seen.has(url)) return;
      seen.add(url);
      proofs.push({
        id: `${p.id}-${ui}`,
        paymentId: p.id,
        url,
        fileName: p.proofFileName || `Payment proof${urls.length > 1 ? ` ${ui + 1}` : ""}`,
        amount: p.amount ?? null,
        paymentMode: p.paymentMode || null,
        status: p.status || null,
        approvalStatus: p.approvalStatus || null,
        transactionId: p.transactionId || null,
        paymentDate: p.paymentDate || p.createdAt || null,
      });
    });
  });

  return proofs;
}

function buildTravelerList(booking) {
  const persons = extractPassengerPersons(booking.passengers);
  const leadName = booking.fullName || booking.name || "Passenger";
  const leadNorm = normalizeCompareName(leadName);

  if (!persons.length) {
    return [
      {
        id: booking.id,
        name: leadName,
        isLead: true,
        index: 0,
        raw: {
          id: booking.id,
          name: leadName,
          aadhaarUrl: booking.aadhaarUrl,
          idProofUrl: booking.idProofUrl,
          idProof: booking.idProof,
        },
      },
    ];
  }

  const travelers = [];
  const leadFromPersons = persons.find(
    (p) => normalizeCompareName(p?.name || p?.fullName) === leadNorm,
  );

  const details =
    booking.passengers &&
    typeof booking.passengers === "object" &&
    booking.passengers.details &&
    typeof booking.passengers.details === "object"
      ? booking.passengers.details
      : {};

  if (leadFromPersons) {
    travelers.push({
      id: leadFromPersons.id || booking.id,
      name: leadFromPersons.name || leadFromPersons.fullName || leadName,
      isLead: true,
      index: persons.indexOf(leadFromPersons),
      // Merge booking-level details so lead Aadhaar on passengers.details still counts
      raw: { ...details, ...leadFromPersons, id: leadFromPersons.id || booking.id },
    });
  } else {
    travelers.push({
      id: booking.id,
      name: leadName,
      isLead: true,
      index: 0,
      raw: {
        ...details,
        id: booking.id,
        name: leadName,
      },
    });
  }

  persons.forEach((p, idx) => {
    if (normalizeCompareName(p?.name || p?.fullName) === leadNorm) return;
    travelers.push({
      id: p.id || `${booking.id}-co-${idx}`,
      name: p.name || p.fullName || `Traveler ${idx + 1}`,
      isLead: false,
      index: idx,
      raw: p,
    });
  });

  return travelers;
}

function buildDeparturePassengerDocuments(bookings = []) {
  const passengers = [];
  let withId = 0;
  let missingId = 0;
  let withPaymentProof = 0;
  let missingPaymentProof = 0;

  (bookings || []).forEach((booking) => {
    const status = String(booking.status || "").toLowerCase();
    if (status === "cancelled" || status === "rejected") return;

    const paymentProofs = collectPaymentProofs(booking.opsClientPayments || []);
    const bookingHasProof = paymentProofs.length > 0;
    const travelers = buildTravelerList(booking);

    travelers.forEach((t) => {
      if (isCancelledPassenger(t.raw)) return;

      const identityDocs = collectIdentityDocs({
        person: t.raw,
        index: t.index,
        booking,
        bookingDocuments: booking.documents || [],
      });
      const hasId = identityDocs.length > 0;
      if (hasId) withId += 1;
      else missingId += 1;
      if (bookingHasProof) withPaymentProof += 1;
      else missingPaymentProof += 1;

      passengers.push({
        id: String(t.id),
        name: t.name,
        isLead: Boolean(t.isLead),
        bookingDbId: booking.id,
        bookingRef: booking.bookingId || booking.id,
        bookingStatus: booking.status || null,
        identityDocs,
        hasIdentityDoc: hasId,
        paymentProofs,
        hasPaymentProof: bookingHasProof,
      });
    });
  });

  return {
    passengers,
    summary: {
      totalPassengers: passengers.length,
      withIdentityDoc: withId,
      missingIdentityDoc: missingId,
      withPaymentProof,
      missingPaymentProof,
    },
  };
}

module.exports = {
  buildDeparturePassengerDocuments,
  collectIdentityDocs,
  collectPaymentProofs,
  buildTravelerList,
};
