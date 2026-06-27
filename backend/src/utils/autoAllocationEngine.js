/**
 * autoAllocationEngine.js
 * Core logic engine for auto-allocating vehicles and rooms based on booking rules.
 */

/**
 * Executes vehicle and room auto-allocation for a given departure
 * @param {Array} bookings List of bookings for the trip departure
 * @param {Array} fleet List of available transport fleet (tempos/cars)
 * @returns {Object} { vehicleAllocations, roomAllocations, flags, whatsappTempoText, whatsappRoomText }
 */
function runAutoAllocation(bookings, fleet) {
  const flags = [];
  const vehicleAllocations = [];
  const roomAllocations = [];

  // 1. Flatten all travelers into traveler items with group metadata
  const travelers = [];
  bookings.forEach((b) => {
    const groupId = b.sourceBookingLinkId || b.bookingId;
    let passList = Array.isArray(b.passengers) ? b.passengers : [];
    if (passList.length === 0) {
      passList = [{ name: b.fullName || b.name, gender: b.gender, age: b.age }];
    }

    passList.forEach((p, idx) => {
      const rawGender = (p.gender || b.gender || '').trim().toLowerCase();
      let parsedGender = 'UNKNOWN';
      if (rawGender.startsWith('m')) parsedGender = 'Male';
      else if (rawGender.startsWith('f')) parsedGender = 'Female';

      travelers.push({
        travelerId: `${b.bookingId}-${idx}`,
        bookingId: b.bookingId,
        groupId,
        name: p.name || p.fullName || b.name,
        gender: parsedGender,
        age: p.age || b.age,
        groupSize: passList.length
      });
    });
  });

  // ── VEHICLE ALLOCATION (Rules 1, 2, 3) ──
  const groupMap = {};
  travelers.forEach((t) => {
    if (!groupMap[t.groupId]) groupMap[t.groupId] = [];
    groupMap[t.groupId].push(t);
  });

  const sortedGroupIds = Object.keys(groupMap).sort((a, b) => groupMap[b].length - groupMap[a].length);

  const fleetStatus = fleet.map((f) => ({
    ...f,
    remainingSeats: f.capacity,
    assignedTravelers: []
  }));

  sortedGroupIds.forEach((gId) => {
    const groupMembers = groupMap[gId];
    const gSize = groupMembers.length;

    let assignedFleet = fleetStatus.find((f) => f.remainingSeats >= gSize);

    if (assignedFleet) {
      groupMembers.forEach((t) => {
        assignedFleet.assignedTravelers.push(t);
        assignedFleet.remainingSeats -= 1;
        vehicleAllocations.push({
          fleetId: assignedFleet.id,
          bookingId: t.bookingId,
          travelerName: t.name,
          seatNumber: assignedFleet.capacity - assignedFleet.remainingSeats
        });
      });
    } else {
      if (gSize >= 5) {
        flags.push(`🚨 Group (${groupMembers[0].name} & ${gSize - 1} others) exceeds single vehicle capacity — manual review recommended.`);
      }
      groupMembers.forEach((t) => {
        let availFleet = fleetStatus.find((f) => f.remainingSeats > 0);
        if (availFleet) {
          availFleet.assignedTravelers.push(t);
          availFleet.remainingSeats -= 1;
          vehicleAllocations.push({
            fleetId: availFleet.id,
            bookingId: t.bookingId,
            travelerName: t.name,
            seatNumber: availFleet.capacity - availFleet.remainingSeats
          });
        } else {
          flags.push(`⚠️ Capacity overflow: No vehicle capacity left for traveler ${t.name} (${t.bookingId}).`);
        }
      });
    }
  });

  // ── ROOM ALLOCATION (Rules 4, 5, 6) ──
  let roomCounter = 101;

  // Rule 4: Multi-person groups get their own room
  sortedGroupIds.forEach((gId) => {
    const groupMembers = groupMap[gId];
    if (groupMembers.length > 1) {
      // Check if any member in group has UNKNOWN gender
      groupMembers.forEach((t) => {
        if (t.gender === 'UNKNOWN') {
          flags.push(`🚨 TRAVELER_GENDER_MISSING: Traveler ${t.name} (${t.bookingId}) has unknown gender.`);
        }
      });

      const roomNum = `Room ${roomCounter++}`;
      const roomType = groupMembers.length === 2 ? 'TWIN' : groupMembers.length === 3 ? 'TRIPLE' : 'QUAD/FAMILY';
      const genderGroup = 'GROUP';

      groupMembers.forEach((t) => {
        roomAllocations.push({
          roomNumber: roomNum,
          roomType,
          genderGroup,
          bookingId: t.bookingId,
          travelerName: t.name
        });
      });
    }
  });

  // Rule 5: Solo travelers clubbed by gender (UNKNOWN gender blocked from automatic room allocation)
  const soloTravelers = travelers.filter((t) => t.groupSize === 1);
  const soloBoys = soloTravelers.filter((t) => t.gender === 'Male');
  const soloGirls = soloTravelers.filter((t) => t.gender === 'Female');
  const soloUnknowns = soloTravelers.filter((t) => t.gender === 'UNKNOWN');

  soloUnknowns.forEach((t) => {
    flags.push(`🚨 TRAVELER_GENDER_MISSING: Traveler ${t.name} (${t.bookingId}) has unknown gender — automatic room allocation blocked.`);
  });

  // Club Solo Boys into twin rooms
  for (let i = 0; i < soloBoys.length; i += 2) {
    const roomNum = `Room ${roomCounter++}`;
    const pair = soloBoys.slice(i, i + 2);
    if (pair.length === 1) {
      flags.push(`⚠️ 1 solo male (${pair[0].name}) unallocated to twin room — needs manual room assignment.`);
    }
    pair.forEach((t) => {
      roomAllocations.push({
        roomNumber: roomNum,
        roomType: pair.length === 1 ? 'SINGLE' : 'TWIN',
        genderGroup: 'BOYS',
        bookingId: t.bookingId,
        travelerName: t.name
      });
    });
  }

  // Club Solo Girls into twin rooms
  for (let i = 0; i < soloGirls.length; i += 2) {
    const roomNum = `Room ${roomCounter++}`;
    const pair = soloGirls.slice(i, i + 2);
    if (pair.length === 1) {
      flags.push(`⚠️ 1 solo female (${pair[0].name}) unallocated to twin room — needs manual room assignment.`);
    }
    pair.forEach((t) => {
      roomAllocations.push({
        roomNumber: roomNum,
        roomType: pair.length === 1 ? 'SINGLE' : 'TWIN',
        genderGroup: 'GIRLS',
        bookingId: t.bookingId,
        travelerName: t.name
      });
    });
  }

  // ── WHATSAPP TEXT FORMATTING ──
  let whatsappTempoText = `🚌 *TEMPO & VEHICLE ALLOCATION LIST*\n\n`;
  fleetStatus.forEach((f, idx) => {
    whatsappTempoText += `*${f.vehicleType.toUpperCase()} ${idx + 1} (${f.capacity} Seater)* — ${f.assignedTravelers.length}/${f.capacity} filled\n`;
    f.assignedTravelers.forEach((t, i) => {
      whatsappTempoText += `${i + 1}. ${t.name}\n`;
    });
    whatsappTempoText += `\n`;
  });

  let whatsappRoomText = `🏨 *HOTEL ROOM ALLOCATION LIST*\n\n`;
  const roomMap = {};
  roomAllocations.forEach((r) => {
    if (!roomMap[r.roomNumber]) roomMap[r.roomNumber] = { type: r.roomType, gender: r.genderGroup, members: [] };
    roomMap[r.roomNumber].members.push(r.travelerName);
  });

  Object.entries(roomMap).forEach(([roomNum, details]) => {
    whatsappRoomText += `*${roomNum} (${details.type} - ${details.gender})*\n`;
    details.members.forEach((m, i) => {
      whatsappRoomText += `• ${m}\n`;
    });
    whatsappRoomText += `\n`;
  });

  return {
    vehicleAllocations,
    roomAllocations,
    flags,
    whatsappTempoText,
    whatsappRoomText
  };
}

module.exports = {
  runAutoAllocation
};
