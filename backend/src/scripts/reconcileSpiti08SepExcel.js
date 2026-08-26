/**
 * Reconcile SPT-1 2026-09-08 bookings against the ops Excel passenger sheet.
 *
 * Usage:
 *   node src/scripts/reconcileSpiti08SepExcel.js           # dry-run (default)
 *   node src/scripts/reconcileSpiti08SepExcel.js --apply   # write changes
 *
 * Excel rules used:
 * - Group advance lives on the first named row; rem amounts are summed for due.
 * - Couple rows (Harsh/Ruchi, Chirag/Drashti) list the SAME remaining on both
 *   people → treat as GROUP remaining (not doubled), matching prior ops sync.
 * - Per-person rem that differs or repeats across a multi-pax package group
 *   (Khushi, Prince) is summed.
 *
 * Khushi (BK-SPITI-08SEP-KHUSHI): Excel "21000" is GROUP ADVANCE, not package
 * price. total = 21000 + (18500+18500+15500) = 73500. Line items 25500/25500/
 * 22500. For a Khushi-only repair use fixKhushiSpiti08SepAmounts.js instead of
 * re-applying this full script.
 */
"use strict";

require("dotenv").config();
const { prisma } = require("../lib/prisma");

const APPLY = process.argv.includes("--apply");
const DEP_DATE = new Date("2026-09-08T00:00:00.000Z");
const TRIP_ID = "SPT-1";

const ACCOUNTS = {
  YAC: "cmsu4pmb00000x052sec8pu8t", // YouthCamping Company Account
  "OFFICE CASH": "cmsu4pmb00002x052fdn5vx09", // Cash Collection Account
  NIKULKUMAR: "cmsu4pmb00001x0524bfj8tod", // Nikulbhai Patel Account
  CHAKABHAI: null, // collector label only — no dedicated receiving account
};

function istDate(ddmmyyyy) {
  // Excel uses DD/MM/YYYY or DD-MM-YYYY
  const m = String(ddmmyyyy).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) throw new Error(`Bad date: ${ddmmyyyy}`);
  const [, d, mo, y] = m;
  return new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00.000Z`);
}

function paymentPayload(amount, txn, dateStr, remarks) {
  return {
    amount,
    paymentMode: txn,
    collectionAccountId: ACCOUNTS[txn] ?? null,
    transactionId: txn,
    paymentDate: istDate(dateStr),
    status: "Verified",
    approvalStatus: "APPROVED_FOUNDER",
    remarks:
      remarks ||
      `Excel reconcile SPT-1_2026-09-08 · ${txn} · ${dateStr} · marked cleared to match sheet`,
  };
}

function trainDetails() {
  return {
    roomType: "Quad Sharing",
    trainClass: "3 TIER AC TRAIN",
    trainOption: "3 TIER AC TRAIN",
    ticketStatus: "CONFIRMED",
  };
}

function person(base) {
  return {
    trainOption: "3 TIER AC TRAIN",
    roomSharing: base.roomSharing || "Quad Sharing",
    foodPreference: base.foodPreference || "Normal Food",
    status: base.isCancelled ? "CANCELLED" : "CONFIRMED",
    isCancelled: !!base.isCancelled,
    ...base,
  };
}

function threeAcItems(people, perPersonTotal) {
  return people.map((p, i) => ({
    id: `transport-${p.id || i}-0`,
    qty: 1,
    name: `3 TIER AC TRAIN (Ahmedabad) [${p.name}]`,
    rate: perPersonTotal,
    category: "transport",
    personId: p.id || `p-${i}`,
    variantName: "3 TIER AC TRAIN",
  }));
}

function log(msg) {
  console.log(msg);
}

const OPS_SELECT = {
  id: true,
  bookingId: true,
  amount: true,
  paymentMode: true,
  collectionAccountId: true,
  transactionId: true,
  paymentDate: true,
  status: true,
  approvalStatus: true,
  remarks: true,
};

async function upsertClearedPayments(bookingId, payments) {
  // Avoid selecting schema-only columns (e.g. proofUrls) not yet migrated in prod.
  const existing = await prisma.opsClientPayment.findMany({
    where: { bookingId },
    select: OPS_SELECT,
  });
  const report = { bookingId, before: existing.length, actions: [] };

  if (!APPLY) {
    report.actions.push({
      dryRun: true,
      wouldUpsert: payments.map((p) => ({
        amount: p.amount,
        paymentMode: p.paymentMode,
        paymentDate: p.paymentDate,
        approvalStatus: p.approvalStatus,
        collectionAccountId: p.collectionAccountId,
      })),
      existing,
    });
    return report;
  }

  // Replace pending/incorrect advance stack with exact Excel payments (no double-count).
  await prisma.opsClientPayment.deleteMany({ where: { bookingId } });
  for (const p of payments) {
    const row = await prisma.opsClientPayment.create({
      data: {
        tenantId: "default",
        bookingId,
        amount: p.amount,
        paymentMode: p.paymentMode,
        collectionAccountId: p.collectionAccountId,
        transactionId: p.transactionId,
        paymentDate: p.paymentDate,
        status: p.status,
        approvalStatus: p.approvalStatus,
        remarks: p.remarks,
      },
      select: OPS_SELECT,
    });
    report.actions.push({ created: row.id, amount: row.amount, mode: row.paymentMode });
  }
  // Remove legacy Payment rows (BK-… and internal cuid keys) so they cannot double-count.
  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    select: { id: true },
  });
  const legacyKeys = [bookingId, booking?.id].filter(Boolean);
  const legacy = await prisma.payment.deleteMany({
    where: { bookingId: { in: legacyKeys } },
  });
  if (legacy.count) report.actions.push({ deletedLegacyPayments: legacy.count });
  return report;
}

async function syncTrainTickets(bookingId, travelerNames, { cancelNames = [] } = {}) {
  if (!APPLY) return { dryRun: true, travelerNames };
  await prisma.trainTicket.deleteMany({ where: { bookingId } });
  const created = [];
  for (const name of travelerNames) {
    const cancelled = cancelNames.includes(name);
    created.push(
      await prisma.trainTicket.create({
        data: {
          tenantId: "default",
          bookingId,
          travelerName: name,
          sourceStation: "Ahmedabad",
          destinationStation: "Kalka / Chandigarh",
          berthType: "3AC",
          ticketStatus: cancelled ? "CANCELLED" : "CONFIRMED",
          approvalStatus: cancelled ? "REJECTED" : "APPROVED",
          cancellationReason: cancelled ? "Cancelled by customer" : null,
        },
      }),
    );
  }
  return { created: created.length };
}

async function main() {
  log(`\n=== Spiti 08 Sep Excel reconcile (${APPLY ? "APPLY" : "DRY-RUN"}) ===\n`);

  const trip = await prisma.trip.findUnique({ where: { id: TRIP_ID } });
  if (!trip) throw new Error("Trip SPT-1 not found");

  const targets = [
    {
      key: "KHUSHI",
      bookingId: "BK-SPITI-08SEP-KHUSHI",
      excelPassengers: ["KHUSHI", "RUSHVI", "KHUSHBUBEN"],
      // 21000 = group advance (Excel first row), NOT per-person package price.
      totalAmount: 73500, // advance 21000 + rem 18500+18500+15500
      advancePaid: 21000,
      remainingAmount: 52500,
      paymentMode: "YAC",
      payments: [paymentPayload(21000, "YAC", "08/07/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "p-khushi-1",
            name: "Khushi",
            age: 24,
            gender: "Female",
            phone: "7069755307",
            email: "khushi7069@gmail.com",
          }),
          person({
            id: "p-khushi-2",
            name: "Rushvi",
            age: 24,
            gender: "Female",
            phone: "9327623442",
            email: null,
          }),
          person({
            id: "p-khushi-3",
            name: "Umangiben",
            age: 32,
            gender: "Female",
            phone: "8128511964",
            email: null,
            isCancelled: true,
            notes: "Cancelled by customer (not on Excel sheet)",
          }),
          person({
            id: "p-khushi-4",
            name: "Khushbuben",
            age: 24,
            gender: "Female",
            phone: "9327359374",
            email: null,
          }),
        ];
        const active = persons.filter((p) => !p.isCancelled);
        return {
          name: "Khushi",
          fullName: "Khushi",
          phone: "7069755307",
          mobile: "7069755307",
          email: "khushi7069@gmail.com",
          age: 24,
          gender: "Female",
          numberOfTravelers: 3,
          amount: 21000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          pickupCity: existing?.pickupCity || "Ahmedabad",
          passengers: { details: trainDetails(), persons },
          notes: "Excel: advance ₹21,000 YAC 08/07/2026; rem 18500+18500+15500 (Umangiben cancelled)",
          adminNotes: "08 SEP SPITI - Khushi Group (Excel 3 pax; Umangiben cancelled)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            paymentMode: "Partial Payment",
            excelReconcile: "2026-08-26",
            bookingItems: [
              ...threeAcItems(
                [
                  { id: "p-khushi-1", name: "Khushi" },
                  { id: "p-khushi-2", name: "Rushvi" },
                ],
                25500,
              ),
              ...threeAcItems([{ id: "p-khushi-4", name: "Khushbuben" }], 22500),
            ],
          },
          trainNames: ["Khushi", "Rushvi", "Umangiben", "Khushbuben"],
          cancelTrain: ["Umangiben"],
          activeNames: active.map((p) => p.name),
        };
      },
    },
    {
      key: "ANASH",
      bookingId: "BK-SPITI-08SEP-ANASH",
      excelPassengers: ["ANASH"],
      totalAmount: 23500,
      advancePaid: 5000,
      remainingAmount: 18500,
      paymentMode: "OFFICE CASH",
      payments: [paymentPayload(5000, "OFFICE CASH", "12/07/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "p-anash-1",
            name: "Anash",
            age: 19,
            gender: "Male",
            phone: "9725974266",
            email: "anash9725@gmail.com",
          }),
        ];
        return {
          name: "Anash",
          fullName: "Anash",
          phone: "9725974266",
          mobile: "9725974266",
          email: "anash9725@gmail.com",
          age: 19,
          gender: "Male",
          numberOfTravelers: 1,
          amount: 5000,
          payment_method: "cash",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          pickupCity: existing?.pickupCity || "Ahmedabad",
          passengers: { details: trainDetails(), persons },
          notes: "Excel: advance ₹5,000 OFFICE CASH 12/07/2026; rem 18500",
          adminNotes: "08 SEP SPITI - Anash (1 Pax)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 23500),
          },
          trainNames: ["Anash"],
          activeNames: ["Anash"],
        };
      },
    },
    {
      key: "PRINCE",
      bookingId: "BK-SPITI-08SEP-PRINCE",
      excelPassengers: ["PRINCE", "SNEHA", "SAUMYA", "VANSHIKA", "MANAV", "HEMAL", "LAKHAN"],
      totalAmount: 161000, // 35000 + 18000*7
      advancePaid: 35000,
      remainingAmount: 126000,
      paymentMode: "OFFICE CASH",
      payments: [paymentPayload(35000, "OFFICE CASH", "15/07/2026")],
      build: async (existing) => {
        const persons = [
          person({ id: "p-prince-1", name: "Prince", age: 23, gender: "Male", phone: "8128492232", email: "prince8128@gmail.com" }),
          person({ id: "p-prince-2", name: "Sneha", age: 23, gender: "Female", phone: "8128492232", email: null }),
          person({ id: "p-prince-3", name: "Saumya", age: 22, gender: "Male", phone: "8128492232", email: null }),
          person({ id: "p-prince-4", name: "Vanshika", age: 22, gender: "Female", phone: "7575026779", email: null }),
          person({ id: "p-prince-5", name: "Manav", age: 24, gender: "Male", phone: "8128492232", email: null, roomSharing: "Triple Sharing" }),
          person({ id: "p-prince-6", name: "Hemal", age: 30, gender: "Male", phone: "8128492232", email: null, roomSharing: "Triple Sharing" }),
          person({ id: "p-prince-7", name: "Lakhan", age: 23, gender: "Male", phone: "8128492232", email: null, roomSharing: "Triple Sharing" }),
        ];
        return {
          name: "Prince",
          fullName: "Prince",
          phone: "8128492232",
          mobile: "8128492232",
          email: "prince8128@gmail.com",
          age: 23,
          gender: "Male",
          numberOfTravelers: 7,
          amount: 35000,
          payment_method: "cash",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          pickupCity: existing?.pickupCity || "Ahmedabad",
          passengers: {
            details: { ...trainDetails(), roomType: "Quad / Triple Sharing" },
            persons,
          },
          notes: "Excel: advance ₹35,000 OFFICE CASH 15/07/2026; rem 18000 x7 (Riddhi is separate booking)",
          adminNotes: "08 SEP SPITI - Prince Group (7 Pax; Riddhi separate)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 23000),
          },
          trainNames: persons.map((p) => p.name),
          activeNames: persons.map((p) => p.name),
        };
      },
    },
    {
      key: "RIDDHI",
      bookingId: "BK-LFGN4FFJOOQV",
      excelPassengers: ["RIDDHI"],
      totalAmount: 23000,
      advancePaid: 5000,
      remainingAmount: 18000,
      paymentMode: "CHAKABHAI",
      payments: [paymentPayload(5000, "CHAKABHAI", "03/08/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "main",
            name: "Gondalia Riddhi",
            age: 27,
            gender: "Female",
            phone: existing?.phone || "7046104371",
            email: existing?.email || "gondaliyariddhi7046@gmail.com",
          }),
        ];
        return {
          name: existing?.name || "Gondalia Riddhi",
          fullName: existing?.fullName || "Gondalia Riddhi",
          phone: existing?.phone || "7046104371",
          mobile: existing?.mobile || existing?.phone || "7046104371",
          email: existing?.email || "gondaliyariddhi7046@gmail.com",
          age: 27,
          gender: "Female",
          numberOfTravelers: 1,
          amount: 5000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          passengers: { details: trainDetails(), persons },
          notes: "Excel: advance ₹5,000 CHAKABHAI 03/08/2026; rem 18000",
          adminNotes: "08 SEP SPITI - Riddhi (1 Pax, separate from Prince)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 23000),
          },
          trainNames: ["Gondalia Riddhi"],
          activeNames: ["Gondalia Riddhi"],
        };
      },
    },
    {
      key: "GAUTAM",
      bookingId: "BK-YK6XZ5R8WWNF",
      excelPassengers: ["GAUTAM"],
      totalAmount: 23000,
      advancePaid: 5000,
      remainingAmount: 18000,
      paymentMode: "NIKULKUMAR",
      payments: [paymentPayload(5000, "NIKULKUMAR", "15/08/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "main",
            name: "Gautam Jain",
            age: 24,
            gender: "Male",
            phone: existing?.phone || "6376912885",
            email: existing?.email || "gjgautam777@gmail.com",
            foodPreference: "Jain Food",
          }),
        ];
        return {
          name: existing?.name || "Gautam Jain",
          fullName: existing?.fullName || "Gautam Jain",
          phone: existing?.phone || "6376912885",
          mobile: existing?.mobile || existing?.phone || "6376912885",
          email: existing?.email || "gjgautam777@gmail.com",
          age: 24,
          gender: "Male",
          numberOfTravelers: 1,
          amount: 5000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          passengers: { details: trainDetails(), persons },
          notes: "Excel: advance ₹5,000 NIKULKUMAR 15/08/2026; rem 18000",
          adminNotes: "08 SEP SPITI - Gautam (1 Pax)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 23000),
          },
          trainNames: ["Gautam Jain"],
          activeNames: ["Gautam Jain"],
        };
      },
    },
    {
      key: "TEJAL",
      bookingId: "BK-YO8X99E2KJ9E",
      excelPassengers: ["TEJAL"],
      totalAmount: 23000,
      advancePaid: 5000,
      remainingAmount: 18000,
      paymentMode: "NIKULKUMAR",
      payments: [paymentPayload(5000, "NIKULKUMAR", "17/08/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "main",
            name: "Parmar Tejal",
            age: 25,
            gender: "Female",
            phone: existing?.phone || "8511217072",
            email: existing?.email || null,
            foodPreference: "Jain Food",
          }),
        ];
        return {
          name: existing?.name || "Parmar Tejal",
          fullName: existing?.fullName || "Parmar Tejal",
          phone: existing?.phone || "8511217072",
          mobile: existing?.mobile || existing?.phone || "8511217072",
          email: existing?.email || null,
          age: 25,
          gender: "Female",
          numberOfTravelers: 1,
          amount: 5000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          passengers: { details: trainDetails(), persons },
          notes: "Excel: advance ₹5,000 NIKULKUMAR 17/08/2026; rem 18000",
          adminNotes: "08 SEP SPITI - Tejal (1 Pax)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 23000),
          },
          trainNames: ["Parmar Tejal"],
          activeNames: ["Parmar Tejal"],
        };
      },
    },
    {
      key: "SANJAY",
      bookingId: "BK-N33GA6S8EN8B",
      excelPassengers: ["SANJAY"],
      totalAmount: 23000,
      advancePaid: 5000,
      remainingAmount: 18000,
      paymentMode: "NIKULKUMAR",
      payments: [paymentPayload(5000, "NIKULKUMAR", "19/08/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "main",
            name: "Sanjay Vasaiya",
            age: 24,
            gender: "Male",
            phone: existing?.phone || "9328197074",
            email: existing?.email || null,
          }),
        ];
        return {
          name: existing?.name || "Sanjay Vasaiya",
          fullName: existing?.fullName || "Sanjay Vasaiya",
          phone: existing?.phone || "9328197074",
          mobile: existing?.mobile || existing?.phone || "9328197074",
          email: existing?.email || null,
          age: 24,
          gender: "Male",
          numberOfTravelers: 1,
          amount: 5000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          passengers: { details: trainDetails(), persons },
          notes: "Excel: advance ₹5,000 NIKULKUMAR 19/08/2026; rem 18000",
          adminNotes: "08 SEP SPITI - Sanjay (1 Pax)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 23000),
          },
          trainNames: ["Sanjay Vasaiya"],
          activeNames: ["Sanjay Vasaiya"],
        };
      },
    },
    {
      key: "MEET",
      bookingId: "BK-JTUSUME2C7WL",
      excelPassengers: ["MEET"],
      totalAmount: 24675,
      advancePaid: 5250,
      remainingAmount: 19425,
      paymentMode: "YAC",
      payments: [paymentPayload(5250, "YAC", "01-08-2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "p-meet-1",
            name: "Meet Asheshkumar Gandhi",
            age: 26,
            gender: "Male",
            phone: existing?.phone || "7046662804",
            email: existing?.email || null,
            roomSharing: "Triple Sharing",
          }),
        ];
        return {
          name: existing?.name || "Meet Asheshkumar Gandhi",
          fullName: existing?.fullName || "Meet Asheshkumar Gandhi",
          phone: existing?.phone || "7046662804",
          mobile: existing?.mobile || existing?.phone || "7046662804",
          email: existing?.email || null,
          age: 26,
          gender: "Male",
          numberOfTravelers: 1,
          amount: 5250,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          passengers: {
            details: { ...trainDetails(), roomType: "Triple Sharing" },
            persons,
          },
          notes: "Excel: advance ₹5,250 YAC 01-08-2026; rem 19425",
          adminNotes: "08 SEP SPITI - Meet (1 Pax)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: threeAcItems(persons, 24675),
          },
          trainNames: ["Meet Asheshkumar Gandhi"],
          activeNames: ["Meet Asheshkumar Gandhi"],
        };
      },
    },
    {
      key: "HARSH_RUCHI",
      bookingId: "BK-JYCV22CUR42H",
      excelPassengers: ["HARSH", "RUCHI"],
      // Couple sheet lists rem 42000 on both rows → group remaining (not 84000)
      totalAmount: 52000,
      advancePaid: 10000,
      remainingAmount: 42000,
      paymentMode: "CHAKABHAI",
      payments: [paymentPayload(10000, "CHAKABHAI", "04/08/2026")],
      build: async (existing) => {
        const persons = [
          person({
            id: "main",
            name: "Mr. Harsh modi",
            firstName: "Harsh",
            lastName: "modi",
            age: 28,
            gender: "Male",
            phone: "7228922285",
            email: "modiharsh101@gmail.com",
            roomSharing: "Double Sharing",
          }),
          person({
            id: "gen-co-1",
            name: "Mrs. Ruchi Modi",
            firstName: "Ruchi",
            lastName: "Modi",
            age: 27,
            gender: "Female",
            phone: "7228922285",
            email: "modiharsh101@gmail.com",
            roomSharing: "Double Sharing",
          }),
        ];
        return {
          name: "Mr. Harsh modi",
          fullName: "Mr. Harsh modi",
          phone: "7228922285",
          mobile: "7228922285",
          email: "modiharsh101@gmail.com",
          age: 28,
          gender: "Male",
          numberOfTravelers: 2,
          amount: 10000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          passengers: {
            details: { ...trainDetails(), roomType: "Double Sharing" },
            persons,
          },
          notes: "Excel: advance ₹10,000 CHAKABHAI 04/08/2026; group rem 42000 (listed on both rows)",
          adminNotes: "08 SEP SPITI - Harsh & Ruchi (2 Pax)",
          sourceMeta: {
            ...(existing?.sourceMeta || {}),
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: [
              {
                id: "transport-main-0",
                qty: 1,
                name: "3 TIER AC TRAIN [Mr. Harsh modi]",
                rate: 23000,
                category: "transport",
                personId: "main",
                variantName: "3 TIER AC TRAIN",
              },
              {
                id: "accom-main-0",
                qty: 1,
                name: "DOUBLE SHARING [Mr. Harsh modi]",
                rate: 3000,
                category: "accommodation",
                personId: "main",
                variantName: "DOUBLE SHARING",
              },
              {
                id: "transport-gen-co-1-1",
                qty: 1,
                name: "3 TIER AC TRAIN [Mrs. Ruchi Modi]",
                rate: 23000,
                category: "transport",
                personId: "gen-co-1",
                variantName: "3 TIER AC TRAIN",
              },
              {
                id: "accom-gen-co-1-1",
                qty: 1,
                name: "DOUBLE SHARING [Mrs. Ruchi Modi]",
                rate: 3000,
                category: "accommodation",
                personId: "gen-co-1",
                variantName: "DOUBLE SHARING",
              },
            ],
          },
          trainNames: ["Mr. Harsh modi", "Mrs. Ruchi Modi"],
          activeNames: ["Mr. Harsh modi", "Mrs. Ruchi Modi"],
        };
      },
    },
    {
      key: "CHIRAG_DRASHTI",
      bookingId: "BK-SPITI-08SEP-CHIRAG",
      excelPassengers: ["CHIRAG", "DRASHTI"],
      totalAmount: 52000,
      advancePaid: 10000,
      remainingAmount: 42000,
      paymentMode: "NIKULKUMAR",
      payments: [paymentPayload(10000, "NIKULKUMAR", "22/08/2026")],
      createIfMissing: true,
      build: async () => {
        const persons = [
          person({
            id: "main",
            name: "Chirag",
            age: 25,
            gender: "Male",
            phone: "0000000000",
            email: null,
            roomSharing: "Double Sharing",
          }),
          person({
            id: "gen-co-1",
            name: "Drashti",
            age: 25,
            gender: "Female",
            phone: "0000000000",
            email: null,
            roomSharing: "Double Sharing",
          }),
        ];
        return {
          name: "Chirag",
          fullName: "Chirag",
          phone: "0000000000",
          mobile: "0000000000",
          email: null,
          age: 25,
          gender: "Male",
          numberOfTravelers: 2,
          amount: 10000,
          payment_method: "upi",
          paymentStatus: "Partial",
          status: "confirmed",
          trainTicketStatus: "CONFIRMED",
          trainTicketRequired: true,
          departureDate: DEP_DATE,
          pickupCity: "Ahmedabad",
          tripId: TRIP_ID,
          tripName: trip.title,
          passengers: {
            details: { ...trainDetails(), roomType: "Double Sharing" },
            persons,
          },
          notes: "Excel: advance ₹10,000 NIKULKUMAR 22/08/2026; group rem 42000. Phone TBD — update when known.",
          adminNotes: "08 SEP SPITI - Chirag & Drashti (2 Pax) · created from Excel reconcile (was missing)",
          sourceMeta: {
            tripId: TRIP_ID,
            tripName: trip.title,
            departureDate: DEP_DATE.toISOString(),
            excelReconcile: "2026-08-26",
            bookingItems: [
              {
                id: "transport-main-0",
                qty: 1,
                name: "3 TIER AC TRAIN [Chirag]",
                rate: 23000,
                category: "transport",
                personId: "main",
                variantName: "3 TIER AC TRAIN",
              },
              {
                id: "accom-main-0",
                qty: 1,
                name: "DOUBLE SHARING [Chirag]",
                rate: 3000,
                category: "accommodation",
                personId: "main",
                variantName: "DOUBLE SHARING",
              },
              {
                id: "transport-gen-co-1-1",
                qty: 1,
                name: "3 TIER AC TRAIN [Drashti]",
                rate: 23000,
                category: "transport",
                personId: "gen-co-1",
                variantName: "3 TIER AC TRAIN",
              },
              {
                id: "accom-gen-co-1-1",
                qty: 1,
                name: "DOUBLE SHARING [Drashti]",
                rate: 3000,
                category: "accommodation",
                personId: "gen-co-1",
                variantName: "DOUBLE SHARING",
              },
            ],
          },
          trainNames: ["Chirag", "Drashti"],
          activeNames: ["Chirag", "Drashti"],
        };
      },
    },
  ];

  const report = [];

  for (const t of targets) {
    const existing = await prisma.booking.findUnique({ where: { bookingId: t.bookingId } });
    if (!existing && !t.createIfMissing) {
      log(`❌ ${t.key}: booking ${t.bookingId} not found`);
      report.push({ key: t.key, bookingId: t.bookingId, error: "NOT_FOUND" });
      continue;
    }

    const built = await t.build(existing);
    const { trainNames, cancelTrain, activeNames, ...bookingFields } = built;

    const before = existing
      ? {
          totalAmount: existing.totalAmount,
          advancePaid: existing.advancePaid,
          remainingAmount: existing.remainingAmount,
          paymentMode: existing.paymentMode,
          numberOfTravelers: existing.numberOfTravelers,
          trainTicketStatus: existing.trainTicketStatus,
        }
      : null;

    const after = {
      totalAmount: t.totalAmount,
      advancePaid: t.advancePaid,
      remainingAmount: t.remainingAmount,
      paymentMode: t.paymentMode,
      numberOfTravelers: bookingFields.numberOfTravelers,
      trainTicketStatus: "CONFIRMED",
    };

    const gaps = [];
    if (!existing) gaps.push("MISSING_BOOKING");
    else {
      if (Number(existing.totalAmount) !== t.totalAmount) gaps.push(`total ${existing.totalAmount}→${t.totalAmount}`);
      if (Number(existing.advancePaid) !== t.advancePaid) gaps.push(`paid ${existing.advancePaid}→${t.advancePaid}`);
      if (Number(existing.remainingAmount) !== t.remainingAmount)
        gaps.push(`due ${existing.remainingAmount}→${t.remainingAmount}`);
      if (String(existing.paymentMode || "") !== t.paymentMode) gaps.push(`mode ${existing.paymentMode}→${t.paymentMode}`);
    }

    log(`\n── ${t.key} (${t.bookingId}) ──`);
    log(`  Excel pax: ${t.excelPassengers.join(", ")}`);
    log(`  Active: ${activeNames.join(", ")}`);
    log(`  Before: ${JSON.stringify(before)}`);
    log(`  After:  ${JSON.stringify(after)}`);
    log(`  Gaps:   ${gaps.length ? gaps.join("; ") : "none (already matched)"}`);

    if (APPLY) {
      if (!existing) {
        await prisma.booking.create({
          data: {
            bookingId: t.bookingId,
            tenantId: "default",
            tripId: TRIP_ID,
            tripName: trip.title,
            ...bookingFields,
            totalAmount: t.totalAmount,
            advancePaid: t.advancePaid,
            remainingAmount: t.remainingAmount,
            paymentMode: t.paymentMode,
            createdAt: istDate("22/08/2026"),
          },
        });
        log("  ✅ Created booking");
      } else {
        await prisma.booking.update({
          where: { bookingId: t.bookingId },
          data: {
            ...bookingFields,
            totalAmount: t.totalAmount,
            advancePaid: t.advancePaid,
            remainingAmount: t.remainingAmount,
            paymentMode: t.paymentMode,
          },
        });
        log("  ✅ Updated booking");
      }
    }

    const payReport = await upsertClearedPayments(t.bookingId, t.payments);
    log(`  Payments: ${JSON.stringify(payReport.actions)}`);

    const trainReport = await syncTrainTickets(t.bookingId, trainNames, {
      cancelNames: cancelTrain || [],
    });
    log(`  Trains: ${JSON.stringify(trainReport)}`);

    report.push({
      key: t.key,
      bookingId: t.bookingId,
      excelPassengers: t.excelPassengers,
      before,
      after,
      gaps,
      payments: t.payments.map((p) => ({
        amount: p.amount,
        mode: p.paymentMode,
        date: p.paymentDate.toISOString().slice(0, 10),
        accountId: p.collectionAccountId,
      })),
    });
  }

  // Summary table
  log("\n=== MAPPING / RECON SUMMARY ===");
  for (const r of report) {
    log(
      `${r.bookingId.padEnd(24)} | ${String(r.excelPassengers?.join("+") || r.error).padEnd(40)} | gaps: ${
        r.gaps?.join("; ") || r.error || "ok"
      }`,
    );
  }

  if (!APPLY) {
    log("\nDry-run only. Re-run with --apply to write booking + OpsClientPayment + TrainTicket changes.");
  } else {
    log("\n✅ Apply complete. Verify Departure Hub SPT-1_2026-09-08 Passengers + Finance.");
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
