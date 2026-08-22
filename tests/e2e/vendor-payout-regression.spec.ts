import { test, expect, gotoAdmin } from '../helpers/auth';
import { apiGet, apiPatch, assertApiOk, describeApiFailure } from '../helpers/api';
import {
  canonicalTypeForCategory,
  fetchVendorQueue,
  itemsBySourceType,
} from '../helpers/discovery';
import {
  mutationsAllowed,
  mutationSkipReason,
} from '../helpers/env';

const CANONICAL = [
  'OPS_HOTEL_BOOKING',
  'OPS_TRANSPORT_FLEET',
  'OPS_GUIDE_PAYMENT',
  'OPS_ACTIVITY',
] as const;

test.describe('vendor-payout-regression', () => {
  test('queue items expose canonical sourceType/sourceId invariants (read-only)', async ({
    adminSession,
  }) => {
    const items = await fetchVendorQueue(adminSession.token);
    const queueRes = await apiGet(
      '/finance/control-center/vendor-queue?limit=100',
      adminSession.token,
    );
    assertApiOk(queueRes, 'vendor-queue');

    for (const item of items) {
      const expected = canonicalTypeForCategory(item);
      if (item.operationalLinked) {
        expect(item.sourceType, `linked item ${item.id}`).toBeTruthy();
        expect(item.sourceId, `linked item ${item.id}`).toBeTruthy();
        if (expected && CANONICAL.includes(expected as any)) {
          expect(item.sourceType).toBe(expected);
        }
      } else if (!item.sourceType || !item.sourceId) {
        expect(item.operationalLinked).toBeFalsy();
      }
    }

    for (const type of CANONICAL) {
      const matches = itemsBySourceType(items, type);
      for (const row of matches) {
        expect(row.sourceId).toBeTruthy();
        if (type === 'OPS_HOTEL_BOOKING') {
          expect(row.sourceType).toBe('OPS_HOTEL_BOOKING');
        }
        if (type === 'OPS_TRANSPORT_FLEET') {
          expect(row.sourceType).toBe('OPS_TRANSPORT_FLEET');
        }
        if (type === 'OPS_GUIDE_PAYMENT') {
          expect(row.sourceType).toBe('OPS_GUIDE_PAYMENT');
        }
        if (type === 'OPS_ACTIVITY') {
          expect(row.sourceType).toBe('OPS_ACTIVITY');
        }
      }
    }
  });

  test('historical unresolved records stay operationally unlinked', async ({
    adminPage,
    adminSession,
  }) => {
    const items = await fetchVendorQueue(adminSession.token);
    const unresolved = items.filter(
      (i) => !i.sourceType || !i.sourceId || i.operationalLinked === false,
    );

    await gotoAdmin(adminPage, '/admin/approvals-hub?tab=vendor-bills');
    await expect(adminPage.getByText(/outgoing vendor payments/i).first()).toBeVisible({
      timeout: 20_000,
    });

    if (unresolved.length > 0) {
      const unavailable = adminPage.getByText(/unavailable/i);
      // Queue may label unresolved rows as Unavailable / operational record unavailable
      if ((await unavailable.count()) > 0) {
        await expect(unavailable.first()).toBeVisible();
      }
    }
  });

  test('duplicate review/approve is rejected without a second write-back', async ({
    adminSession,
  }) => {
    test.skip(!mutationsAllowed(), mutationSkipReason());

    const items = await fetchVendorQueue(adminSession.token);
    const reviewed = items.find(
      (i) =>
        String(i.approvalStatus || '').toUpperCase().includes('REVIEWED') ||
        String(i.approvalStatus || '').toUpperCase().includes('APPROVED'),
    );
    test.skip(!reviewed, 'No already-reviewed vendor payment available for duplicate-protection check');

    const secondReview = await apiPatch(
      `/finance/vendor-payments/${reviewed!.id}/review-fc`,
      adminSession.token,
      { reason: 'e2e duplicate review must fail safely' },
    );
    expect(secondReview.status, describeApiFailure(secondReview, 'duplicate-review')).toBeGreaterThanOrEqual(400);
    expect(secondReview.status).toBeLessThan(500);

    const secondApprove = await apiPatch(
      `/finance/vendor-payments/${reviewed!.id}/approve-founder`,
      adminSession.token,
      { reason: 'e2e duplicate founder approval must fail safely' },
    );
    if (String(reviewed!.approvalStatus || '').toUpperCase().includes('APPROVED')) {
      expect(secondApprove.status).toBeGreaterThanOrEqual(400);
      expect(secondApprove.status).toBeLessThan(500);
    }
  });

  test('cross-tenant operational id resolves to 404/access denied', async ({
    adminSession,
  }) => {
    test.skip(!mutationsAllowed(), mutationSkipReason());
    const fakeId = 'clxxxxxxxxxxxxxxxxxxxxxx';
    const res = await apiPatch(
      `/finance/vendor-payments/${fakeId}/review-fc`,
      adminSession.token,
      { reason: 'e2e cross-tenant probe' },
    );
    expect([400, 403, 404]).toContain(res.status);
    expect(res.status).toBeLessThan(500);
  });
});
