import { test, expect, gotoAdmin } from '../helpers/auth';
import { apiGet, assertApiOk } from '../helpers/api';
import { attachApiMonitor, assertNoServerErrors, type TrackedFailure } from '../helpers/network';

test.describe('finance.smoke', () => {
  test('Finance and Approvals pages load without 5xx', async ({ adminPage, adminSession }) => {
    const failures: TrackedFailure[] = [];
    attachApiMonitor(adminPage, failures, 'finance-ui');

    await gotoAdmin(adminPage, '/admin/finance');
    await expect(adminPage.locator('body')).toBeVisible();

    await gotoAdmin(adminPage, '/admin/approvals-hub?tab=payment-approvals');
    await expect(
      adminPage.getByRole('button', { name: /incoming payments/i }).or(
        adminPage.getByText(/incoming payments/i),
      ).first(),
    ).toBeVisible({ timeout: 20_000 });

    await gotoAdmin(adminPage, '/admin/approvals-hub?tab=vendor-bills');
    await expect(
      adminPage.getByText(/outgoing vendor payments/i).first(),
    ).toBeVisible({ timeout: 20_000 });

    assertNoServerErrors(failures);
  });

  test('pending approvals and vendor queue APIs succeed', async ({ adminSession }) => {
    const pending = await apiGet('/finance/approvals/pending', adminSession.token);
    assertApiOk(pending, 'finance/approvals/pending');
    expect(pending.status).toBeLessThan(400);
    expect(pending.json).toBeTruthy();

    const queue = await apiGet(
      '/finance/control-center/vendor-queue?limit=50',
      adminSession.token,
    );
    assertApiOk(queue, 'finance/control-center/vendor-queue');
    expect(queue.status).toBeLessThan(400);
    expect(Array.isArray(queue.json?.data)).toBeTruthy();
  });
});
