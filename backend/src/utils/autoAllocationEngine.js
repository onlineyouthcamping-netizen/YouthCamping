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
function runAutoAllocation(bookings, fleet, roomInventory) {
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
  // Separate travelers into groups vs solos
  const soloTravelers = travelers.filter((t) => t.groupSize === 1);
  const soloBoys = soloTravelers.filter((t) => t.gender === 'Male');
  const soloGirls = soloTravelers.filter((t) => t.gender === 'Female');
  const soloUnknowns = soloTravelers.filter((t) => t.gender === 'UNKNOWN');

  soloUnknowns.forEach((t) => {
    flags.push(`🚨 TRAVELER_GENDER_MISSING: Traveler ${t.name} (${t.bookingId}) has unknown gender — automatic room allocation blocked.`);
  });

  // Check unknown gender in groups
  sortedGroupIds.forEach((gId) => {
    const groupMembers = groupMap[gId];
    if (groupMembers.length > 1) {
      groupMembers.forEach((t) => {
        if (t.gender === 'UNKNOWN') {
          flags.push(`🚨 TRAVELER_GENDER_MISSING: Traveler ${t.name} (${t.bookingId}) has unknown gender.`);
        }
      });
    }
  });

  // Collect multi-person groups
  const multiGroups = sortedGroupIds
    .map(gId => groupMap[gId])
    .filter(g => g.length > 1);

  if (Array.isArray(roomInventory) && roomInventory.length > 0) {
    // ── INVENTORY-BASED ROOM ALLOCATION ──
    // Build room slots from inventory
    const roomSlots = roomInventory.map(r => ({
      id: r.id,
      roomLabel: r.roomLabel,
      roomType: r.roomType,
      genderGroup: (r.genderGroup || 'GROUP').toUpperCase(),
      capacity: r.capacity || 2,
      hotelName: r.hotelName,
      remaining: r.capacity || 2,
      assigned: []
    }));

    // Helper: find a room slot matching gender with enough remaining capacity
    const findRoom = (genderGroup, count) => {
      return roomSlots.find(r => r.genderGroup === genderGroup && r.remaining >= count);
    };

    // Step 1: Assign multi-person groups to GROUP/COUPLE rooms
    multiGroups.forEach(groupMembers => {
      let room = null;
      if (groupMembers.length === 2) {
        // For couples / duos: prioritize COUPLE rooms, then GROUP, then FAMILY
        room = findRoom('COUPLE', 2)
              || findRoom('GROUP', 2)
              || findRoom('FAMILY', 2);
      } else {
        // For larger groups: prioritize GROUP, then FAMILY, then COUPLE
        room = findRoom('GROUP', groupMembers.length)
              || findRoom('FAMILY', groupMembers.length)
              || findRoom('COUPLE', groupMembers.length);
      }

      // If no matching gender group room fits, fallback to any room with capacity
      if (!room) {
        room = roomSlots.find(r => r.remaining >= groupMembers.length);
      }

      if (room) {
        groupMembers.forEach(t => {
          room.assigned.push(t);
          room.remaining -= 1;
          roomAllocations.push({
            roomNumber: room.roomLabel,
            roomType: room.roomType,
            genderGroup: room.genderGroup,
            bookingId: t.bookingId,
            travelerName: t.name
          });
        });
      } else {
        flags.push(`⚠️ No room with ${groupMembers.length} capacity for group (${groupMembers[0].name} & ${groupMembers.length - 1} others) — needs manual assignment.`);
      }
    });

    // Step 2: Assign solo boys to BOYS rooms
    soloBoys.forEach(t => {
      let room = findRoom('BOYS', 1);
      if (!room) room = roomSlots.find(r => r.remaining >= 1 && r.genderGroup !== 'GIRLS');
      if (room) {
        room.assigned.push(t);
        room.remaining -= 1;
        roomAllocations.push({
          roomNumber: room.roomLabel,
          roomType: room.roomType,
          genderGroup: room.genderGroup,
          bookingId: t.bookingId,
          travelerName: t.name
        });
      } else {
        flags.push(`⚠️ No BOYS room capacity left for ${t.name} (${t.bookingId}) — needs manual assignment.`);
      }
    });

    // Step 3: Assign solo girls to GIRLS rooms
    soloGirls.forEach(t => {
      let room = findRoom('GIRLS', 1);
      if (!room) room = roomSlots.find(r => r.remaining >= 1 && r.genderGroup !== 'BOYS');
      if (room) {
        room.assigned.push(t);
        room.remaining -= 1;
        roomAllocations.push({
          roomNumber: room.roomLabel,
          roomType: room.roomType,
          genderGroup: room.genderGroup,
          bookingId: t.bookingId,
          travelerName: t.name
        });
      } else {
        flags.push(`⚠️ No GIRLS room capacity left for ${t.name} (${t.bookingId}) — needs manual assignment.`);
      }
    });

    // Add summary of room utilization
    roomSlots.forEach(r => {
      if (r.assigned.length === 0 && r.capacity > 0) {
        flags.push(`ℹ️ Room ${r.roomLabel} (${r.roomType} - ${r.genderGroup}) is empty — ${r.capacity} beds unused.`);
      }
    });

  } else {
    // ── FALLBACK: Auto-generate room numbers (original logic) ──
    let roomCounter = 101;

    // Rule 4: Multi-person groups get their own room
    multiGroups.forEach(groupMembers => {
      const roomNum = `Room ${roomCounter++}`;
      const roomType = groupMembers.length === 2 ? 'TWIN' : groupMembers.length === 3 ? 'TRIPLE' : 'QUAD/FAMILY';
      groupMembers.forEach((t) => {
        roomAllocations.push({
          roomNumber: roomNum,
          roomType,
          genderGroup: 'GROUP',
          bookingId: t.bookingId,
          travelerName: t.name
        });
      });
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
  }

  // ── WHATSAPP TEXT FORMATTING ──
  const whatsappTempoText = buildWhatsappTempoText(vehicleAllocations, fleetStatus);

  let whatsappRoomText = `🏨 *HOTEL ROOM ALLOCATION LIST*\n\n`;
  const roomMap = {};
  roomAllocations.forEach((r) => {
    if (!roomMap[r.roomNumber]) roomMap[r.roomNumber] = { type: r.roomType, gender: r.genderGroup, members: [] };
    roomMap[r.roomNumber].members.push(r.travelerName);
  });

  Object.entries(roomMap).forEach(([roomNum, details]) => {
    whatsappRoomText += `*${roomNum} (${details.type} - ${details.gender})*\n`;
    details.members.forEach((m) => {
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

function buildWhatsappTempoText(vehicleAllocations = [], fleetStatus = []) {
  let whatsappTempoText = `🚌 *TEMPO & VEHICLE ALLOCATION LIST*\n\n`;
  
  // Group allocations by fleetId
  const fleetMap = {};
  vehicleAllocations.forEach(va => {
    if (!fleetMap[va.fleetId]) fleetMap[va.fleetId] = [];
    fleetMap[va.fleetId].push(va);
  });

  if (fleetStatus.length > 0) {
    fleetStatus.forEach((f, idx) => {
      const allocs = fleetMap[f.id] || [];
      whatsappTempoText += `*${f.vehicleType.toUpperCase()} ${idx + 1} (${f.capacity} Seater)* — ${allocs.length}/${f.capacity} filled\n`;
      allocs.forEach((t, i) => {
        const seatStr = t.seatNumber ? ` [Seat #${t.seatNumber}]` : ` [Seat #${i + 1}]`;
        whatsappTempoText += `${i + 1}. ${t.travelerName}${seatStr}\n`;
      });
      whatsappTempoText += `\n`;
    });
  } else {
    // Fallback if fleetStatus array not provided
    Object.entries(fleetMap).forEach(([fleetId, allocs], idx) => {
      whatsappTempoText += `*VEHICLE ${idx + 1}* — ${allocs.length} assigned\n`;
      allocs.forEach((t, i) => {
        const seatStr = t.seatNumber ? ` [Seat #${t.seatNumber}]` : ` [Seat #${i + 1}]`;
        whatsappTempoText += `${i + 1}. ${t.travelerName}${seatStr}\n`;
      });
      whatsappTempoText += `\n`;
    });
  }
  return whatsappTempoText.trim();
}

module.exports = {
  runAutoAllocation,
  buildWhatsappTempoText
};
