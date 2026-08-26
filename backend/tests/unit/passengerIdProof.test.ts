const {
  passengerHasIdProof,
  findPassengersMissingIdProof,
  assertPassengersHaveIdProof,
  extractPassengerPersons,
} = require("../../src/utils/passengerIdProof");

describe("passengerIdProof", () => {
  it("detects aadhaarUrl / idProofUrl on passenger", () => {
    expect(
      passengerHasIdProof({ aadhaarUrl: "https://cdn.example/a.jpg" }),
    ).toBe(true);
    expect(passengerHasIdProof({ idProofUrl: "/uploads/id.pdf" })).toBe(true);
    expect(passengerHasIdProof({ name: "A" })).toBe(false);
    expect(passengerHasIdProof({ aadhaar: "1234" })).toBe(false);
  });

  it("extracts persons from array or { persons }", () => {
    expect(extractPassengerPersons([{ name: "A" }])).toHaveLength(1);
    expect(
      extractPassengerPersons({ persons: [{ name: "A" }, { name: "B" }] }),
    ).toHaveLength(2);
  });

  it("finds travelers missing ID proof", () => {
    const missing = findPassengersMissingIdProof({
      persons: [
        { name: "Lead", aadhaarUrl: "https://x/a.jpg" },
        { name: "Guest" },
      ],
    });
    expect(missing).toEqual([{ index: 2, name: "Guest" }]);
  });

  it("treats BookingDocument as satisfying proof", () => {
    const missing = findPassengersMissingIdProof(
      { persons: [{ id: "p1", name: "Lead" }] },
      [{ passengerId: "p1", id: "doc1" }],
    );
    expect(missing).toHaveLength(0);
  });

  it("skips cancelled passengers", () => {
    const missing = findPassengersMissingIdProof({
      persons: [
        { name: "Lead", aadhaarUrl: "https://x/a.jpg" },
        { name: "Gone", isCancelled: true },
      ],
    });
    expect(missing).toHaveLength(0);
  });

  it("assertPassengersHaveIdProof returns message when missing", () => {
    const err = assertPassengersHaveIdProof([{ name: "Solo" }]);
    expect(err?.message).toMatch(/Aadhaar/);
    expect(assertPassengersHaveIdProof([
      { name: "Solo", idProofUrl: "https://x/id.pdf" },
    ])).toBeNull();
  });
});
