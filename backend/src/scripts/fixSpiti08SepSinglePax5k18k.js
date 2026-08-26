/**
 * Targeted fix for Spiti 08 Sep single-pax bookings that Excel shows as
 * paid ₹5,000 + rem ₹18,000 = package ₹23,000 (not 23500/18500).
 *
 * Prefer this over re-running full reconcileSpiti08SepExcel.js --apply.
 *
 * Targets (Excel screenshot 26/08/2026):
 * - RIDDHI  → BK-LFGN4FFJOOQV  · CHAKABHAI · 03/08/2026
 * - GAUTAM  → BK-YK6XZ5R8WWNF  · NIKULKUMAR · 15/08/2026
 * - TEJAL   → BK-YO8X99E2KJ9E  · NIKULKUMAR · 17/08/2026
 * - SANJAY  → BK-N33GA6S8EN8B  · NIKULKUMAR · 19/08/2026
 *
 * Does NOT touch Khushi (unequal rem), Anash (rem 18500), Prince, couples, etc.
 *
 * Usage:
 *   node src/scripts/fixSpiti08SepSinglePax5k18k.js           # dry-run
 *   node src/scripts/fixSpiti08SepSinglePax5k18k.js --apply   # write
 */
"use strict";

require("dotenv").config();
const { prisma } = require("../lib/prisma");

const APPLY = process.argv.includes("--apply");
const TRIP_ID = "SPT-1";
const DEP_DATE = new Date("2026-09-08T00:00:00.000Z");

const ACCOUNTS = {
  NIKULKUMAR: "cmsu4pmb00001x0524bfj8tod",
  CHAKABHAI: null,
};

const EXPECTED = {
  totalAmount: 23000,
  advancePaid: 5000,
  remainingAmount: 18000,
  numberOfTravelers: 1,
  paymentStatus: "Partial",
};

const TARGETS = [
  {
    key: "RIDDHI",
    bookingId: "BK-LFGN4FFJOOQV",
    excelName: "RIDDHI",
    personName: "Gondalia Riddhi",
    paymentMode: "CHAKABHAI",
    paymentDate: "03/08/2026",
  },
  {
    key: "GAUTAM",
    bookingId: "BK-YK6XZ5R8WWNF",
    excelName: "GAUTAM",
    personName: "Gautam Jain",
    paymentMode: "NIKULKUMAR",
    paymentDate: "15/08/2026",
  },
  {
    key: "TEJAL",
    bookingId: "BK-YO8X99E2KJ9E",
    excelName: "TEJAL",
    personName: "Parmar Tejal",
    paymentMode: "NIKULKUMAR",
    paymentDate: "17/08/2026",
  },
  {
    key: "SANJAY",
    bookingId: "BK-N33GA6S8EN8B",
    excelName: "SANJAY",
    personName: "Sanjay Vasaiya",
    paymentMode: "NIKULKUMAR",
    paymentDate: "19/08/2026",
  },
];

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

function isCleared(p) {
  return (
    String(p.approvalStatus || "").toUpperCase() === "APPROVED_FOUNDER" ||
    String(p.status || "").toLowerCase() === "verified" ||
    String(p.status || "").toLowerCase() === "success"
  );
}

async function fixOne(t) {
  console.log(`\n── ${t.key} (${t.bookingId}) ──`);

  const existing = await prisma.booking.findUnique({
    where: { bookingId: t.bookingId },
  });
  if (!existing) {
    console.error(`❌ Booking ${t.bookingId} not found`);
    return { key: t.key, bookingId: t.bookingId, error: "NOT_FOUND" };
  }

  const ops = await prisma.opsClientPayment.findMany({
    where: { bookingId: t.bookingId },
    select: {
      id: true,
      amount: true,
      status: true,
      approvalStatus: true,
      paymentMode: true,
      paymentDate: true,
      collectionAccountId: true,
    },
  });

  const prevMeta =
    existing.sourceMeta && typeof existing.sourceMeta === "object"
      ? existing.sourceMeta
      : {};
  const existingItems = Array.isArray(prevMeta.bookingItems)
    ? prevMeta.bookingItems
    : [];

  const personsFromBooking =
    existing.passengers &&
    typeof existing.passengers === "object" &&
    Array.isArray(existing.passengers.persons)
      ? existing.passengers.persons
      : null;

  const person =
    (personsFromBooking && personsFromBooking.find((p) => !p.isCancelled)) ||
    (personsFromBooking && personsFromBooking[0]) || {
      id: "main",
      name: t.personName,
      age: existing.age,
      gender: existing.gender,
      phone: existing.phone || existing.mobile,
      email: existing.email,
      trainOption: "3 TIER AC TRAIN",
      roomSharing: "Quad Sharing",
      foodPreference: "Normal Food",
      status: "CONFIRMED",
      isCancelled: false,
    };

  const personId = person.id || "main";
  const personName = person.name || t.personName;
  const bookingItems = [threeAcItem(personId, personName, EXPECTED.totalAmount)];

  const bookingPatch = {
    amount: EXPECTED.advancePaid,
    advancePaid: EXPECTED.advancePaid,
    remainingAmount: EXPECTED.remainingAmount,
    totalAmount: EXPECTED.totalAmount,
    paymentMode: t.paymentMode,
    payment_method:
      t.paymentMode === "OFFICE CASH" ? "cash" : "upi",
    paymentStatus: EXPECTED.paymentStatus,
    status: existing.status === "cancelled" ? existing.status : "confirmed",
    numberOfTravelers: EXPECTED.numberOfTravelers,
    trainTicketStatus: "CONFIRMED",
    trainTicketRequired: true,
    departureDate: existing.departureDate || DEP_DATE,
    notes: `Excel: advance ₹5,000 ${t.paymentMode} ${t.paymentDate}; rem 18000`,
    adminNotes:
      existing.adminNotes ||
      `08 SEP SPITI - ${t.key} (1 Pax)`,
    sourceMeta: {
      ...prevMeta,
      tripId: prevMeta.tripId || TRIP_ID,
      tripName: prevMeta.tripName || existing.tripName,
      departureDate: DEP_DATE.toISOString(),
      paymentMode: "Partial Payment",
      excelReconcile: "2026-08-26",
      singlePax5k18kFix: "2026-08-26",
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
  if (Number(existing.amount) !== EXPECTED.advancePaid) {
    gaps.push(`amount ${existing.amount}→${EXPECTED.advancePaid}`);
  }
  if (Number(existing.remainingAmount) !== EXPECTED.remainingAmount) {
    gaps.push(`due ${existing.remainingAmount}→${EXPECTED.remainingAmount}`);
  }
  if (String(existing.paymentMode || "") !== t.paymentMode) {
    gaps.push(`mode ${existing.paymentMode}→${t.paymentMode}`);
  }

  const itemOk =
    existingItems.length === 1 &&
    Number(existingItems[0]?.rate) === EXPECTED.totalAmount &&
    existingItems[0]?.personId;
  if (!itemOk) {
    gaps.push(
      `bookingItems → 1× ₹${EXPECTED.totalAmount} (was ${existingItems.length} rows: ${existingItems
        .map((i) => i.rate)
        .join(",")})`,
    );
  }

  const cleared = ops.filter(isCleared);
  const clearedSum = cleared.reduce((s, p) => s + Number(p.amount || 0), 0);
  const payOk =
    cleared.length === 1 &&
    clearedSum === EXPECTED.advancePaid &&
    String(cleared[0].paymentMode || "") === t.paymentMode;
  if (!payOk) {
    gaps.push(
      `opsPayments → single cleared ₹${EXPECTED.advancePaid} ${t.paymentMode} (was n=${ops.length} clearedSum=${clearedSum} modes=${ops
        .map((p) => `${p.paymentMode}/${p.status}`)
        .join(",") || "none"})`,
    );
  }

  const before = {
    totalAmount: existing.totalAmount,
    amount: existing.amount,
    advancePaid: existing.advancePaid,
    remainingAmount: existing.remainingAmount,
    paymentMode: existing.paymentMode,
    itemRates: existingItems.map((i) => ({ name: i.name, rate: i.rate })),
    opsPayments: ops,
  };
  const after = {
    totalAmount: EXPECTED.totalAmount,
    amount: EXPECTED.advancePaid,
    advancePaid: EXPECTED.advancePaid,
    remainingAmount: EXPECTED.remainingAmount,
    paymentMode: t.paymentMode,
    perPax: {
      package: EXPECTED.totalAmount,
      paid: EXPECTED.advancePaid,
      rem: EXPECTED.remainingAmount,
    },
  };

  console.log("  Before:", JSON.stringify(before));
  console.log("  After: ", JSON.stringify(after));
  console.log("  Gaps:  ", gaps.length ? gaps.join("; ") : "none (already matched)");

  if (!APPLY) {
    return {
      key: t.key,
      bookingId: t.bookingId,
      excelName: t.excelName,
      before,
      after,
      gaps,
      applied: false,
    };
  }

  await prisma.booking.update({
    where: { bookingId: t.bookingId },
    data: bookingPatch,
  });
  console.log("  ✅ Updated booking fields + sourceMeta.bookingItems (1×23000)");

  if (!payOk) {
    await prisma.opsClientPayment.deleteMany({
      where: { bookingId: t.bookingId },
    });
    const row = await prisma.opsClientPayment.create({
      data: {
        tenantId: "default",
        bookingId: t.bookingId,
        amount: EXPECTED.advancePaid,
        paymentMode: t.paymentMode,
        collectionAccountId: ACCOUNTS[t.paymentMode] ?? null,
        transactionId: t.paymentMode,
        paymentDate: istDate(t.paymentDate),
        status: "Verified",
        approvalStatus: "APPROVED_FOUNDER",
        remarks: `Single-pax 5k/18k fix SPT-1_2026-09-08 · ${t.paymentMode} · ${t.paymentDate} · ₹5,000 cleared to match Excel`,
      },
      select: { id: true, amount: true, paymentMode: true },
    });
    console.log("  ✅ Replaced opsClientPayments with", row);
    try {
      const legacy = await prisma.payment.deleteMany({
        where: { bookingId: t.bookingId },
      });
      if (legacy.count) {
        console.log(`  ✅ Deleted ${legacy.count} legacy Payment row(s)`);
      }
    } catch (e) {
      console.warn("  Legacy Payment cleanup skipped:", e.message);
    }
  } else {
    console.log("  ✅ Cleared ops payment already correct; left unchanged");
  }

  return {
    key: t.key,
    bookingId: t.bookingId,
    excelName: t.excelName,
    before,
    after,
    gaps,
    applied: true,
  };
}

async function main() {
  console.log(
    `\n=== Fix Spiti 08 Sep single-pax 5k/18k (${APPLY ? "APPLY" : "DRY-RUN"}) ===\n`,
  );
  console.log(
    "Targets: RIDDHI, GAUTAM, TEJAL, SANJAY → Total ₹23,000 | Paid ₹5,000 | Balance ₹18,000",
  );

  const report = [];
  for (const t of TARGETS) {
    report.push(await fixOne(t));
  }

  console.log("\n=== SUMMARY ===");
  for (const r of report) {
    if (r.error) {
      console.log(`${r.key.padEnd(8)} ${r.bookingId} ERROR ${r.error}`);
      continue;
    }
    console.log(
      `${r.key.padEnd(8)} ${r.bookingId} | ${r.before.totalAmount}/${r.before.advancePaid}/${r.before.remainingAmount} → ${r.after.totalAmount}/${r.after.advancePaid}/${r.after.remainingAmount} | gaps: ${
        r.gaps.length ? r.gaps.join("; ") : "none"
      }`,
    );
  }

  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to write.");
  } else {
    console.log(
      "\nDone. Refresh Departure Workspace passengers for SPT-1_2026-09-08.",
    );
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
