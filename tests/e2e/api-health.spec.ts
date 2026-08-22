import { test, expect } from '@playwright/test';
import { apiGet, loginAdminApi } from '../helpers/api';
import { apiBaseUrl, hasAdminCredentials, adminSkipReason } from '../helpers/env';
import { attachApiMonitor, assertNoServerErrors, type TrackedFailure } from '../helpers/network';

test.describe('api-health', () => {
  test('GET /api/health returns ok JSON', async () => {
    const healthUrl = apiBaseUrl().replace(/\/api$/, '') + '/health';
    const res = await fetch(healthUrl);
    const text = await res.text();
    expect(res.status, `GET ${healthUrl} ${text.slice(0, 200)}`).toBeLessThan(500);
    expect(res.status).toBe(200);
    const json = JSON.parse(text);
    expect(json.status).toBe('ok');
  });

  test('public homepage and trips do not emit 5xx API calls', async ({ page }) => {
    const failures: TrackedFailure[] = [];
    attachApiMonitor(page, failures, 'api-health-public');
    await page.goto('/', { waitUntil: 'networkidle' }).catch(() =>
      page.goto('/', { waitUntil: 'domcontentloaded' }),
    );
    await page.goto('/trips', { waitUntil: 'domcontentloaded' });
    const server = failures.filter((f) => f.status >= 500);
    expect(server, server.map((s) => `${s.method} ${s.url} ${s.status} ${s.bodySnippet}`).join('\n')).toHaveLength(0);
  });

  test('authenticated required finance endpoints stay healthy', async () => {
    test.skip(!hasAdminCredentials(), adminSkipReason());
    const { token } = await loginAdminApi();
    const paths = [
      '/finance/approvals/pending',
      '/finance/control-center/vendor-queue?limit=10',
      '/admin/me',
    ];
    for (const p of paths) {
      const result = await apiGet(p, token);
      expect(
        result.status,
        `${result.method} ${result.url} -> ${result.status} ${result.text.slice(0, 300)}`,
      ).toBeLessThan(500);
      expect(result.status).not.toBe(404);
      if (result.status === 401 || result.status === 403) {
        throw new Error(
          `Unexpected ${result.status} after login: ${result.method} ${result.url} ${result.text.slice(0, 300)}`,
        );
      }
      expect(result.json, `malformed JSON from ${p}: ${result.text.slice(0, 200)}`).toBeTruthy();
    }
  });
});
