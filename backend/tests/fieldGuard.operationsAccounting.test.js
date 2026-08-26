const { guardBookingUpdateFields } = require("../src/middleware/fieldGuard");

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

describe("guardBookingUpdateFields — Operations Accounting save", () => {
  test("allows Operations to save Accounting tab payload (totals + sourceMeta)", () => {
    const req = {
      user: { role: "Operations", email: "ops@example.com", name: "Neeki Diyali" },
      body: {
        totalAmount: 72450,
        remainingAmount: 38450,
        baseAmount: 69000,
        gstAmount: 3450,
        discountAmount: 0,
        advancePaid: 34000,
        sourceMeta: {
          bookingItems: [
            { id: "sleeper", name: "NON AC SLEEPER", rate: 23000, qty: 3 },
            { id: "room", name: "Triple/Quad Sharing", rate: 0, qty: 3 },
          ],
        },
      },
    };
    const res = mockRes();
    let nextCalled = false;

    guardBookingUpdateFields(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(res.statusCode).toBeNull();
  });

  test("still blocks Operations from ownership / non-allowlisted fields", () => {
    const req = {
      user: { role: "operations" },
      body: {
        totalAmount: 1000,
        salesAdminId: "someone-else",
      },
    };
    const res = mockRes();
    let nextCalled = false;

    guardBookingUpdateFields(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain("salesAdminId");
  });
});
