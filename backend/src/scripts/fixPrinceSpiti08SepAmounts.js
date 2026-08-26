/**
 * Targeted fix for BK-SPITI-08SEP-PRINCE financials (SPT-1 2026-09-08).
 *
 * Prefer this over re-running full reconcileSpiti08SepExcel.js --apply.
 *
 * User + Excel (7 active; Riddhi is a separate booking):
 * - Per person: paid ₹5,000 + rem ₹18,000 = package ₹23,000
 * - Group: Total ₹1,61,000 | Paid ₹35,000 | Balance ₹1,26,000
 * - Single cleared OFFICE CASH advance ₹35,000 on 15/07/2026
 *
 * Stale sync left totalAmount=184000 / advancePaid=40000 (Riddhi folded in)
 * and uneven line items (~24605 + room upgrades) that broke per-pax shares.
 *
 * Usage:
 *   node src/scripts/fixPrinceSpiti08SepAmounts.js           # dry-run
 *   node src/scripts/fixPrinceSpiti08SepAmounts.js --apply   # write
 */
"use strict";

require("dotenv").config();
const { prisma } = require("../lib/prisma");

const APPLY = process.argv.includes("--apply");
const BOOKING_ID = "BK-SPITI-08SEP-PRINCE";
const TRIP_ID = "SPT-1";
const DEP_DATE = new Date("2026-09-08T00:00:00.000Z");
const OFFICE_CASH_ACCOUNT = "cmsu4pmb00002x052fdn5vx09";

const EXPECTED = {
  totalAmount: 161000,
  advancePaid: 35000,
  remainingAmount: 126000,
  numberOfTravelers: 7,
  paymentMode: "OFFICE CASH",
  paymentStatus: "Partial",
  perPersonTotal: 23000,
  perPersonPaid: 5000,
  perPersonRem: 18000,
};

function istDate(ddmmyyyy) {
  const m = String(ddmmyyyy)
    .trim()
    .match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) throw new Error(`Bad date: ${ddmmyyyy}`);
  const [, d, mo, y] = m;
  return new Date(
    `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00.000Z`,
  );
}

function threeAcItem(personId, name, rate) {
  return {
    id: `transport-${personId}-0`,
    qty: 1,
    name: `3 TIER AC TRAIN (Ahmedabad) [${name}]`,
    rate,
    category: "transport",
    personId,
    variantName: "3 TIER AC TRAIN",
  };
}

async function main() {
  console.log(
    `\n=== Fix Prince Spiti 08 Sep (${APPLY ? "APPLY" : "DRY-RUN"}) ===\n`,
  );

  const existing = await prisma.booking.findUnique({
    where: { bookingId: BOOKING_ID },
  });
  if (!existing) {
    console.error(`❌ Booking ${BOOKING_ID} not found`);
    process.exit(1);
  }

  const ops = await prisma.opsClientPayment.findMany({
    where: { bookingId: BOOKING_ID },
    select: {
      id: true,
      amount: true,
      status: true,
      approvalStatus: true,
      paymentMode: true,
      paymentDate: true,
    },
  });

  const persons = [
    {
      id: "p-prince-1",
      name: "Prince",
      age: 23,
      gender: "Male",
      phone: "8128492232",
      email: "prince8128@gmail.com",
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-prince-2",
      name: "Sneha",
      age: 23,
      gender: "Female",
      phone: "8128492232",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-prince-3",
      name: "Saumya",
      age: 22,
      gender: "Male",
      phone: "8128492232",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-prince-4",
      name: "Vanshika",
      age: 22,
      gender: "Female",
      phone: "7575026779",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-prince-5",
      name: "Manav",
      age: 24,
      gender: "Male",
      phone: "8128492232",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Triple Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-prince-6",
      name: "Hemal",
      age: 30,
      gender: "Male",
      phone: "8128492232",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Triple Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-prince-7",
      name: "Lakhan",
      age: 23,
      gender: "Male",
      phone: "8128492232",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Triple Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
  ];

  const prevMeta =
    existing.sourceMeta && typeof existing.sourceMeta === "object"
      ? existing.sourceMeta
      : {};

  const bookingItems = persons.map((p) =>
    threeAcItem(p.id, p.name, EXPECTED.perPersonTotal),
  );

  const bookingPatch = {
    name: "Prince",
    fullName: "Prince",
    phone: "8128492232",
    mobile: "8128492232",
    email: "prince8128@gmail.com",
    age: 23,
    gender: "Male",
    numberOfTravelers: EXPECTED.numberOfTravelers,
    totalAmount: EXPECTED.totalAmount,
    amount: EXPECTED.advancePaid,
    advancePaid: EXPECTED.advancePaid,
    remainingAmount: EXPECTED.remainingAmount,
    paymentMode: EXPECTED.paymentMode,
    payment_method: "cash",
    paymentStatus: EXPECTED.paymentStatus,
    status: "confirmed",
    trainTicketStatus: "CONFIRMED",
    trainTicketRequired: true,
    departureDate: DEP_DATE,
    pickupCity: existing.pickupCity || "Ahmedabad",
    passengers: {
      details: {
        roomType: "Quad / Triple Sharing",
        trainClass: "3 TIER AC TRAIN",
        trainOption: "3 TIER AC TRAIN",
        ticketStatus: "CONFIRMED",
      },
      persons,
    },
    notes:
      "Excel: advance ₹35,000 OFFICE CASH 15/07/2026; rem 18000 x7 (Riddhi separate). Per-pax paid ₹5,000 / rem ₹18,000 / package ₹23,000",
    adminNotes: "08 SEP SPITI - Prince Group (7 Pax; Riddhi separate)",
    sourceMeta: {
      ...prevMeta,
      tripId: TRIP_ID,
      tripName: prevMeta.tripName || existing.tripName,
      departureDate: DEP_DATE.toISOString(),
      paymentMode: "Partial Payment",
      excelReconcile: "2026-08-26",
      princeAmountFix: "2026-08-26",
      bookingItems,
    },
  };

  const gaps = [];
  if (Number(existing.totalAmount) !== EXPECTED.totalAmount) {
    gaps.push(`total ${existing.totalAmount}→${EXPECTED.totalAmount}`);
  }
  if (Number(existing.advancePaid) !== EXPECTED.advancePaid) {
    gaps.push(`advancePaid ${existing.advancePaid}→${EXPECTED.advancePaid}`);
  }
  if (Number(existing.remainingAmount) !== EXPECTED.remainingAmount) {
    gaps.push(`due ${existing.remainingAmount}→${EXPECTED.remainingAmount}`);
  }
  if (Number(existing.numberOfTravelers) !== EXPECTED.numberOfTravelers) {
    gaps.push(
      `travelers ${existing.numberOfTravelers}→${EXPECTED.numberOfTravelers}`,
    );
  }

  const existingItems =
    existing.sourceMeta &&
    typeof existing.sourceMeta === "object" &&
    Array.isArray(existing.sourceMeta.bookingItems)
      ? existing.sourceMeta.bookingItems
      : [];
  const itemOk =
    existingItems.length === 7 &&
    existingItems.every(
      (it) => Number(it.rate) === EXPECTED.perPersonTotal && it.personId,
    );
  if (!itemOk) {
    gaps.push(
      `bookingItems → 7× ₹${EXPECTED.perPersonTotal} (was ${existingItems.length} uneven rows)`,
    );
  }

  const clearedOps = ops.filter(
    (p) =>
      String(p.approvalStatus || "").toUpperCase() === "APPROVED_FOUNDER" ||
      String(p.status || "").toLowerCase() === "verified" ||
      String(p.status || "").toLowerCase() === "success",
  );
  const clearedSum = clearedOps.reduce((s, p) => s + Number(p.amount || 0), 0);
  const needsPaymentRewrite =
    clearedSum !== EXPECTED.advancePaid ||
    clearedOps.length !== 1 ||
    Number(clearedOps[0]?.amount) !== EXPECTED.advancePaid;

  if (needsPaymentRewrite) {
    gaps.push(
      `opsPayments sum ${clearedSum} (n=${ops.length}) → single cleared ₹${EXPECTED.advancePaid}`,
    );
  }

  console.log("Before:", {
    totalAmount: existing.totalAmount,
    amount: existing.amount,
    advancePaid: existing.advancePaid,
    remainingAmount: existing.remainingAmount,
    numberOfTravelers: existing.numberOfTravelers,
    itemRates: existingItems.map((i) => ({
      name: i.name,
      rate: i.rate,
      personId: i.personId,
    })),
    opsPayments: ops,
  });
  console.log("After: ", {
    totalAmount: EXPECTED.totalAmount,
    amount: EXPECTED.advancePaid,
    advancePaid: EXPECTED.advancePaid,
    remainingAmount: EXPECTED.remainingAmount,
    numberOfTravelers: EXPECTED.numberOfTravelers,
    perPax: {
      package: EXPECTED.perPersonTotal,
      paid: EXPECTED.perPersonPaid,
      rem: EXPECTED.perPersonRem,
    },
  });
  console.log("Gaps:  ", gaps.length ? gaps.join("; ") : "none (already matched)");
  console.log(
    "UI expect after refresh: group Total ₹1,61,000 | Paid ₹35,000 | Balance ₹1,26,000; each pax Share/Paid ₹5,000 · Balance ₹18,000",
  );

  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to write.");
    await prisma.$disconnect();
    return;
  }

  await prisma.booking.update({
    where: { bookingId: BOOKING_ID },
    data: bookingPatch,
  });
  console.log("✅ Updated booking fields + sourceMeta.bookingItems (7×23000)");

  if (needsPaymentRewrite) {
    await prisma.opsClientPayment.deleteMany({
      where: { bookingId: BOOKING_ID },
    });
    const row = await prisma.opsClientPayment.create({
      data: {
        tenantId: "default",
        bookingId: BOOKING_ID,
        amount: EXPECTED.advancePaid,
        paymentMode: "OFFICE CASH",
        collectionAccountId: OFFICE_CASH_ACCOUNT,
        transactionId: "OFFICE CASH",
        paymentDate: istDate("15/07/2026"),
        status: "Verified",
        approvalStatus: "APPROVED_FOUNDER",
        remarks:
          "Prince amount fix SPT-1_2026-09-08 · OFFICE CASH · 15/07/2026 · ₹35,000 (7×₹5,000) cleared to match Excel",
      },
      select: { id: true, amount: true },
    });
    console.log("✅ Replaced opsClientPayments with", row);
    try {
      const legacy = await prisma.payment.deleteMany({
        where: { bookingId: { in: [BOOKING_ID, existing.id].filter(Boolean) } },
      });
      if (legacy.count)
        console.log(`✅ Deleted ${legacy.count} legacy Payment row(s)`);
    } catch (e) {
      console.warn("Legacy Payment cleanup skipped:", e.message);
    }
  } else {
    console.log("✅ Cleared ops payment already correct; left unchanged");
  }

  console.log(
    "\nDone. Refresh Departure Workspace passengers for SPT-1_2026-09-08.",
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
