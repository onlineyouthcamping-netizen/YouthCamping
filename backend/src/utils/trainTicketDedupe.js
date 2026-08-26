/**
 * Train ticket dedupe helpers.
 * One active ticket per traveler per journey (DEPARTURE | RETURN).
 */

const DONE_STATUSES = new Set([
  "CONFIRMED",
  "BOOKED",
  "ISSUED",
  "SELF_BOOKED",
  "SELF BOOKED",
  "RAC",
  "WAITLISTED",
]);

function normalizeTravelerName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** null / empty / DEPARTURE → DEPARTURE; RETURN stays RETURN. */
function normalizeJourneyRef(ref) {
  const r = String(ref || "")
    .trim()
    .toUpperCase();
  if (r === "RETURN") return "RETURN";
  return "DEPARTURE";
}

function travelerJourneyKey(travelerName, passengerReference) {
  return `${normalizeTravelerName(travelerName)}|${normalizeJourneyRef(passengerReference)}`;
}

function isActiveTicket(ticket) {
  if (!ticket) return false;
  const st = String(ticket.ticketStatus || "")
    .trim()
    .toUpperCase();
  if (st === "CANCELLED") return false;
  if (ticket.supersededByTicketId) return false;
  return true;
}

function isDoneStatus(status) {
  const st = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  return DONE_STATUSES.has(st) || DONE_STATUSES.has(st.replace(/_/g, " "));
}

/** Higher score = better ticket to keep when collapsing duplicates. */
function scoreTicket(ticket) {
  let score = 0;
  if (isDoneStatus(ticket.ticketStatus)) score += 1000;
  if (ticket.pnr && String(ticket.pnr).trim()) score += 100;
  if (ticket.trainNumber || ticket.trainName) score += 50;
  if (ticket.seatNumber || ticket.coach) score += 20;
  if (ticket.sourceStation || ticket.destinationStation) score += 10;
  // Prefer older row when scores tie (first auto-gen / first edit wins).
  const created = ticket.createdAt ? new Date(ticket.createdAt).getTime() : 0;
  score += Math.max(0, 1_000_000_000_000 - created) / 1_000_000_000_000;
  return score;
}

/**
 * Among active tickets sharing the same traveler+journey, pick one keeper.
 * Returns { keep, cancel } where cancel are the rest.
 */
function pickKeeperAndDuplicates(tickets) {
  const active = (tickets || []).filter(isActiveTicket);
  if (active.length <= 1) {
    return { keep: active[0] || null, cancel: [] };
  }
  const ranked = [...active].sort((a, b) => scoreTicket(b) - scoreTicket(a));
  return { keep: ranked[0], cancel: ranked.slice(1) };
}

/**
 * Group tickets by traveler+journey and list duplicates that should be cancelled.
 * @returns {{ keepId: string, cancelIds: string[], key: string }[]}
 */
function findDuplicateGroups(tickets) {
  const byKey = new Map();
  for (const t of tickets || []) {
    if (!isActiveTicket(t)) continue;
    const key = travelerJourneyKey(t.travelerName, t.passengerReference);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(t);
  }

  const groups = [];
  for (const [key, group] of byKey.entries()) {
    if (group.length < 2) continue;
    const { keep, cancel } = pickKeeperAndDuplicates(group);
    if (!keep || cancel.length === 0) continue;
    groups.push({
      key,
      keepId: keep.id,
      cancelIds: cancel.map((c) => c.id),
      keep,
      cancel,
    });
  }
  return groups;
}

/**
 * Collapse a list to one active ticket per traveler+journey (for API/UI).
 * Cancelled / superseded rows are dropped.
 */
function dedupeActiveTickets(tickets) {
  const byKey = new Map();
  for (const t of tickets || []) {
    if (!isActiveTicket(t)) continue;
    const key = travelerJourneyKey(t.travelerName, t.passengerReference);
    const existing = byKey.get(key);
    if (!existing || scoreTicket(t) > scoreTicket(existing)) {
      byKey.set(key, t);
    }
  }
  // Stable-ish order: departure names then return, by original createdAt when present
  return Array.from(byKey.values()).sort((a, b) => {
    const ja = normalizeJourneyRef(a.passengerReference);
    const jb = normalizeJourneyRef(b.passengerReference);
    if (ja !== jb) return ja === "DEPARTURE" ? -1 : 1;
    const na = normalizeTravelerName(a.travelerName);
    const nb = normalizeTravelerName(b.travelerName);
    if (na !== nb) return na.localeCompare(nb);
    return 0;
  });
}

module.exports = {
  DONE_STATUSES,
  normalizeTravelerName,
  normalizeJourneyRef,
  travelerJourneyKey,
  isActiveTicket,
  isDoneStatus,
  scoreTicket,
  pickKeeperAndDuplicates,
  findDuplicateGroups,
  dedupeActiveTickets,
};
