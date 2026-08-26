const {
  buildDeparturePassengerDocuments,
  collectPaymentProofs,
} = require("../../src/utils/departurePassengerDocuments");

describe("departurePassengerDocuments", () => {
  it("collects payment proofs from OpsClientPayment URLs", () => {
    const proofs = collectPaymentProofs([
      {
        id: "pay1",
        amount: 5000,
        proofFileUrl: "/uploads/payment-proofs/a.jpg",
        proofUrl: "/uploads/payment-proofs/a.jpg",
        proofUrls: [
          "/uploads/payment-proofs/a.jpg",
          "/uploads/payment-proofs/b.jpg",
        ],
        proofFileName: "receipt.jpg",
        status: "Verified",
        approvalStatus: "APPROVED_FOUNDER",
      },
      {
        id: "pay2",
        amount: 1000,
        proofFileUrl: null,
        proofUrl: null,
      },
    ]);

    expect(proofs).toHaveLength(2);
    expect(proofs[0].url).toBe("/uploads/payment-proofs/a.jpg");
    expect(proofs[1].url).toBe("/uploads/payment-proofs/b.jpg");
  });

  it("builds person-wise rows with empty states for missing docs/proofs", () => {
    const { passengers, summary } = buildDeparturePassengerDocuments([
      {
        id: "b1",
        bookingId: "YC-001",
        fullName: "Rahul Sharma",
        status: "confirmed",
        passengers: {
          persons: [
            {
              id: "p1",
              name: "Rahul Sharma",
              aadhaarUrl: "/uploads/documents/aadhaar-rahul.jpg",
            },
            { id: "p2", name: "Priya Sharma" },
          ],
        },
        documents: [
          {
            id: "d1",
            passengerId: "p2",
            documentType: "Aadhaar",
            originalFileName: "priya-aadhaar.pdf",
            status: "UPLOADED",
          },
        ],
        opsClientPayments: [
          {
            id: "pay1",
            amount: 12000,
            proofFileUrl: "/uploads/payment-proofs/yc001.jpg",
            status: "Verified",
          },
        ],
      },
    ]);

    expect(passengers).toHaveLength(2);
    expect(passengers[0].name).toBe("Rahul Sharma");
    expect(passengers[0].isLead).toBe(true);
    expect(passengers[0].hasIdentityDoc).toBe(true);
    expect(passengers[0].hasPaymentProof).toBe(true);
    expect(passengers[1].name).toBe("Priya Sharma");
    expect(passengers[1].hasIdentityDoc).toBe(true);
    expect(passengers[1].identityDocs[0].fileName).toBe("priya-aadhaar.pdf");
    expect(summary.withIdentityDoc).toBe(2);
    expect(summary.withPaymentProof).toBe(2);
  });

  it("reports missing identity and payment proof clearly", () => {
    const { passengers, summary } = buildDeparturePassengerDocuments([
      {
        id: "b2",
        bookingId: "YC-002",
        fullName: "Amit Patel",
        status: "confirmed",
        passengers: { persons: [{ id: "p9", name: "Amit Patel" }] },
        documents: [],
        opsClientPayments: [],
      },
    ]);

    expect(passengers).toHaveLength(1);
    expect(passengers[0].hasIdentityDoc).toBe(false);
    expect(passengers[0].hasPaymentProof).toBe(false);
    expect(summary.missingIdentityDoc).toBe(1);
    expect(summary.missingPaymentProof).toBe(1);
  });
});
