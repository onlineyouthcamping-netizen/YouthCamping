const {
  canViewProfit,
  stripProfitFields,
  withProfitFields,
} = require('../src/utils/profitVisibility');

describe('Founder-only profit visibility policy', () => {
  test('canViewProfit allows superadmin, founder, owner, super_admin', () => {
    expect(canViewProfit({ role: 'superadmin' })).toBe(true);
    expect(canViewProfit({ role: 'founder' })).toBe(true);
    expect(canViewProfit({ role: 'owner' })).toBe(true);
    expect(canViewProfit({ role: 'super_admin' })).toBe(true);
    expect(canViewProfit('superadmin')).toBe(true);
    expect(canViewProfit({ role: 'SUPERADMIN' })).toBe(true);
    expect(canViewProfit({ role: 'admin', isSuperuser: true })).toBe(true);
  });

  test('canViewProfit denies admin, sales, finance, ops, guide, viewer', () => {
    for (const role of [
      'admin',
      'sales',
      'finance',
      'operations',
      'ops',
      'guide',
      'viewer',
      'ticketing',
    ]) {
      expect(canViewProfit({ role })).toBe(false);
      expect(canViewProfit(role)).toBe(false);
    }
    expect(canViewProfit(null)).toBe(false);
    expect(canViewProfit(undefined)).toBe(false);
    expect(canViewProfit({})).toBe(false);
  });

  test('withProfitFields omits profit keys for non-founders', () => {
    const base = {
      totalClientRevenue: 100000,
      totalVendorPayable: 60000,
    };
    const profit = {
      estimatedProfit: 40000,
      actualProfit: 25000,
    };

    const forAdmin = withProfitFields({ role: 'admin' }, base, profit);
    expect(forAdmin).toEqual(base);
    expect(forAdmin.estimatedProfit).toBeUndefined();
    expect(forAdmin.actualProfit).toBeUndefined();

    const forFounder = withProfitFields({ role: 'founder' }, base, profit);
    expect(forFounder.estimatedProfit).toBe(40000);
    expect(forFounder.actualProfit).toBe(25000);
    expect(forFounder.totalClientRevenue).toBe(100000);
  });

  test('stripProfitFields removes nested profitability blocks', () => {
    const payload = {
      revenue: { netRevenue: 100 },
      directCosts: { totalDirectCost: 60 },
      profitability: {
        grossProfit: 40,
        profitMarginPercent: 40,
        isProfitable: true,
      },
      nested: { profitPerTrip: 10, hotelCost: 5 },
    };

    const stripped = stripProfitFields(payload);
    expect(stripped.profitability).toBeUndefined();
    expect(stripped.nested.profitPerTrip).toBeUndefined();
    expect(stripped.nested.hotelCost).toBe(5);
    expect(stripped.revenue.netRevenue).toBe(100);
    expect(stripped.directCosts.totalDirectCost).toBe(60);
  });

  test('does not rely on email hardcoding for profit access', () => {
    // Any superadmin role may view profit regardless of email
    expect(
      canViewProfit({
        role: 'superadmin',
        email: 'any.founder@example.com',
      }),
    ).toBe(true);
    // Email alone never grants profit access
    expect(
      canViewProfit({
        role: 'admin',
        email: 'hemal.patel@youthcamping.online',
      }),
    ).toBe(false);
  });
});
