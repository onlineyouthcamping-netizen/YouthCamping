import type { Page, Request, Response } from '@playwright/test';

export type TrackedFailure = {
  method: string;
  url: string;
  status: number;
  bodySnippet: string;
  testName: string;
};

const IGNORE_HOST_SNIPPETS = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  'doubleclick.net',
  'sentry.io',
  'hotjar.com',
  'clarity.ms',
  'cdn.jsdelivr.net',
];

export function isIgnoredUrl(url: string): boolean {
  return IGNORE_HOST_SNIPPETS.some((h) => url.includes(h));
}

export function isAppApiUrl(url: string): boolean {
  return (
    url.includes('/api/') ||
    url.includes('api.youthcamping') ||
    url.includes('youthcamping.online') ||
    url.includes('localhost')
  );
}

export async function snippetFromResponse(res: Response, limit = 400): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, limit);
  } catch {
    return '';
  }
}

export function attachApiMonitor(page: Page, failures: TrackedFailure[], testName: string) {
  const pending = new Map<Request, number>();

  page.on('request', (req) => {
    pending.set(req, Date.now());
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (!isAppApiUrl(url) || isIgnoredUrl(url)) return;
    const status = res.status();
    if (status < 500) return;
    failures.push({
      method: res.request().method(),
      url,
      status,
      bodySnippet: await snippetFromResponse(res),
      testName,
    });
  });
}

export function formatFailures(failures: TrackedFailure[]): string {
  return failures
    .map(
      (f) =>
        `[${f.testName}] ${f.method} ${f.url} -> ${f.status} ${f.bodySnippet}`,
    )
    .join('\n');
}

export function assertNoServerErrors(failures: TrackedFailure[]) {
  if (failures.length === 0) return;
  throw new Error(`Unexpected 5xx / failed app requests:\n${formatFailures(failures)}`);
}
