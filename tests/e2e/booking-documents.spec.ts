import path from 'path';
import { test, expect, gotoAdmin } from '../helpers/auth';
import { apiRequest, assertApiOk } from '../helpers/api';
import { discoverBookingWithPassenger } from '../helpers/discovery';
import { cleanupDocumentIfCreated } from '../helpers/cleanup';
import {
  mutationsAllowed,
  mutationSkipReason,
} from '../helpers/env';

const fixturePdf = path.join(__dirname, '..', 'fixtures', 'e2e-sample.pdf');

test.describe('booking-documents', () => {
  test('bookings page loads (read-only)', async ({ adminPage }) => {
    await gotoAdmin(adminPage, '/admin/bookings');
    await expect(adminPage.locator('body')).toBeVisible();
    await expect(
      adminPage.getByText(/booking/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('upload, download, and delete a generated test document', async ({
    adminSession,
  }) => {
    test.skip(!mutationsAllowed(), mutationSkipReason());

    const found = await discoverBookingWithPassenger(adminSession.token);
    test.skip(!found?.bookingId || !found.passengerId, 'No booking+passenger available for document E2E');

    const fs = await import('fs');
    const fileBuf = fs.readFileSync(fixturePdf);
    const form = new FormData();
    form.append(
      'document',
      new Blob([fileBuf], { type: 'application/pdf' }),
      'e2e-sample.pdf',
    );
    form.append('documentType', 'ID Document');

    const upload = await apiRequest(
      'POST',
      `/bookings/${found!.bookingId}/passengers/${found!.passengerId}/document`,
      { token: adminSession.token, form },
    );
    assertApiOk(upload, 'document-upload');
    expect(upload.ok).toBeTruthy();

    const docId = upload.json?.data?.id || upload.json?.id;
    const download = await apiRequest(
      'GET',
      docId
        ? `/bookings/${found!.bookingId}/documents/${docId}`
        : `/bookings/${found!.bookingId}/passengers/${found!.passengerId}/document`,
      { token: adminSession.token },
    );
    expect(download.status).toBeLessThan(400);
    expect(download.text.length).toBeGreaterThan(0);

    const del = await apiRequest(
      'DELETE',
      docId
        ? `/bookings/${found!.bookingId}/documents/${docId}`
        : `/bookings/${found!.bookingId}/passengers/${found!.passengerId}/document`,
      { token: adminSession.token },
    );
    assertApiOk(del, 'document-delete');
    expect(del.ok || del.status === 200 || del.status === 204).toBeTruthy();

    await cleanupDocumentIfCreated(
      adminSession.token,
      found!.bookingId,
      found!.passengerId,
      docId,
    );
  });
});
