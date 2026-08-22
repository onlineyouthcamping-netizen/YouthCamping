import { test, expect, gotoAdmin } from '../helpers/auth';
import { assertApiOk } from '../helpers/api';
import {
  discoverAdminTrip,
  discoverDeparture,
  fetchOpsSection,
} from '../helpers/discovery';
import { attachApiMonitor, assertNoServerErrors, type TrackedFailure } from '../helpers/network';

test.describe('departure-hub.smoke', () => {
  test('Departure Hub opens and ops sections load for a discovered departure', async ({
    adminPage,
    adminSession,
  }) => {
    const failures: TrackedFailure[] = [];
    attachApiMonitor(adminPage, failures, 'departure-hub');

    await gotoAdmin(adminPage, '/admin/operations');
    await expect(adminPage.locator('body')).toBeVisible();
    await expect(
      adminPage.getByText(/departure/i).first(),
    ).toBeVisible({ timeout: 25_000 });

    const trip = await discoverAdminTrip(adminSession.token);
    test.skip(!trip, 'No trips available to open Departure Hub');
    const dep = await discoverDeparture(adminSession.token, trip!.id);
    test.skip(!dep, 'No departure dates available for discovered trip');

    const departureId = `${dep!.tripId}_${dep!.departureDate}`;
    await gotoAdmin(
      adminPage,
      `/admin/departure-workspace?departureId=${encodeURIComponent(departureId)}&tab=overview`,
    );
    await expect(adminPage).toHaveURL(/departure-workspace/);

    const hotels = await fetchOpsSection(
      adminSession.token,
      'hotels',
      dep!.tripId,
      dep!.departureDate,
    );
    assertApiOk(hotels, 'ops/hotels');
    expect(hotels.status).not.toBe(500);
    expect(hotels.status).not.toBe(404);

    const fleet = await fetchOpsSection(
      adminSession.token,
      'transport',
      dep!.tripId,
      dep!.departureDate,
    );
    assertApiOk(fleet, 'ops/transport');
    expect(fleet.status).not.toBe(500);

    const guides = await fetchOpsSection(
      adminSession.token,
      'guides',
      dep!.tripId,
      dep!.departureDate,
    );
    assertApiOk(guides, 'ops/guides');

    const activities = await fetchOpsSection(
      adminSession.token,
      'activities',
      dep!.tripId,
      dep!.departureDate,
    );
    assertApiOk(activities, 'ops/activities');

    await gotoAdmin(
      adminPage,
      `/admin/departure-workspace?departureId=${encodeURIComponent(departureId)}&tab=hotels`,
    );
    await expect(adminPage.locator('body')).toBeVisible();

    assertNoServerErrors(failures);
  });
});
