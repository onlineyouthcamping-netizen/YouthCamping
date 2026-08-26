/**
 * Targeted fix for BK-SPITI-08SEP-KHUSHI financials (SPT-1 2026-09-08).
 *
 * Prefer this over re-running full reconcileSpiti08SepExcel.js --apply.
 *
 * Excel meaning (NOT "₹21,000 per person package"):
 * - Group advance on first named row: ₹21,000 (YAC 08/07/2026)
 * - Per-person remaining: 18,500 + 18,500 + 15,500 = ₹52,500 due
 * - Group package total: 21,000 + 52,500 = ₹73,500
 * - Line items: 25,500 / 25,500 / 22,500 (= rem + equal share of advance)
 *
 * Stale syncSpiti08SepBookings.js previously wrote totalAmount=95,000
 * (wrongly treating cancelled Umangiben as a paid seat).
 *
 * Usage:
 *   node src/scripts/fixKhushiSpiti08SepAmounts.js           # dry-run
 *   node src/scripts/fixKhushiSpiti08SepAmounts.js --apply   # write
 */
"use strict";

require("dotenv").config();
const { prisma } = require("../lib/prisma");

const APPLY = process.argv.includes("--apply");
const BOOKING_ID = "BK-SPITI-08SEP-KHUSHI";
const TRIP_ID = "SPT-1";
const DEP_DATE = new Date("2026-09-08T00:00:00.000Z");
const YAC_ACCOUNT = "cmsu4pmb00000x052sec8pu8t";

const EXPECTED = {
  totalAmount: 73500,
  advancePaid: 21000,
  remainingAmount: 52500,
  numberOfTravelers: 3,
  paymentMode: "YAC",
  paymentStatus: "Partial",
};

function istDate(ddmmyyyy) {
  const m = String(ddmmyyyy).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) throw new Error(`Bad date: ${ddmmyyyy}`);
  const [, d, mo, y] = m;
  return new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00.000Z`);
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
  console.log(`\n=== Fix Khushi Spiti 08 Sep (${APPLY ? "APPLY" : "DRY-RUN"}) ===\n`);

  const existing = await prisma.booking.findUnique({ where: { bookingId: BOOKING_ID } });
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
      id: "p-khushi-1",
      name: "Khushi",
      age: 24,
      gender: "Female",
      phone: "7069755307",
      email: "khushi7069@gmail.com",
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-khushi-2",
      name: "Rushvi",
      age: 24,
      gender: "Female",
      phone: "9327623442",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
    {
      id: "p-khushi-3",
      name: "Umangiben",
      age: 32,
      gender: "Female",
      phone: "8128511964",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CANCELLED",
      isCancelled: true,
      notes: "Cancelled by customer (not on Excel sheet)",
    },
    {
      id: "p-khushi-4",
      name: "Khushbuben",
      age: 24,
      gender: "Female",
      phone: "9327359374",
      email: null,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    },
  ];

  const prevMeta =
    existing.sourceMeta && typeof existing.sourceMeta === "object"
      ? existing.sourceMeta
      : {};

  const bookingPatch = {
    name: "Khushi",
    fullName: "Khushi",
    phone: "7069755307",
    mobile: "7069755307",
    email: "khushi7069@gmail.com",
    age: 24,
    gender: "Female",
    numberOfTravelers: EXPECTED.numberOfTravelers,
    totalAmount: EXPECTED.totalAmount,
    amount: 21000,
    advancePaid: EXPECTED.advancePaid,
    remainingAmount: EXPECTED.remainingAmount,
    paymentMode: EXPECTED.paymentMode,
    payment_method: "upi",
    paymentStatus: EXPECTED.paymentStatus,
    status: "confirmed",
    trainTicketStatus: "CONFIRMED",
    trainTicketRequired: true,
    departureDate: DEP_DATE,
    pickupCity: existing.pickupCity || "Ahmedabad",
    passengers: {
      details: {
        roomType: "Quad Sharing",
        trainClass: "3 TIER AC TRAIN",
        trainOption: "3 TIER AC TRAIN",
        ticketStatus: "CONFIRMED",
      },
      persons,
    },
    notes:
      "Excel: advance ₹21,000 YAC 08/07/2026; rem 18500+18500+15500 (Umangiben cancelled)",
    adminNotes: "08 SEP SPITI - Khushi Group (Excel 3 pax; Umangiben cancelled)",
    sourceMeta: {
      ...prevMeta,
      tripId: TRIP_ID,
      tripName: prevMeta.tripName || existing.tripName,
      departureDate: DEP_DATE.toISOString(),
      paymentMode: "Partial Payment",
      excelReconcile: "2026-08-26",
      khushiAmountFix: "2026-08-26",
      bookingItems: [
        threeAcItem("p-khushi-1", "Khushi", 25500),
        threeAcItem("p-khushi-2", "Rushvi", 25500),
        threeAcItem("p-khushi-4", "Khushbuben", 22500),
      ],
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
    advancePaid: existing.advancePaid,
    remainingAmount: existing.remainingAmount,
    numberOfTravelers: existing.numberOfTravelers,
    opsPayments: ops,
  });
  console.log("After: ", EXPECTED);
  console.log("Gaps:  ", gaps.length ? gaps.join("; ") : "none (already matched)");
  console.log(
    "UI expect after ycadmin passengerAmounts fix: group Total ₹73,500 | Paid ₹21,000 | Balance ₹52,500; pax rem 18500 / 18500 / 15500",
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
  console.log("✅ Updated booking fields + sourceMeta.bookingItems");

  if (needsPaymentRewrite) {
    await prisma.opsClientPayment.deleteMany({ where: { bookingId: BOOKING_ID } });
    const row = await prisma.opsClientPayment.create({
      data: {
        tenantId: "default",
        bookingId: BOOKING_ID,
        amount: EXPECTED.advancePaid,
        paymentMode: "YAC",
        collectionAccountId: YAC_ACCOUNT,
        transactionId: "YAC",
        paymentDate: istDate("08/07/2026"),
        status: "Verified",
        approvalStatus: "APPROVED_FOUNDER",
        remarks:
          "Khushi amount fix SPT-1_2026-09-08 · YAC · 08/07/2026 · cleared to match Excel",
      },
      select: { id: true, amount: true },
    });
    console.log("✅ Replaced opsClientPayments with", row);
    try {
      const legacy = await prisma.payment.deleteMany({ where: { bookingId: BOOKING_ID } });
      if (legacy.count) console.log(`✅ Deleted ${legacy.count} legacy Payment row(s)`);
    } catch (e) {
      console.warn("Legacy Payment cleanup skipped:", e.message);
    }
  } else {
    console.log("✅ Cleared ops payment already correct; left unchanged");
  }

  console.log("\nDone. Refresh Departure Workspace passengers for SPT-1_2026-09-08.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
