jest.mock("../src/lib/prisma", () => ({
  prisma: {
    bookingTask: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    taskAllotment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    taskComment: { create: jest.fn() },
  },
}));

jest.mock("../src/utils/auditLogger", () => ({ logAction: jest.fn() }));

const { prisma } = require("../src/lib/prisma");
const {
  canViewAllTasks,
  resolveTaskAssigneeScope,
  canAccessAssignedTask,
} = require("../src/utils/taskVisibility");
const { hasPermission } = require("../src/config/permissions");
const {
  getTasks,
  updateTaskStatus,
  getTaskDashboard,
} = require("../src/controllers/taskAllotmentController");

describe("taskVisibility permission model", () => {
  it("grants tasks.view_all to founders, admins, and finance controllers", () => {
    expect(hasPermission("founder", "tasks.view_all")).toBe(true);
    expect(hasPermission("superadmin", "tasks.view_all")).toBe(true);
    expect(hasPermission("admin", "tasks.view_all")).toBe(true);
    expect(hasPermission("finance_controller", "tasks.view_all")).toBe(true);
  });

  it("denies tasks.view_all to ordinary staff roles", () => {
    expect(hasPermission("sales", "tasks.view_all")).toBe(false);
    expect(hasPermission("operations", "tasks.view_all")).toBe(false);
    expect(hasPermission("finance", "tasks.view_all")).toBe(false);
    expect(hasPermission("guide", "tasks.view_all")).toBe(false);
    expect(hasPermission("viewer", "tasks.view_all")).toBe(false);
  });

  it("allows custom permission override on staff", () => {
    expect(
      canViewAllTasks({
        id: "u1",
        role: "sales",
        permissions: ["tasks.view_all"],
      }),
    ).toBe(true);
  });
});

describe("resolveTaskAssigneeScope", () => {
  const staff = { id: "staff-1", role: "sales" };
  const manager = { id: "admin-1", role: "admin" };

  it("forces non-privileged users to their own id even when ALL is requested", () => {
    expect(resolveTaskAssigneeScope(staff, "ALL")).toBe("staff-1");
    expect(resolveTaskAssigneeScope(staff, "other-user")).toBe("staff-1");
    expect(resolveTaskAssigneeScope(staff)).toBe("staff-1");
  });

  it("lets privileged users see all or filter by assignee", () => {
    expect(resolveTaskAssigneeScope(manager, "ALL")).toBeUndefined();
    expect(resolveTaskAssigneeScope(manager)).toBeUndefined();
    expect(resolveTaskAssigneeScope(manager, "staff-2")).toBe("staff-2");
  });
});

describe("canAccessAssignedTask", () => {
  const staff = { id: "staff-1", role: "operations" };
  const peer = { id: "staff-2", role: "operations" };
  const founder = { id: "f1", role: "founder" };

  it("allows assignee and privileged roles only", () => {
    const task = { assignedToId: "staff-1" };
    expect(canAccessAssignedTask(staff, task)).toBe(true);
    expect(canAccessAssignedTask(peer, task)).toBe(false);
    expect(canAccessAssignedTask(founder, task)).toBe(true);
  });
});

function mockRes() {
  return {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };
}

describe("finance task list API assignee enforcement", () => {
  beforeEach(() => {
    prisma.taskAllotment.findMany.mockResolvedValue([]);
    prisma.taskAllotment.count.mockResolvedValue(0);
    prisma.taskAllotment.findFirst.mockReset();
    prisma.taskAllotment.update.mockReset();
  });

  it("scopes GET /finance/tasks to current user for sales staff", async () => {
    const req = {
      user: { id: "sales-A", role: "sales", tenantId: "t1" },
      query: { assignedToId: "ALL", page: 1, limit: 30 },
    };
    const res = mockRes();

    await getTasks(req, res);

    expect(prisma.taskAllotment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: "t1",
          assignedToId: "sales-A",
        }),
      }),
    );
    expect(prisma.taskAllotment.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ assignedToId: "sales-A" }),
    });
  });

  it("does not force assignee for admin with tasks.view_all", async () => {
    const req = {
      user: { id: "admin-1", role: "admin", tenantId: "t1" },
      query: { assignedToId: "ALL", page: 1, limit: 30 },
    };
    const res = mockRes();

    await getTasks(req, res);

    const where = prisma.taskAllotment.findMany.mock.calls[0][0].where;
    expect(where.assignedToId).toBeUndefined();
    expect(where.tenantId).toBe("t1");
  });

  it("scopes task dashboard workload to own tasks for non-privileged staff", async () => {
    prisma.taskAllotment.findMany.mockResolvedValue([
      {
        assignedToId: "ops-1",
        status: "PENDING",
        deadline: null,
        assignedTo: { id: "ops-1", name: "Ops One" },
      },
    ]);

    const req = {
      user: { id: "ops-1", role: "operations", tenantId: "t1" },
      query: {},
    };
    const res = mockRes();

    await getTaskDashboard(req, res);

    expect(prisma.taskAllotment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "t1", assignedToId: "ops-1" },
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ totalTasks: 1 }),
      }),
    );
  });

  it("blocks peer from updating another staff member's task", async () => {
    prisma.taskAllotment.findFirst.mockResolvedValue({
      id: "task-1",
      assignedToId: "sales-A",
      title: "Peer task",
      status: "PENDING",
      completedAt: null,
      bookingId: null,
    });

    const req = {
      user: { id: "sales-B", role: "sales", tenantId: "t1" },
      params: { id: "task-1" },
      body: { status: "COMPLETED" },
    };
    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.taskAllotment.update).not.toHaveBeenCalled();
  });

  it("allows assignee to update their own task", async () => {
    prisma.taskAllotment.findFirst.mockResolvedValue({
      id: "task-1",
      assignedToId: "sales-A",
      title: "Own task",
      status: "PENDING",
      completedAt: null,
      bookingId: null,
    });
    prisma.taskAllotment.update = jest.fn().mockResolvedValue({
      id: "task-1",
      status: "COMPLETED",
      assignedTo: { id: "sales-A", name: "Sales A" },
    });
    // $transaction path
    prisma.$transaction = jest.fn(async (fn) =>
      fn({
        taskAllotment: {
          update: prisma.taskAllotment.update,
        },
        taskComment: { create: jest.fn() },
      }),
    );

    const req = {
      user: { id: "sales-A", role: "sales", tenantId: "t1", name: "Sales A" },
      params: { id: "task-1" },
      body: { status: "COMPLETED" },
      ip: "127.0.0.1",
      headers: {},
    };
    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
