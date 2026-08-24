const { prisma } = require("../lib/prisma");
const cache = require("../lib/cache");
const { TERMINAL_APPROVED } = require("../utils/collectionVerification");
const {
  getPeriodBounds,
  createdAtInPeriod,
  collectionOccurredInPeriod,
} = require("../utils/istDateRange");

const LIVE_BOOKING_STATUS = {
  notIn: ["cancelled", "CANCELLED", "Cancelled", "rejected", "REJECTED"],
};

const CONFIRMED_STATUS = { in: ["confirmed", "Confirmed", "paid", "Paid"] };

function hasPerm(user, requiredPerm) {
  const role = user?.role;
  const userPerms = user?.permissions || user?.customPermissions || [];
  if (role === "superadmin" || role === "super_admin" || role === "founder") {
    return true;
  }
  if (Array.isArray(userPerms)) {
    return userPerms.includes(requiredPerm) || userPerms.includes("*");
  }
  return false;
}

function getDurationInDays(durationStr) {
  const match = String(durationStr || "").match(/(\d+)\s*D/i);
  return match ? parseInt(match[1], 10) : 7;
}

function getShortName(title) {
  return String(title || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

function formatDateDayMonth(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
  });
}

function formatDateDayMonthYear(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function verifiedReceiptWhere(tenantId, timeFilter) {
  const where = {
    tenantId,
    approvalStatus: TERMINAL_APPROVED,
  };
  if (timeFilter) {
    Object.assign(where, timeFilter);
  }
  return where;
}

function outstandingFromTotals(bookingTotal, verifiedTotal) {
  return Math.max(0, Number(bookingTotal || 0) - Number(verifiedTotal || 0));
}

async function computeRawDashboardStats(tenantId, dateFilter, now = new Date()) {
  const bounds = getPeriodBounds(dateFilter, now);
  const createdRange = createdAtInPeriod(bounds);
  const collectionRange = collectionOccurredInPeriod(bounds);
  const todayCollectionRange = collectionOccurredInPeriod({
    start: bounds.startToday,
    end: bounds.endToday,
    now: bounds.endToday,
  });

  const bookingPeriodWhere = { tenantId, status: LIVE_BOOKING_STATUS };
  if (createdRange) bookingPeriodWhere.createdAt = createdRange;

  const taskPeriodWhere = { tenantId };
  if (createdRange) taskPeriodWhere.createdAt = createdRange;

  const sevenDaysLater = new Date(bounds.endToday.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fifteenDaysAgo = new Date(bounds.startToday.getTime() - 15 * 24 * 60 * 60 * 1000);

  const [
    periodBookings,
    liveBookingTotals,
    verifiedAllLive,
    verifiedInPeriod,
    verifiedToday,
    vendorPayoutsToday,
    miscToday,
    recentBookings,
    verifiedLastYear,
    tasksTotal,
    tasksCompleted,
    tasksOverdue,
    tasksPending,
    pendingVendorsResult,
    payVerifyCount,
    aadhaarPendingCount,
    hotelPendingCount,
    roomingPendingCount,
    complaintCount,
    tasksOver24Count,
    missingTicketsCount,
    tempoPendingCount,
    vendorDueTodayFleet,
    admins,
    pendingTasksGroup,
    activeBookings,
    upcomingBookings,
    todayTasks,
  ] = await Promise.all([
    prisma.booking.count({ where: bookingPeriodWhere }),
    prisma.booking.aggregate({
      where: { tenantId, status: LIVE_BOOKING_STATUS },
      _sum: { totalAmount: true },
    }),
    prisma.opsClientPayment.aggregate({
      where: {
        ...verifiedReceiptWhere(tenantId),
        booking: { tenantId, status: LIVE_BOOKING_STATUS },
      },
      _sum: { amount: true },
    }),
    prisma.opsClientPayment.aggregate({
      where: {
        ...verifiedReceiptWhere(tenantId, collectionRange),
        booking: { tenantId, status: LIVE_BOOKING_STATUS },
      },
      _sum: { amount: true },
    }),
    prisma.opsClientPayment.aggregate({
      where: {
        ...verifiedReceiptWhere(tenantId, todayCollectionRange),
        booking: { tenantId, status: LIVE_BOOKING_STATUS },
      },
      _sum: { amount: true },
    }),
    prisma.opsVendorPayment.aggregate({
      where: {
        tenantId,
        approvalStatus: TERMINAL_APPROVED,
        OR: [
          { paymentDate: { gte: bounds.startToday, lte: bounds.endToday } },
          { approvedByFounderAt: { gte: bounds.startToday, lte: bounds.endToday } },
        ],
      },
      _sum: { advancePaid: true },
    }),
    prisma.opsMiscExpense.aggregate({
      where: {
        tenantId,
        createdAt: { gte: bounds.startToday, lte: bounds.endToday },
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        tripName: true,
        amount: true,
        advancePaid: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.opsClientPayment.findMany({
      where: {
        ...verifiedReceiptWhere(tenantId),
        booking: { tenantId, status: LIVE_BOOKING_STATUS },
        OR: [
          { paymentDate: { gte: new Date(`${Number(bounds.todayYmd.slice(0, 4)) - 1}-01-01T00:00:00+05:30`) } },
          {
            AND: [
              { paymentDate: null },
              { createdAt: { gte: new Date(`${Number(bounds.todayYmd.slice(0, 4)) - 1}-01-01T00:00:00+05:30`) } },
            ],
          },
        ],
      },
      select: { amount: true, paymentDate: true, createdAt: true },
    }),
    prisma.bookingTask.count({ where: taskPeriodWhere }),
    prisma.bookingTask.count({
      where: { ...taskPeriodWhere, status: "COMPLETED" },
    }),
    prisma.bookingTask.count({
      where: {
        ...taskPeriodWhere,
        status: { not: "COMPLETED" },
        dueDate: { lt: bounds.now },
      },
    }),
    prisma.bookingTask.count({
      where: {
        ...taskPeriodWhere,
        status: { not: "COMPLETED" },
        OR: [{ dueDate: { gte: bounds.now } }, { dueDate: null }],
      },
    }),
    prisma.opsVendorPayment.aggregate({
      where: {
        tenantId,
        approvalStatus: { not: "REJECTED" },
        remainingPayable: { gt: 0 },
      },
      _sum: { remainingPayable: true },
      _count: true,
    }),
    prisma.bookingVerification.count({
      where: { tenantId, status: "PENDING_VERIFICATION" },
    }),
    prisma.booking.count({
      where: {
        tenantId,
        status: CONFIRMED_STATUS,
        NOT: {
          documents: {
            some: {
              documentType: { in: ["aadhaar", "Aadhaar", "AADHAAR"] },
            },
          },
        },
      },
    }),
    prisma.opsHotelBooking.count({
      where: { tenantId, confirmed: "UNCONFIRMED" },
    }),
    prisma.booking.count({
      where: {
        tenantId,
        status: CONFIRMED_STATUS,
        departureDate: { gte: bounds.startToday },
        opsRoomAllocations: {
          none: {
            allocationStatus: { in: ["ACTIVE", "NIGHT_JOURNEY_BLOCKED"] },
          },
        },
      },
    }),
    prisma.bookingTask.count({
      where: {
        tenantId,
        status: { not: "COMPLETED" },
        title: { contains: "complaint", mode: "insensitive" },
      },
    }),
    prisma.bookingTask.count({
      where: {
        tenantId,
        status: { not: "COMPLETED" },
        createdAt: { lt: new Date(bounds.now.getTime() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.booking.count({
      where: {
        tenantId,
        trainTicketRequired: true,
        trainTicketStatus: { notIn: ["ISSUED", "CONFIRMED"] },
      },
    }),
    prisma.opsTransportFleet.count({
      where: {
        tenantId,
        confirmationStatus: "UNCONFIRMED",
        departureDate: { gte: bounds.startToday },
      },
    }),
    prisma.opsTransportFleet.count({
      where: {
        tenantId,
        paymentDueDate: { gte: bounds.startToday, lte: bounds.endToday },
        balanceAmount: { gt: 0 },
      },
    }),
    prisma.admin.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
      },
    }),
    prisma.bookingTask
      .groupBy({
        by: ["assignedToId"],
        where: {
          tenantId,
          status: { not: "COMPLETED" },
          assignedToId: { not: "" },
        },
        _count: { _all: true },
      })
      .catch(() => []),
    prisma.booking.findMany({
      where: {
        tenantId,
        status: CONFIRMED_STATUS,
        departureDate: {
          gte: fifteenDaysAgo,
          lte: bounds.endToday,
        },
      },
      include: { tripRef: true },
    }),
    prisma.booking.findMany({
      where: {
        tenantId,
        status: CONFIRMED_STATUS,
        departureDate: {
          gt: bounds.endToday,
          lte: sevenDaysLater,
        },
      },
      include: { tripRef: true },
    }),
    prisma.bookingTask.findMany({
      where: {
        tenantId,
        dueDate: {
          gte: bounds.startToday,
          lte: bounds.endToday,
        },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const totalRevenue = verifiedInPeriod?._sum?.amount || 0;
  const pendingPayments = outstandingFromTotals(
    liveBookingTotals?._sum?.totalAmount,
    verifiedAllLive?._sum?.amount,
  );
  const collectionToday = verifiedToday?._sum?.amount || 0;
  const paymentsToday =
    (vendorPayoutsToday?._sum?.advancePaid || 0) + (miscToday?._sum?.amount || 0);
  const netCashInflow = collectionToday - paymentsToday;
  const vendorDueCount = vendorDueTodayFleet || 0;

  const monthMap = {};
  const currentMonthKey = bounds.todayYmd.slice(0, 7);
  monthMap[currentMonthKey] = 0;
  for (const row of verifiedLastYear || []) {
    const when = row.paymentDate || row.createdAt;
    if (!when) continue;
    const mKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
    }).format(new Date(when));
    monthMap[mKey] = (monthMap[mKey] || 0) + (row.amount || 0);
  }
  const formattedMonthlyRevenue = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const mappedRecentBookings = (recentBookings || []).map((b) => ({
    id: b.id,
    customerName: b.name,
    name: b.name,
    userName: b.name || "Guest",
    tripName: b.tripName,
    tripTitle: b.tripName || "Unknown Trip",
    amount: b.totalAmount || b.amount || 0,
    paidAmount: b.advancePaid || 0,
    paymentStatus: b.paymentStatus || null,
    status: b.status,
    createdAt: b.createdAt,
  }));

  const taskCountMap = new Map();
  (pendingTasksGroup || []).forEach((g) => {
    if (g.assignedToId) taskCountMap.set(g.assignedToId, g._count?._all || g._count || 0);
  });

  const adminWorkloads = (admins || []).map((adm) => {
    const pendingTasksCount = taskCountMap.get(adm.id) || 0;
    const fourHoursAgo = new Date(bounds.now.getTime() - 4 * 60 * 60 * 1000);
    const isOnline = adm.lastLoginAt && adm.lastLoginAt >= fourHoursAgo;
    const pct = Math.min(pendingTasksCount * 25, 100);
    let workloadState = "Available";
    let color = "bg-[#2563EB]";
    if (pct >= 75) {
      workloadState = "High";
      color = "bg-[#D97706]";
    } else if (pct > 0) {
      workloadState = "Normal";
      color = "bg-[#16A34A]";
    }
    return {
      name: adm.name || String(adm.email || "staff").split("@")[0],
      isOnline: !!isOnline,
      pct,
      state: workloadState,
      color,
    };
  });

  const pendingVendorsCost = pendingVendorsResult?._sum?.remainingPayable || 0;
  const pendingVendorsCountResult =
    pendingVendorsResult?._count?._all ??
    pendingVendorsResult?._count ??
    0;

  const activeGroups = {};
  for (const b of activeBookings || []) {
    if (!b.departureDate || !b.tripRef) continue;
    const durationDays = getDurationInDays(b.tripRef.duration);
    const depTime = new Date(b.departureDate).getTime();
    const endTime = depTime + durationDays * 24 * 60 * 60 * 1000;
    if (endTime >= bounds.startToday.getTime()) {
      const key = `${b.tripId}_${b.departureDate.toISOString()}`;
      if (!activeGroups[key]) {
        activeGroups[key] = {
          trip: b.tripRef,
          departureDate: b.departureDate,
          travelers: 0,
        };
      }
      activeGroups[key].travelers += b.numberOfTravelers || 1;
    }
  }

  const tripsRunningNow = Object.values(activeGroups).map((g) => {
    const depTime = new Date(g.departureDate).getTime();
    const currentDay =
      Math.floor((bounds.now.getTime() - depTime) / (24 * 60 * 60 * 1000)) + 1;
    let stay = `Day ${currentDay}`;
    try {
      if (g.trip.itinerary && Array.isArray(g.trip.itinerary)) {
        const dayPlan = g.trip.itinerary.find((item) => item.day === currentDay);
        if (dayPlan && dayPlan.title) stay = dayPlan.title;
      }
    } catch (e) {
      /* itinerary optional */
    }
    return {
      code: `${g.trip.shortName || getShortName(g.trip.title)} - ${formatDateDayMonth(g.departureDate)}`,
      name: g.trip.title,
      size: g.travelers,
      stay,
    };
  });

  const upcomingGroups = {};
  for (const b of upcomingBookings || []) {
    if (!b.departureDate || !b.tripRef) continue;
    const key = `${b.tripId}_${b.departureDate.toISOString()}`;
    if (!upcomingGroups[key]) {
      upcomingGroups[key] = {
        trip: b.tripRef,
        departureDate: b.departureDate,
        travelers: 0,
      };
    }
    upcomingGroups[key].travelers += b.numberOfTravelers || 1;
  }

  const tripsDepartingNext7Days = Object.values(upcomingGroups).map((g) => {
    const maxGroupSize = g.trip.maxGroupSize || 40;
    return {
      name: g.trip.title,
      date: formatDateDayMonthYear(g.departureDate),
      count: `${g.travelers}/${maxGroupSize}`,
      status: g.travelers >= maxGroupSize ? "full" : "normal",
    };
  });

  const todaysSchedule = (todayTasks || []).map((t) => {
    const timeStr = t.dueDate
      ? new Date(t.dueDate).toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "All Day";
    return {
      time: timeStr,
      label: t.title,
      color:
        t.status === "COMPLETED"
          ? "bg-[#16A34A]"
          : t.dueDate < bounds.now
            ? "bg-[#E23D4D]"
            : "bg-[#2563EB]",
    };
  });

  return {
    bookings: periodBookings,
    trips: tripsRunningNow.length,
    totalBookings: periodBookings,
    totalTrips: tripsRunningNow.length,
    totalRevenue,
    pendingPayments,
    pendingVendorsCost,
    pendingVendorsCount: pendingVendorsCountResult || 0,
    monthlyRevenue: formattedMonthlyRevenue,
    recentBookings: mappedRecentBookings,
    tasksTotal,
    tasksCompleted,
    tasksOverdue,
    tasksPending,
    employeeStatus: {
      online: adminWorkloads.filter((e) => e.isOnline).map((e) => e.name),
      offline: adminWorkloads.filter((e) => !e.isOnline).map((e) => e.name),
    },
    employeeWorkload: adminWorkloads.map((emp) => ({
      name: emp.name,
      state: emp.state,
      pct: emp.pct ?? 0,
      color: emp.color,
    })),
    attentionItems: [
      {
        label: "Payments waiting verification",
        count: payVerifyCount,
        color: "bg-[#E23D4D]",
        urgent: true,
        path: "/admin/approvals-hub?tab=payment-approvals",
      },
      {
        label: "Aadhaar pending",
        count: aadhaarPendingCount,
        color: "bg-[#D97706]",
        path: "/admin/approvals-hub?tab=payment-approvals",
      },
      {
        label: "Hotels pending confirmation",
        count: hotelPendingCount,
        color: "bg-[#D97706]",
        path: "/admin/departure-workspace",
      },
      {
        label: "Vendors with payments due today",
        count: vendorDueCount,
        color: "bg-[#E23D4D]",
        urgent: true,
        path: "/admin/approvals-hub?tab=vendor-bills",
      },
      {
        label: "Rooming pending",
        count: roomingPendingCount || 0,
        color: "bg-[#D97706]",
        path: "/admin/departure-workspace",
      },
      {
        label: "Customer complaints",
        count: complaintCount,
        color: "bg-[#E23D4D]",
        urgent: true,
        path: "/admin/departure-workspace",
      },
      {
        label: "Tasks pending > 24 hours",
        count: tasksOver24Count,
        color: "bg-[#E23D4D]",
        urgent: true,
        path: "/admin/departure-workspace",
      },
      {
        label: "Missing train tickets",
        count: missingTicketsCount,
        color: "bg-[#E23D4D]",
        urgent: true,
        path: "/admin/approvals-hub?tab=ticket-approvals",
      },
      {
        label: "Missing tempo confirmation",
        count: tempoPendingCount,
        color: "bg-[#D97706]",
        path: "/admin/departure-workspace",
      },
    ],
    tripsRunningNow,
    tripsDepartingNext7Days,
    todaysSchedule,
    cashFlow: {
      collectionToday,
      paymentsToday,
      netCashInflow,
    },
    approvalQueue: {
      paymentApprovals: payVerifyCount || 0,
      vendorBills: pendingVendorsCountResult || 0,
      missingTickets: missingTicketsCount || 0,
    },
  };
}

function applyDashboardPermissions(raw, user) {
  if (!raw) return raw;
  return {
    bookings: hasPerm(user, "bookings.view") ? raw.bookings : undefined,
    trips: hasPerm(user, "trips.view") ? raw.trips : undefined,
    totalBookings: hasPerm(user, "bookings.view") ? raw.totalBookings : undefined,
    totalTrips: hasPerm(user, "trips.view") ? raw.totalTrips : undefined,
    totalRevenue: hasPerm(user, "accounting.view") ? raw.totalRevenue : undefined,
    pendingPayments: hasPerm(user, "accounting.view") ? raw.pendingPayments : undefined,
    pendingVendorsCost:
      hasPerm(user, "accounting.view") || hasPerm(user, "vendors.view")
        ? raw.pendingVendorsCost
        : undefined,
    pendingVendorsCount:
      hasPerm(user, "accounting.view") || hasPerm(user, "vendors.view")
        ? raw.pendingVendorsCount
        : undefined,
    monthlyRevenue: hasPerm(user, "accounting.view") ? raw.monthlyRevenue : undefined,
    recentBookings: hasPerm(user, "bookings.view") ? raw.recentBookings : undefined,
    tasksTotal: hasPerm(user, "tasks.view") || hasPerm(user, "ops.view") ? raw.tasksTotal : undefined,
    tasksCompleted:
      hasPerm(user, "tasks.view") || hasPerm(user, "ops.view") ? raw.tasksCompleted : undefined,
    tasksOverdue:
      hasPerm(user, "tasks.view") || hasPerm(user, "ops.view") ? raw.tasksOverdue : undefined,
    tasksPending:
      hasPerm(user, "tasks.view") || hasPerm(user, "ops.view") ? raw.tasksPending : undefined,
    employeeStatus: hasPerm(user, "users.view") ? raw.employeeStatus : undefined,
    employeeWorkload: hasPerm(user, "users.view") ? raw.employeeWorkload : undefined,
    attentionItems:
      hasPerm(user, "ops.view") || hasPerm(user, "bookings.view")
        ? raw.attentionItems
        : undefined,
    tripsRunningNow: hasPerm(user, "trips.view") ? raw.tripsRunningNow : undefined,
    tripsDepartingNext7Days: hasPerm(user, "trips.view")
      ? raw.tripsDepartingNext7Days
      : undefined,
    todaysSchedule: hasPerm(user, "ops.view") ? raw.todaysSchedule : undefined,
    cashFlow: hasPerm(user, "accounting.view") ? raw.cashFlow : undefined,
    approvalQueue:
      hasPerm(user, "bookings.verify") || hasPerm(user, "accounting.view")
        ? raw.approvalQueue
        : undefined,
  };
}

async function getDashboardStatsPayload(user, dateFilter, now = new Date()) {
  const tenantId = user?.tenantId || "default";
  const filterKey = dateFilter || "all";
  const cacheKey = `stats_raw_${tenantId}_${filterKey}`;

  let raw = null;
  const cachedVal = await cache.get(cacheKey);
  if (cachedVal) {
    try {
      raw = JSON.parse(cachedVal);
    } catch (e) {
      raw = null;
    }
  }
  if (!raw) {
    raw = await computeRawDashboardStats(tenantId, filterKey, now);
    await cache.set(cacheKey, raw, 45);
  }
  return applyDashboardPermissions(raw, user);
}

module.exports = {
  LIVE_BOOKING_STATUS,
  outstandingFromTotals,
  verifiedReceiptWhere,
  hasPerm,
  applyDashboardPermissions,
  computeRawDashboardStats,
  getDashboardStatsPayload,
};
