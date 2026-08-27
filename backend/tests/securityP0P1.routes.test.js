process.env.JWT_SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
    ? process.env.JWT_SECRET
    : "security-p0p1-test-secret-32chars-min";
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-key";

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    admin: { findUnique: jest.fn(), findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    reviewItem: { findMany: jest.fn() },
    bookingDocument: { findFirst: jest.fn() },
  },
}));

jest.mock("../src/utils/documentStorage", () => ({
  downloadFile: jest.fn().mockResolvedValue({ buffer: Buffer.from("pdf-bytes") }),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
}));

jest.mock("../src/controllers/activityMasterController", () => ({
  getActivityAnalyticsKPIs: (_req, res) => res.json({ success: true, data: {} }),
  listActivityMasters: (_req, res) => res.json({ success: true, data: [] }),
  getActivityVendorComparison: (_req, res) => res.json({ success: true, data: [] }),
  getActivityMasterById: (_req, res) => res.json({ success: true, data: { id: "am_1" } }),
  createActivityMaster: (_req, res) =>
    res.status(201).json({ success: true, data: { id: "am_created" } }),
  updateActivityMaster: (_req, res) => res.json({ success: true }),
  addActivityDocument: (_req, res) => res.json({ success: true }),
  createActivityContract: (_req, res) => res.json({ success: true }),
  createDepartureActivity: (_req, res) => res.json({ success: true }),
  allocatePassengerActivity: (_req, res) => res.json({ success: true }),
  generateActivityVoucher: (_req, res) => res.json({ success: true }),
  updateDepartureActivityStatus: (_req, res) => res.json({ success: true }),
}));

jest.mock("../src/controllers/hotelRatesController", () => ({
  createRates: (_req, res) => res.status(201).json({ success: true }),
  getRates: (_req, res) => res.json({ success: true, rates: [] }),
  updateRate: (_req, res) => res.json({ success: true }),
  deleteRate: (_req, res) => res.json({ success: true }),
}));

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class GoogleGenerativeAI {
    getGenerativeModel() {
      return {
        generateContent: async () => ({
          response: { text: () => '{"hero":{"destination":"Spiti"}}' },
        }),
      };
    }
  },
}));

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const { prisma } = require("../src/lib/prisma");
const { authenticate, requirePermission } = require("../src/middleware/auth");
const { servePrivatePassengerDocument } = require("../src/middleware/servePrivateDocuments");
const activityRoutes = require("../src/routes/activityRoutes");
const reviewsRoutes = require("../src/routes/reviewsRoutes");
const hotelRatesRoutes = require("../src/routes/hotelRatesRoutes");
const aiRoutes = require("../src/routes/aiRoutes");
const documentStorage = require("../src/utils/documentStorage");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/admin/activities", activityRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/hotel-rates", hotelRatesRoutes);
  app.use("/api/ai", aiRoutes);
  app.use(
    "/uploads/documents",
    authenticate,
    requirePermission("bookings.view"),
    servePrivatePassengerDocument,
  );
  app.use(
    "/api/uploads/documents",
    authenticate,
    requirePermission("bookings.view"),
    servePrivatePassengerDocument,
  );
  return app;
}

const app = buildApp();

function signToken(id) {
  return jwt.sign({ id, tokenVersion: 0 }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

const USERS = {
  operations: {
    id: "ops_1",
    name: "Ops",
    email: "ops@test.com",
    role: "operations",
    tenantId: "tenant-a",
    isActive: true,
    tokenVersion: 0,
    customPermissions: [],
  },
  sales: {
    id: "sales_1",
    name: "Sales",
    email: "sales@test.com",
    role: "sales",
    tenantId: "tenant-a",
    isActive: true,
    tokenVersion: 0,
    customPermissions: [],
  },
  admin: {
    id: "admin_1",
    name: "Admin",
    email: "admin@test.com",
    role: "admin",
    tenantId: "tenant-a",
    isActive: true,
    tokenVersion: 0,
    customPermissions: [],
  },
  tenantB: {
    id: "ops_b",
    name: "Ops B",
    email: "opsb@test.com",
    role: "operations",
    tenantId: "tenant-b",
    isActive: true,
    tokenVersion: 0,
    customPermissions: [],
  },
};

beforeEach(() => {
  prisma.admin.findUnique.mockImplementation(({ where }) => {
    const user = Object.values(USERS).find((u) => u.id === where.id);
    return Promise.resolve(user || null);
  });
  prisma.user.findUnique.mockResolvedValue(null);
  prisma.review.findMany.mockResolvedValue([]);
  prisma.reviewItem.findMany.mockResolvedValue([]);
  prisma.review.create.mockImplementation(({ data }) =>
    Promise.resolve({ id: "rev_1", ...data }),
  );
  prisma.bookingDocument.findFirst.mockResolvedValue(null);
  documentStorage.downloadFile.mockResolvedValue({ buffer: Buffer.from("pdf-bytes") });
});

describe("P0/P1 route authentication", () => {
  describe("Activity Master mutations", () => {
    it("rejects unauthenticated POST with 401", async () => {
      const res = await request(app)
        .post("/api/admin/activities")
        .send({ name: "AUDIT_SHOULD_NOT_CREATE" });
      expect(res.status).toBe(401);
    });

    it("rejects authenticated sales without ops.manage with 403", async () => {
      const res = await request(app)
        .post("/api/admin/activities")
        .set("Authorization", `Bearer ${signToken("sales_1")}`)
        .send({ name: "Sales should not create" });
      expect(res.status).toBe(403);
    });

    it("allows operations with ops.manage to create", async () => {
      const res = await request(app)
        .post("/api/admin/activities")
        .set("Authorization", `Bearer ${signToken("ops_1")}`)
        .send({ name: "Authorized activity" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Reviews mutations", () => {
    it("rejects unauthenticated POST/PUT/DELETE with 401", async () => {
      const post = await request(app).post("/api/reviews").send({
        userName: "A",
        comment: "Nice",
      });
      const put = await request(app).put("/api/reviews/rev_1").send({ comment: "x" });
      const del = await request(app).delete("/api/reviews/rev_1");
      expect(post.status).toBe(401);
      expect(put.status).toBe(401);
      expect(del.status).toBe(401);
    });

    it("rejects sales without website.edit with 403", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${signToken("sales_1")}`)
        .send({ userName: "A", comment: "Nice" });
      expect(res.status).toBe(403);
    });

    it("allows admin with website.edit to create", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${signToken("admin_1")}`)
        .send({ userName: "A", comment: "Nice trip" });
      expect(res.status).toBe(201);
    });
  });

  describe("Hotel rates mutations", () => {
    it("rejects unauthenticated POST/PATCH/DELETE with 401", async () => {
      const post = await request(app).post("/api/hotel-rates/create").send({
        hotel_id: 1,
        destination_id: 1,
        rates: [],
      });
      const patch = await request(app).patch("/api/hotel-rates/1").send({ doubleRoom: 1 });
      const del = await request(app).delete("/api/hotel-rates/1");
      expect(post.status).toBe(401);
      expect(patch.status).toBe(401);
      expect(del.status).toBe(401);
    });

    it("rejects sales without vendors.rates.manage with 403", async () => {
      const res = await request(app)
        .post("/api/hotel-rates/create")
        .set("Authorization", `Bearer ${signToken("sales_1")}`)
        .send({ hotel_id: 1, destination_id: 1, rates: [] });
      expect(res.status).toBe(403);
    });

    it("allows operations to mutate hotel rates", async () => {
      const res = await request(app)
        .post("/api/hotel-rates/create")
        .set("Authorization", `Bearer ${signToken("ops_1")}`)
        .send({ hotel_id: 1, destination_id: 1, rates: [] });
      expect(res.status).toBe(201);
    });
  });

  describe("AI itinerary", () => {
    it("rejects unauthenticated generate-itinerary with 401", async () => {
      const res = await request(app)
        .post("/api/ai/generate-itinerary")
        .send({ prompt: "Spiti 5 days" });
      expect(res.status).toBe(401);
    });

    it("allows authenticated staff to generate", async () => {
      const res = await request(app)
        .post("/api/ai/generate-itinerary")
        .set("Authorization", `Bearer ${signToken("ops_1")}`)
        .send({ prompt: "Spiti 5 days" });
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Private passenger documents", () => {
    it("rejects unauthenticated document URLs with 401", async () => {
      const path =
        "/uploads/documents/bookings/bk1/passengers/pax-1/passport.pdf";
      const a = await request(app).get(path);
      const b = await request(app).get(`/api${path}`);
      expect(a.status).toBe(401);
      expect(b.status).toBe(401);
    });

    it("rejects other-tenant document lookup with 404", async () => {
      prisma.bookingDocument.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .get("/uploads/documents/bookings/bk1/passengers/pax-1/passport.pdf")
        .set("Authorization", `Bearer ${signToken("ops_b")}`);
      expect(res.status).toBe(404);
      expect(prisma.bookingDocument.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: "tenant-b" }),
        }),
      );
    });

    it("serves tenant-scoped documents for authorized staff", async () => {
      prisma.bookingDocument.findFirst.mockResolvedValue({
        id: "doc_1",
        storagePath: "bookings/bk1/passengers/pax-1/passport.pdf",
        mimeType: "application/pdf",
        originalFileName: "passport.pdf",
      });
      const res = await request(app)
        .get("/uploads/documents/bookings/bk1/passengers/pax-1/passport.pdf")
        .set("Authorization", `Bearer ${signToken("ops_1")}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/pdf/);
      expect(documentStorage.downloadFile).toHaveBeenCalled();
      expect(prisma.bookingDocument.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: "tenant-a" }),
        }),
      );
    });
  });
});
