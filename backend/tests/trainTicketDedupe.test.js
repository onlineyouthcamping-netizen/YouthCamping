const {
  normalizeTravelerName,
  normalizeJourneyRef,
  travelerJourneyKey,
  isActiveTicket,
  scoreTicket,
  pickKeeperAndDuplicates,
  findDuplicateGroups,
  dedupeActiveTickets,
} = require('../src/utils/trainTicketDedupe');

describe('trainTicketDedupe', () => {
  it('normalizes traveler names and journey refs', () => {
    expect(normalizeTravelerName('  Ayan   Lakhani ')).toBe('ayan lakhani');
    expect(normalizeJourneyRef(null)).toBe('DEPARTURE');
    expect(normalizeJourneyRef('')).toBe('DEPARTURE');
    expect(normalizeJourneyRef('DEPARTURE')).toBe('DEPARTURE');
    expect(normalizeJourneyRef('RETURN')).toBe('RETURN');
    expect(
      travelerJourneyKey('Ayan Lakhani', null),
    ).toBe('ayan lakhani|DEPARTURE');
  });

  it('treats cancelled and superseded as inactive', () => {
    expect(isActiveTicket({ ticketStatus: 'PENDING' })).toBe(true);
    expect(isActiveTicket({ ticketStatus: 'CANCELLED' })).toBe(false);
    expect(
      isActiveTicket({
        ticketStatus: 'PENDING',
        supersededByTicketId: 'x',
      }),
    ).toBe(false);
  });

  it('keeps Done ticket over Not done duplicate (screenshot case)', () => {
    const done = {
      id: 'done-1',
      travelerName: 'Ayan Lakhani',
      passengerReference: 'DEPARTURE',
      ticketStatus: 'CONFIRMED',
      createdAt: '2026-08-01T10:00:00.000Z',
    };
    const notDone = {
      id: 'pending-1',
      travelerName: 'Ayan Lakhani',
      passengerReference: 'DEPARTURE',
      ticketStatus: 'PENDING',
      createdAt: '2026-08-20T10:00:00.000Z',
    };
    const { keep, cancel } = pickKeeperAndDuplicates([done, notDone]);
    expect(keep.id).toBe('done-1');
    expect(cancel.map((c) => c.id)).toEqual(['pending-1']);
    expect(scoreTicket(done)).toBeGreaterThan(scoreTicket(notDone));
  });

  it('finds duplicate groups for 4 travelers × 2 departure rows = 4 cancel groups', () => {
    const names = [
      'Ayan Lakhani',
      'Shafin Sarmali',
      'Aziz Matli',
      'Shabaaz lakhani',
    ];
    const tickets = [];
    names.forEach((name, i) => {
      tickets.push({
        id: `old-${i}`,
        travelerName: name,
        passengerReference: 'DEPARTURE',
        ticketStatus: i === 0 ? 'CONFIRMED' : 'PENDING',
        createdAt: '2026-08-01T10:00:00.000Z',
      });
      tickets.push({
        id: `new-${i}`,
        travelerName: name,
        passengerReference: 'DEPARTURE',
        ticketStatus: 'PENDING',
        createdAt: '2026-08-20T10:00:00.000Z',
      });
      tickets.push({
        id: `ret-${i}`,
        travelerName: name,
        passengerReference: 'RETURN',
        ticketStatus: 'PENDING',
        createdAt: '2026-08-01T10:00:00.000Z',
      });
    });

    const groups = findDuplicateGroups(tickets);
    expect(groups).toHaveLength(4);
    expect(groups.every((g) => g.key.endsWith('|DEPARTURE'))).toBe(true);
    expect(groups.reduce((n, g) => n + g.cancelIds.length, 0)).toBe(4);

    const active = dedupeActiveTickets(tickets);
    expect(active.filter((t) => t.passengerReference === 'DEPARTURE')).toHaveLength(4);
    expect(active.filter((t) => t.passengerReference === 'RETURN')).toHaveLength(4);
    expect(active.find((t) => t.travelerName === 'Ayan Lakhani' && t.passengerReference === 'DEPARTURE').ticketStatus).toBe('CONFIRMED');
  });

  it('does not treat different journey types as duplicates', () => {
    const tickets = [
      {
        id: 'd1',
        travelerName: 'Ayan',
        passengerReference: 'DEPARTURE',
        ticketStatus: 'PENDING',
      },
      {
        id: 'r1',
        travelerName: 'Ayan',
        passengerReference: 'RETURN',
        ticketStatus: 'PENDING',
      },
    ];
    expect(findDuplicateGroups(tickets)).toHaveLength(0);
    expect(dedupeActiveTickets(tickets)).toHaveLength(2);
  });
});
