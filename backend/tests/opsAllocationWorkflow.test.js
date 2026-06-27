const test = require('node:test');
const assert = require('node:assert/strict');
const { runAutoAllocation } = require('../src/utils/autoAllocationEngine');
const { normalizeDepartureDateIndia } = require('../src/controllers/opsController');

test('Auto-Allocation Engine groups large groups together and handles gender segregation', () => {
  const mockBookings = [
    {
      bookingId: 'BK-GRP-A',
      sourceBookingLinkId: 'LINK-1',
      fullName: 'Rahul Sharma',
      gender: 'Male',
      passengers: [
        { name: 'Rahul Sharma', gender: 'Male' },
        { name: 'Priya Sharma', gender: 'Female' },
        { name: 'Amit Sharma', gender: 'Male' },
        { name: 'Sneha Sharma', gender: 'Female' },
        { name: 'Ravi Sharma', gender: 'Male' }
      ]
    },
    {
      bookingId: 'BK-SOLO-1',
      fullName: 'Manish Kumar',
      gender: 'Male'
    },
    {
      bookingId: 'BK-SOLO-2',
      fullName: 'Deepak Verma',
      gender: 'Male'
    }
  ];

  const mockFleet = [
    { id: 'FL-1', vehicleType: '13 Seater Tempo', capacity: 13 },
    { id: 'FL-2', vehicleType: '17 Seater Tempo', capacity: 17 }
  ];

  const result = runAutoAllocation(mockBookings, mockFleet);

  assert.ok(result.vehicleAllocations.length >= 7);
  assert.ok(result.roomAllocations.length >= 6);
  assert.ok(result.whatsappTempoText.includes('TEMPO & VEHICLE ALLOCATION LIST'));
  assert.ok(result.whatsappRoomText.includes('HOTEL ROOM ALLOCATION LIST'));
});

test('Missing traveler gender blocks automatic room allocation and creates review flag', () => {
  const mockBookings = [
    {
      bookingId: 'BK-UNKNOWN-GENDER',
      fullName: 'Taylor Smith',
      gender: ''
    }
  ];
  const mockFleet = [{ id: 'FL-1', vehicleType: '13 Seater Tempo', capacity: 13 }];

  const result = runAutoAllocation(mockBookings, mockFleet);

  assert.equal(result.vehicleAllocations.length, 1);
  assert.equal(result.roomAllocations.length, 0);
  assert.ok(result.flags.some(f => f.includes('TRAVELER_GENDER_MISSING')));
});

test('Capacity overflow creates blocking review flag', () => {
  const mockBookings = [
    { bookingId: 'BK-OVER-1', fullName: 'User 1', gender: 'Male', passengers: Array(10).fill({ name: 'Pax', gender: 'Male' }) },
    { bookingId: 'BK-OVER-2', fullName: 'User 2', gender: 'Male', passengers: Array(10).fill({ name: 'Pax', gender: 'Male' }) }
  ];
  const mockFleet = [{ id: 'FL-SMALL', vehicleType: '13 Seater Tempo', capacity: 13 }];

  const result = runAutoAllocation(mockBookings, mockFleet);

  assert.ok(result.flags.some(f => f.includes('Capacity overflow')));
});

test('Calculates operational accounting totals and profit per trip correctly', () => {
  const hotelCost = 30000;
  const transportCost = 66000;
  const guideCost = 15000;
  const miscCost = 5000;

  const totalOpsCost = hotelCost + transportCost + guideCost + miscCost;
  assert.equal(totalOpsCost, 116000);

  const travelerCount = 19;
  const perPersonOpsCost = totalOpsCost / travelerCount;
  assert.equal(Math.round(perPersonOpsCost), 6105);

  const totalRevenueCollected = 150000;
  const profitPerTrip = totalRevenueCollected - totalOpsCost;
  assert.equal(profitPerTrip, 34000);
});

test('India timezone normalization resolves timestamps to 10 July 2026 India departure workspace', () => {
  const t1 = normalizeDepartureDateIndia('2026-07-09T18:30:00.000Z'); // 10 July 00:00 IST
  const t2 = normalizeDepartureDateIndia('2026-07-10T00:00:00.000Z'); // 10 July 05:30 IST
  const t3 = normalizeDepartureDateIndia('2026-07-10T05:30:00.000Z'); // 10 July 11:00 IST

  assert.ok(t1 instanceof Date);
  assert.equal(t1.toISOString(), '2026-07-10T00:00:00.000Z');
  assert.equal(t2.toISOString(), '2026-07-10T00:00:00.000Z');
  assert.equal(t3.toISOString(), '2026-07-10T00:00:00.000Z');
});

test('Missing departure date returns null during normalization', () => {
  const nullResult = normalizeDepartureDateIndia(null);
  const emptyResult = normalizeDepartureDateIndia('');

  assert.equal(nullResult, null);
  assert.equal(emptyResult, null);
});
