import { Router, Request, Response, NextFunction } from "express";
import { db, usersTable, tripsTable, attendanceTable, assignmentsTable, payoutsTable, guideWorkDaysTable, guideDayReportsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth";

const adminRouter = Router();

// Middleware to ensure the authenticated user is an admin
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthenticatedRequest).user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }
  next();
}

// Apply auth and admin check to all admin routes
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// 1. GET /admin/dashboard - Overview statistics
adminRouter.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const activeTrips = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.status, "active"));
      
    const totalGuides = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "guide"));
      
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCheckIns = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.date, todayStr));
      
    // Missing check-ins today: active guides who haven't checked in today
    const activeGuideIds = activeTrips.map((t) => t.leadGuideId);
    const checkedInGuideIds = todayCheckIns.map((a) => a.guideId);
    const missingCheckIns = activeGuideIds.filter(
      (id) => !checkedInGuideIds.includes(id)
    ).length;
    
    // locationMismatchFlags (Red Flags): Count records that have location_mismatch, incomplete, or missing checkout/selfies
    const allAttendance = await db
      .select({
        attendance: attendanceTable,
        tripName: tripsTable.name,
      })
      .from(attendanceTable)
      .innerJoin(tripsTable, eq(attendanceTable.tripId, tripsTable.id));
      
    const locationMismatchFlags = allAttendance.filter((record) => {
      const isMismatch = record.attendance.status === "location_mismatch";
      const isIncomplete = record.attendance.status === "incomplete";
      const isRejected = record.attendance.status === "rejected";
      
      const hasCheckIn = !!record.attendance.checkInTime;
      const hasCheckOut = !!record.attendance.checkOutTime;
      const missingCheckInSelfie = hasCheckIn && !record.attendance.checkInSelfieUrl;
      const missingCheckOutSelfie = hasCheckOut && !record.attendance.checkOutSelfieUrl;
      const missingSelfie = missingCheckInSelfie || missingCheckOutSelfie;
      
      const missingCheckOut = hasCheckIn && !hasCheckOut;

      return isMismatch || isIncomplete || isRejected || missingSelfie || missingCheckOut;
    }).length;

    res.json({
      activeTrips: activeTrips.length,
      totalGuides: totalGuides.length,
      todayCheckIns: todayCheckIns.length,
      missingCheckIns,
      locationMismatchFlags,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 2. GET /admin/guides - Guide monitoring list
adminRouter.get("/guides", async (req: Request, res: Response) => {
  try {
    const guides = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "guide"));
      
    const todayStr = new Date().toISOString().split("T")[0];
    const result = [];
    
    for (const guide of guides) {
      // Find active trip
      const [activeTrip] = await db
        .select()
        .from(tripsTable)
        .where(
          and(
            eq(tripsTable.leadGuideId, guide.id),
            eq(tripsTable.status, "active")
          )
        )
        .limit(1);
        
      // Get today's attendance log
      const [todayLog] = await db
        .select()
        .from(attendanceTable)
        .where(
          and(
            eq(attendanceTable.guideId, guide.id),
            eq(attendanceTable.date, todayStr)
          )
        )
        .limit(1);
        
      // Today status logic
      let todayStatus: "checked_in" | "checked_out" | "missing" | "idle" = "idle";
      if (activeTrip) {
        if (!todayLog) {
          todayStatus = "missing";
        } else if (todayLog.checkOutTime) {
          todayStatus = "checked_out";
        } else {
          todayStatus = "checked_in";
        }
      }
      
      // Last check-in time
      const [lastLog] = await db
        .select()
        .from(attendanceTable)
        .where(eq(attendanceTable.guideId, guide.id))
        .orderBy(desc(attendanceTable.checkInTime))
        .limit(1);
        
      // Check if guide has flagged records
      const logs = await db
        .select({
          attendance: attendanceTable,
          tripName: tripsTable.name,
        })
        .from(attendanceTable)
        .innerJoin(tripsTable, eq(attendanceTable.tripId, tripsTable.id))
        .where(eq(attendanceTable.guideId, guide.id));
        
      const flagged = logs.some((log) => {
        const isMismatch = log.attendance.status === "location_mismatch";
        const isIncomplete = log.attendance.status === "incomplete";
        const isRejected = log.attendance.status === "rejected";
        
        const hasCheckIn = !!log.attendance.checkInTime;
        const hasCheckOut = !!log.attendance.checkOutTime;
        const missingCheckInSelfie = hasCheckIn && !log.attendance.checkInSelfieUrl;
        const missingCheckOutSelfie = hasCheckOut && !log.attendance.checkOutSelfieUrl;
        const missingSelfie = missingCheckInSelfie || missingCheckOutSelfie;
        
        const missingCheckOut = hasCheckIn && !hasCheckOut;

        return isMismatch || isIncomplete || isRejected || missingSelfie || missingCheckOut;
      });
      
      // Approved days count
      const approvedLogs = logs.filter((log) => log.attendance.status === "approved");
      
      result.push({
        id: guide.id,
        name: guide.name,
        phone: guide.phone,
        activeTripName: activeTrip ? activeTrip.name : null,
        todayStatus,
        lastCheckInTime: lastLog && lastLog.checkInTime ? lastLog.checkInTime.toISOString() : null,
        flagged,
        daysLogged: approvedLogs.length,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 3. GET /admin/attendance-logs - Detailed attendance logs
adminRouter.get("/attendance-logs", async (req: Request, res: Response) => {
  try {
    const logs = await db
      .select({
        id: attendanceTable.id,
        guideName: usersTable.name,
        tripName: tripsTable.name,
        date: attendanceTable.date,
        checkInTime: attendanceTable.checkInTime,
        checkInLatitude: attendanceTable.checkInLatitude,
        checkInLongitude: attendanceTable.checkInLongitude,
        checkInLocationName: attendanceTable.checkInLocationName,
        checkInSelfieUrl: attendanceTable.checkInSelfieUrl,
        checkInDistance: attendanceTable.checkInDistance,
        checkOutTime: attendanceTable.checkOutTime,
        checkOutLatitude: attendanceTable.checkOutLatitude,
        checkOutLongitude: attendanceTable.checkOutLongitude,
        checkOutLocationName: attendanceTable.checkOutLocationName,
        checkOutSelfieUrl: attendanceTable.checkOutSelfieUrl,
        checkOutDistance: attendanceTable.checkOutDistance,
        notes: attendanceTable.notes,
        status: attendanceTable.status,
      })
      .from(attendanceTable)
      .innerJoin(usersTable, eq(attendanceTable.guideId, usersTable.id))
      .innerJoin(tripsTable, eq(attendanceTable.tripId, tripsTable.id))
      .orderBy(desc(attendanceTable.date));
      
    // Format timestamps to ISO strings
    const formatted = logs.map((log) => ({
      ...log,
      checkInTime: log.checkInTime ? log.checkInTime.toISOString() : null,
      checkOutTime: log.checkOutTime ? log.checkOutTime.toISOString() : null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 4. POST /admin/verify-attendance - Approve or reject an attendance day
adminRouter.post("/verify-attendance", async (req: Request, res: Response) => {
  try {
    const { attendanceId, status } = req.body;
    const admin = (req as AuthenticatedRequest).user!;
    
    if (!attendanceId || !status || !["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid attendanceId or status" });
      return;
    }
    
    const [updated] = await db
      .update(attendanceTable)
      .set({
        status,
        verifiedAt: new Date(),
        verifiedBy: admin.id,
      })
      .where(eq(attendanceTable.id, attendanceId))
      .returning();
      
    if (!updated) {
      res.status(404).json({ error: "Attendance record not found" });
      return;
    }
    
    res.json({
      ...updated,
      checkInTime: updated.checkInTime ? updated.checkInTime.toISOString() : null,
      checkOutTime: updated.checkOutTime ? updated.checkOutTime.toISOString() : null,
      verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 5. GET /admin/reports - Aggregated payroll and attendance summaries
adminRouter.get("/reports", async (req: Request, res: Response) => {
  try {
    const guides = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "guide"));
      
    const result = [];
    
    for (const guide of guides) {
      // Find trip assignment (active or most recent)
      const trips = await db
        .select()
        .from(tripsTable)
        .where(eq(tripsTable.leadGuideId, guide.id))
        .orderBy(desc(tripsTable.startDate));
        
      const latestTrip = trips[0];
      
      // Calculate attendance status counters
      const attendance = await db
        .select()
        .from(attendanceTable)
        .where(eq(attendanceTable.guideId, guide.id));
        
      const approvedDays = attendance.filter((a) => a.status === "approved").length;
      const rejectedDays = attendance.filter((a) => a.status === "rejected").length;
      const pendingDays = attendance.filter((a) => a.status === "pending").length;
      const mismatchDays = attendance.filter((a) => a.status === "location_mismatch").length;
      const incompleteDays = attendance.filter((a) => a.status === "incomplete").length;
      
      const totalTripDays = approvedDays + rejectedDays + pendingDays + mismatchDays + incompleteDays;
      
      // Calculate day reports counts
      const workDays = await db
        .select()
        .from(guideWorkDaysTable)
        .where(eq(guideWorkDaysTable.guideId, guide.id));
      
      const reports = await db
        .select()
        .from(guideDayReportsTable)
        .where(eq(guideDayReportsTable.guideId, guide.id));
      
      const submittedReportsCount = reports.length;
      const missingReportsCount = Math.max(0, workDays.length - reports.length);

      // "Only approved days count in payable amount."
      const payableAmount = approvedDays * guide.dailyRate;
      
      result.push({
        guideId: guide.id,
        guideName: guide.name,
        tripName: latestTrip ? latestTrip.name : null,
        totalTripDays,
        approvedDays,
        rejectedDays,
        pendingDays,
        incompleteDays,
        locationMismatchDays: mismatchDays,
        payableAmount,
        submittedReportsCount,
        missingReportsCount,
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 6. GET /admin/trips - List all trips
adminRouter.get("/trips", async (req: Request, res: Response) => {
  try {
    const trips = await db
      .select({
        id: tripsTable.id,
        name: tripsTable.name,
        location: tripsTable.location,
        startDate: tripsTable.startDate,
        endDate: tripsTable.endDate,
        leadGuideId: tripsTable.leadGuideId,
        leadGuideName: usersTable.name,
        status: tripsTable.status,
      })
      .from(tripsTable)
      .innerJoin(usersTable, eq(tripsTable.leadGuideId, usersTable.id))
      .orderBy(desc(tripsTable.startDate));

    const formatted = trips.map((t) => ({
      ...t,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
// 7. POST /admin/guides - Create a new guide user
adminRouter.post("/guides", async (req: Request, res: Response) => {
  try {
    const { name, phone, dailyRate, emergencyContact, isActive } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "Name and phone are required" });
      return;
    }

    const [guide] = await db
      .insert(usersTable)
      .values({
        name,
        phone,
        role: "guide",
        dailyRate: dailyRate ?? 1500,
        emergencyContact: emergencyContact ?? null,
        isActive: isActive ?? "active",
      })
      .returning();

    res.status(201).json({
      ...guide,
      createdAt: guide.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 8. PUT /admin/guides/:id - Update a guide
adminRouter.put("/guides/:id", async (req: Request, res: Response) => {
  try {
    const guideId = parseInt(req.params.id as string, 10);
    const { name, phone, dailyRate, emergencyContact, isActive } = req.body;

    if (isNaN(guideId)) {
      res.status(400).json({ error: "Invalid guide ID" });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dailyRate !== undefined) updateData.dailyRate = dailyRate;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, guideId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Guide not found" });
      return;
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 9. GET /admin/assignments - List all assignments with guide and trip names
adminRouter.get("/assignments", async (req: Request, res: Response) => {
  try {
    const assignments = await db
      .select({
        id: assignmentsTable.id,
        guideId: assignmentsTable.guideId,
        guideName: usersTable.name,
        tripId: assignmentsTable.tripId,
        tripName: tripsTable.name,
        departureDate: assignmentsTable.departureDate,
        role: assignmentsTable.role,
        perDayAmount: assignmentsTable.perDayAmount,
        allowedLatitude: assignmentsTable.allowedLatitude,
        allowedLongitude: assignmentsTable.allowedLongitude,
        allowedRadius: assignmentsTable.allowedRadius,
        createdAt: assignmentsTable.createdAt,
      })
      .from(assignmentsTable)
      .innerJoin(usersTable, eq(assignmentsTable.guideId, usersTable.id))
      .innerJoin(tripsTable, eq(assignmentsTable.tripId, tripsTable.id))
      .orderBy(desc(assignmentsTable.createdAt));

    const formatted = assignments.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 10. POST /admin/assignments - Create an assignment
adminRouter.post("/assignments", async (req: Request, res: Response) => {
  try {
    const { guideId, tripId, departureDate, role, perDayAmount, allowedLatitude, allowedLongitude, allowedRadius } = req.body;

    if (!guideId || !tripId || !departureDate || !role || perDayAmount === undefined) {
      res.status(400).json({ error: "guideId, tripId, departureDate, role, and perDayAmount are required" });
      return;
    }

    const [assignment] = await db
      .insert(assignmentsTable)
      .values({
        guideId,
        tripId,
        departureDate,
        role,
        perDayAmount,
        allowedLatitude: allowedLatitude ?? null,
        allowedLongitude: allowedLongitude ?? null,
        allowedRadius: allowedRadius ?? 3000,
      })
      .returning();

    res.status(201).json({
      ...assignment,
      createdAt: assignment.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 11. PUT /admin/assignments/:id - Update an assignment
adminRouter.put("/assignments/:id", async (req: Request, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.id as string, 10);
    const { guideId, tripId, departureDate, role, perDayAmount, allowedLatitude, allowedLongitude, allowedRadius } = req.body;

    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Invalid assignment ID" });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (guideId !== undefined) updateData.guideId = guideId;
    if (tripId !== undefined) updateData.tripId = tripId;
    if (departureDate !== undefined) updateData.departureDate = departureDate;
    if (role !== undefined) updateData.role = role;
    if (perDayAmount !== undefined) updateData.perDayAmount = perDayAmount;
    if (allowedLatitude !== undefined) updateData.allowedLatitude = allowedLatitude;
    if (allowedLongitude !== undefined) updateData.allowedLongitude = allowedLongitude;
    if (allowedRadius !== undefined) updateData.allowedRadius = allowedRadius;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db
      .update(assignmentsTable)
      .set(updateData)
      .where(eq(assignmentsTable.id, assignmentId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 12. DELETE /admin/assignments/:id - Delete an assignment
adminRouter.delete("/assignments/:id", async (req: Request, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.id as string, 10);

    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Invalid assignment ID" });
      return;
    }

    const [deleted] = await db
      .delete(assignmentsTable)
      .where(eq(assignmentsTable.id, assignmentId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 13. GET /admin/payroll - Guide-wise and trip-wise payment summary
adminRouter.get("/payroll", async (req: Request, res: Response) => {
  try {
    const guides = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "guide"));

    const result = [];

    for (const guide of guides) {
      // Get all attendance for this guide, joined with trip names
      const attendanceLogs = await db
        .select({
          tripId: attendanceTable.tripId,
          tripName: tripsTable.name,
          status: attendanceTable.status,
        })
        .from(attendanceTable)
        .innerJoin(tripsTable, eq(attendanceTable.tripId, tripsTable.id))
        .where(eq(attendanceTable.guideId, guide.id));

      // Group by trip
      const tripMap = new Map<number, { tripName: string; approvedDays: number }>();

      for (const log of attendanceLogs) {
        if (!tripMap.has(log.tripId)) {
          tripMap.set(log.tripId, { tripName: log.tripName, approvedDays: 0 });
        }
        if (log.status === "approved") {
          tripMap.get(log.tripId)!.approvedDays += 1;
        }
      }

      const tripBreakdown = Array.from(tripMap.entries()).map(([, data]) => ({
        tripName: data.tripName,
        approvedDays: data.approvedDays,
        amount: data.approvedDays * guide.dailyRate,
      }));

      const totalApprovedDays = tripBreakdown.reduce((sum, t) => sum + t.approvedDays, 0);
      const payableAmount = totalApprovedDays * guide.dailyRate;

      result.push({
        guideId: guide.id,
        guideName: guide.name,
        dailyRate: guide.dailyRate,
        approvedDays: totalApprovedDays,
        payableAmount,
        tripBreakdown,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default adminRouter;
