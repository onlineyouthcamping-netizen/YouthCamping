const {
  calculateHotelStayCost,
  normaliseHotelPricingMethod,
} = require("../src/utils/hotelStayCost");

describe("calculateHotelStayCost", () => {
  test("per-person multiplies rooms by occupancy (Day 7 Tenzin-style)", () => {
    const total = calculateHotelStayCost({
      pricingMethod: "per-person",
      doubleRoomsCount: 1,
      tripleRoomsCount: 4,
      quadRoomsCount: 1,
      extraPersonsCount: 2,
      doubleRate: 1850,
      tripleRate: 1850,
      quadRate: 1850,
      extraBedRate: 1850,
      nightsCount: 1,
    });
    // 2+12+4+2 = 20 pax × 1850 = 37000
    expect(total).toBe(37000);
  });

  test("room-wise does not multiply by occupancy", () => {
    const total = calculateHotelStayCost({
      pricingMethod: "room-wise",
      doubleRoomsCount: 1,
      tripleRoomsCount: 4,
      quadRoomsCount: 1,
      extraPersonsCount: 2,
      doubleRate: 1850,
      tripleRate: 1850,
      quadRate: 1850,
      extraBedRate: 1850,
      nightsCount: 1,
    });
    // (1+4+1 rooms + 2 extras) × 1850 = 14800 — no occupancy multipliers
    expect(total).toBe(14800);
  });

  test("legacy bug pattern: room-wise formula understates per-person stays", () => {
    const brokenRoomWise = calculateHotelStayCost({
      pricingMethod: "room-wise",
      doubleRoomsCount: 1,
      tripleRoomsCount: 4,
      quadRoomsCount: 1,
      extraPersonsCount: 2,
      doubleRate: 1850,
      tripleRate: 1850,
      quadRate: 1850,
      extraBedRate: 1850,
      nightsCount: 1,
    });
    // Previous backend always used room-wise → 14800 even when UI was per-person
    expect(brokenRoomWise).toBe(14800);
    expect(
      calculateHotelStayCost({
        pricingMethod: "per-person",
        doubleRoomsCount: 1,
        tripleRoomsCount: 4,
        quadRoomsCount: 1,
        extraPersonsCount: 2,
        doubleRate: 1850,
        tripleRate: 1850,
        quadRate: 1850,
        extraBedRate: 1850,
        nightsCount: 1,
      }),
    ).toBe(37000);
  });

  test("manual uses totalAmount", () => {
    expect(
      calculateHotelStayCost({
        pricingMethod: "manual",
        totalAmount: 12500,
        doubleRoomsCount: 2,
        doubleRate: 999,
      }),
    ).toBe(12500);
  });

  test("multi-night multiplies nights", () => {
    expect(
      calculateHotelStayCost({
        pricingMethod: "per-person",
        doubleRoomsCount: 1,
        tripleRoomsCount: 0,
        quadRoomsCount: 0,
        extraPersonsCount: 0,
        doubleRate: 1000,
        nightsCount: 3,
      }),
    ).toBe(6000);
  });

  test("normaliseHotelPricingMethod accepts common aliases", () => {
    expect(normaliseHotelPricingMethod("per-person")).toBe("PER_PERSON");
    expect(normaliseHotelPricingMethod("PER_PAX")).toBe("PER_PERSON");
    expect(normaliseHotelPricingMethod("room-wise")).toBe("ROOM_WISE");
  });
});
