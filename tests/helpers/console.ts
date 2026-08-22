import type { ConsoleMessage, Page } from '@playwright/test';

const IGNORE_PATTERNS = [
  /Download the React DevTools/i,
  /\[HMR\]/i,
  /third-party cookie/i,
  /chrome-extension:/i,
  /Failed to load resource: net::ERR_BLOCKED_BY_CLIENT/i,
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i,
  /google-analytics/i,
  /gtag/i,
  /fbq/i,
];

export function isApplicationConsoleError(msg: ConsoleMessage): boolean {
  if (msg.type() !== 'error') return false;
  const text = msg.text();
  if (IGNORE_PATTERNS.some((re) => re.test(text))) return false;
  return true;
}

export function attachConsoleMonitor(page: Page, errors: string[]) {
  page.on('console', (msg) => {
    if (isApplicationConsoleError(msg)) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
}
