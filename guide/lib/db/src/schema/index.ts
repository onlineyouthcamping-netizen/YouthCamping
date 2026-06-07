import { pgTable, text, serial, integer, timestamp, doublePrecision, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'guide' | 'admin'
  dailyRate: integer("daily_rate").default(1500).notNull(),
  emergencyContact: text("emergency_contact"),
  isActive: text("is_active").default("active").notNull(), // 'active' | 'inactive'
  email: text("email"),
  profilePhoto: text("profile_photo"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  leadGuideId: integer("lead_guide_id").references(() => usersTable.id).notNull(),
  status: text("status").default("active").notNull(), // 'active' | 'completed' | 'cancelled'
  allowedLatitude: doublePrecision("allowed_latitude"),
  allowedLongitude: doublePrecision("allowed_longitude"),
  allowedRadius: integer("allowed_radius").default(3000).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceTable = pgTable("attendance", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  tripId: integer("trip_id").references(() => tripsTable.id).notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  checkInTime: timestamp("check_in_time"),
  checkInLatitude: doublePrecision("check_in_latitude"),
  checkInLongitude: doublePrecision("check_in_longitude"),
  checkInLocationName: text("check_in_location_name"),
  checkInSelfieUrl: text("check_in_selfie_url"),
  checkInDistance: integer("check_in_distance"),
  checkOutTime: timestamp("check_out_time"),
  checkOutLatitude: doublePrecision("check_out_latitude"),
  checkOutLongitude: doublePrecision("check_out_longitude"),
  checkOutLocationName: text("check_out_location_name"),
  checkOutSelfieUrl: text("check_out_selfie_url"),
  checkOutDistance: integer("check_out_distance"),
  notes: text("notes"),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected' | 'location_mismatch' | 'incomplete'
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payoutsTable = pgTable("payouts", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  verifiedDays: integer("verified_days").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved'
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignmentsTable = pgTable("assignments", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  tripId: integer("trip_id").references(() => tripsTable.id), // Nullable now
  departureDate: date("departure_date").notNull(),
  role: text("role").notNull(), // 'guide' | 'coordinator' | 'captain' | 'lead_guide' | 'assistant_guide'
  perDayAmount: integer("per_day_amount").notNull(),
  allowedLatitude: doublePrecision("allowed_latitude"),
  allowedLongitude: doublePrecision("allowed_longitude"),
  allowedRadius: integer("allowed_radius").default(3000).notNull(),
  status: text("status").default("assigned").notNull(), // 'assigned' | 'ongoing' | 'completed' | 'cancelled'
  mainBackendTripId: text("main_backend_trip_id"),
  mainBackendTripName: text("main_backend_trip_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New Table: Guide Expenses
export const guideExpensesTable = pgTable("guide_expenses", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  assignmentId: integer("assignment_id").references(() => assignmentsTable.id).notNull(),
  category: text("category").notNull(), // 'hotel_payment' | 'toll_receipt' | 'fuel_bill' | 'entry_ticket' | 'misc_expense'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  receiptUrl: text("receipt_url").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  adminRemarks: text("admin_remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New Table: Traveler Attendance
export const travelerAttendanceTable = pgTable("traveler_attendance", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignmentsTable.id).notNull(),
  bookingId: text("booking_id").notNull(),
  travelerName: text("traveler_name").notNull(),
  travelerPhone: text("traveler_phone"),
  status: text("status").notNull(), // 'arrived_pickup' | 'boarded_train' | 'reached_destination' | 'missing_delayed'
  notes: text("notes"),
  markedByGuideId: integer("marked_by_guide_id").references(() => usersTable.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New Table: Trip Status Updates / Timeline
export const tripStatusUpdatesTable = pgTable("trip_status_updates", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignmentsTable.id).notNull(),
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  status: text("status").notNull(), // 'trip_started' | 'train_boarded' | 'destination_reached' | 'hotel_checkin_complete' | 'sightseeing_started' | 'return_journey_started'
  notes: text("notes"),
  location: text("location"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(usersTable, ({ many }) => ({
  trips: many(tripsTable),
  attendance: many(attendanceTable),
  payouts: many(payoutsTable),
  assignments: many(assignmentsTable),
  expenses: many(guideExpensesTable),
  markedTravelerAttendance: many(travelerAttendanceTable),
  tripStatusUpdates: many(tripStatusUpdatesTable),
}));

export const tripsRelations = relations(tripsTable, ({ one, many }) => ({
  leadGuide: one(usersTable, {
    fields: [tripsTable.leadGuideId],
    references: [usersTable.id],
  }),
  attendance: many(attendanceTable),
  assignments: many(assignmentsTable),
}));

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  guide: one(usersTable, {
    fields: [attendanceTable.guideId],
    references: [usersTable.id],
  }),
  trip: one(tripsTable, {
    fields: [attendanceTable.tripId],
    references: [tripsTable.id],
  }),
  verifiedByUser: one(usersTable, {
    fields: [attendanceTable.verifiedBy],
    references: [usersTable.id],
  }),
}));

export const payoutsRelations = relations(payoutsTable, ({ one }) => ({
  guide: one(usersTable, {
    fields: [payoutsTable.guideId],
    references: [usersTable.id],
  }),
}));

export const assignmentsRelations = relations(assignmentsTable, ({ one, many }) => ({
  guide: one(usersTable, {
    fields: [assignmentsTable.guideId],
    references: [usersTable.id],
  }),
  trip: one(tripsTable, {
    fields: [assignmentsTable.tripId],
    references: [tripsTable.id],
  }),
  expenses: many(guideExpensesTable),
  travelerAttendance: many(travelerAttendanceTable),
  tripStatusUpdates: many(tripStatusUpdatesTable),
}));

export const guideExpensesRelations = relations(guideExpensesTable, ({ one }) => ({
  guide: one(usersTable, {
    fields: [guideExpensesTable.guideId],
    references: [usersTable.id],
  }),
  assignment: one(assignmentsTable, {
    fields: [guideExpensesTable.assignmentId],
    references: [assignmentsTable.id],
  }),
}));

export const travelerAttendanceRelations = relations(travelerAttendanceTable, ({ one }) => ({
  assignment: one(assignmentsTable, {
    fields: [travelerAttendanceTable.assignmentId],
    references: [assignmentsTable.id],
  }),
  markedByGuide: one(usersTable, {
    fields: [travelerAttendanceTable.markedByGuideId],
    references: [usersTable.id],
  }),
}));

export const tripStatusUpdatesRelations = relations(tripStatusUpdatesTable, ({ one }) => ({
  assignment: one(assignmentsTable, {
    fields: [tripStatusUpdatesTable.assignmentId],
    references: [assignmentsTable.id],
  }),
  guide: one(usersTable, {
    fields: [tripStatusUpdatesTable.guideId],
    references: [usersTable.id],
  }),
}));

// Day-wise guide work plan table
export const guideWorkDaysTable = pgTable("guide_work_days", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignmentsTable.id).notNull(),
  tripId: integer("trip_id").references(() => tripsTable.id), // Nullable now too to support main backend trips
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  dayNumber: integer("day_number").notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  location: text("location").notNull(),
  journeyTitle: text("journey_title").notNull(),
  dutyInstructions: text("duty_instructions").notNull(),
  reportingRequirement: text("reporting_requirement"),
  expectedCheckinLatitude: doublePrecision("expected_checkin_latitude"),
  expectedCheckinLongitude: doublePrecision("expected_checkin_longitude"),
  expectedCheckoutLatitude: doublePrecision("expected_checkout_latitude"),
  expectedCheckoutLongitude: doublePrecision("expected_checkout_longitude"),
  requiredPhotosCount: integer("required_photos_count").default(0).notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Guide day report table
export const guideDayReportsTable = pgTable("guide_day_reports", {
  id: serial("id").primaryKey(),
  workDayId: integer("work_day_id").references(() => guideWorkDaysTable.id).notNull(),
  assignmentId: integer("assignment_id").references(() => assignmentsTable.id).notNull(),
  guideId: integer("guide_id").references(() => usersTable.id).notNull(),
  tripId: integer("trip_id").references(() => tripsTable.id), // Nullable now too
  attendanceId: integer("attendance_id").references(() => attendanceTable.id),
  reportText: text("report_text").notNull(),
  uploadedPhotoUrls: json("uploaded_photo_urls").$type<string[]>().default([]).notNull(),
  completedTasks: json("completed_tasks").$type<string[]>().default([]).notNull(),
  guideNotes: text("guide_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  adminStatus: text("admin_status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  adminRemarks: text("admin_remarks"),
});

// Relations for new tables
export const guideWorkDaysRelations = relations(guideWorkDaysTable, ({ one, many }) => ({
  assignment: one(assignmentsTable, {
    fields: [guideWorkDaysTable.assignmentId],
    references: [assignmentsTable.id],
  }),
  trip: one(tripsTable, {
    fields: [guideWorkDaysTable.tripId],
    references: [tripsTable.id],
  }),
  guide: one(usersTable, {
    fields: [guideWorkDaysTable.guideId],
    references: [usersTable.id],
  }),
  reports: many(guideDayReportsTable),
}));

export const guideDayReportsRelations = relations(guideDayReportsTable, ({ one }) => ({
  workDay: one(guideWorkDaysTable, {
    fields: [guideDayReportsTable.workDayId],
    references: [guideWorkDaysTable.id],
  }),
  assignment: one(assignmentsTable, {
    fields: [guideDayReportsTable.assignmentId],
    references: [assignmentsTable.id],
  }),
  guide: one(usersTable, {
    fields: [guideDayReportsTable.guideId],
    references: [usersTable.id],
  }),
  trip: one(tripsTable, {
    fields: [guideDayReportsTable.tripId],
    references: [tripsTable.id],
  }),
  attendance: one(attendanceTable, {
    fields: [guideDayReportsTable.attendanceId],
    references: [attendanceTable.id],
  }),
}));

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);

export const insertTripSchema = createInsertSchema(tripsTable);
export const selectTripSchema = createSelectSchema(tripsTable);

export const insertAttendanceSchema = createInsertSchema(attendanceTable);
export const selectAttendanceSchema = createSelectSchema(attendanceTable);

export const insertPayoutSchema = createInsertSchema(payoutsTable);
export const selectPayoutSchema = createSelectSchema(payoutsTable);

export const insertAssignmentSchema = createInsertSchema(assignmentsTable);
export const selectAssignmentSchema = createSelectSchema(assignmentsTable);

export const insertGuideExpenseSchema = createInsertSchema(guideExpensesTable);
export const selectGuideExpenseSchema = createSelectSchema(guideExpensesTable);

export const insertTravelerAttendanceSchema = createInsertSchema(travelerAttendanceTable);
export const selectTravelerAttendanceSchema = createSelectSchema(travelerAttendanceTable);

export const insertTripStatusUpdateSchema = createInsertSchema(tripStatusUpdatesTable);
export const selectTripStatusUpdateSchema = createSelectSchema(tripStatusUpdatesTable);

export const insertGuideWorkDaySchema = createInsertSchema(guideWorkDaysTable);
export const selectGuideWorkDaySchema = createSelectSchema(guideWorkDaysTable);

export const insertGuideDayReportSchema = createInsertSchema(guideDayReportsTable);
export const selectGuideDayReportSchema = createSelectSchema(guideDayReportsTable);

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export type Trip = typeof tripsTable.$inferSelect;
export type InsertTrip = typeof tripsTable.$inferInsert;

export type Attendance = typeof attendanceTable.$inferSelect;
export type InsertAttendance = typeof attendanceTable.$inferInsert;

export type Payout = typeof payoutsTable.$inferSelect;
export type InsertPayout = typeof payoutsTable.$inferInsert;

export type Assignment = typeof assignmentsTable.$inferSelect;
export type InsertAssignment = typeof assignmentsTable.$inferInsert;

export type GuideExpense = typeof guideExpensesTable.$inferSelect;
export type InsertGuideExpense = typeof guideExpensesTable.$inferInsert;

export type TravelerAttendance = typeof travelerAttendanceTable.$inferSelect;
export type InsertTravelerAttendance = typeof travelerAttendanceTable.$inferInsert;

export type TripStatusUpdate = typeof tripStatusUpdatesTable.$inferSelect;
export type InsertTripStatusUpdate = typeof tripStatusUpdatesTable.$inferInsert;

export type GuideWorkDay = typeof guideWorkDaysTable.$inferSelect;
export type InsertGuideWorkDay = typeof guideWorkDaysTable.$inferInsert;

export type GuideDayReport = typeof guideDayReportsTable.$inferSelect;
export type InsertGuideDayReport = typeof guideDayReportsTable.$inferInsert;