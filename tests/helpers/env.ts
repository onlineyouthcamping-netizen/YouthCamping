export function publicBaseUrl(): string {
  return (process.env.E2E_BASE_URL || 'https://youthcamping.online').replace(
    /\/+$/,
    '',
  );
}

export function adminBaseUrl(): string {
  const explicit = process.env.E2E_ADMIN_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  const publicUrl = publicBaseUrl();
  if (publicUrl.includes('admin.')) return publicUrl;
  try {
    const u = new URL(publicUrl);
    u.hostname = u.hostname.startsWith('www.')
      ? `admin.${u.hostname.slice(4)}`
      : `admin.${u.hostname}`;
    return u.toString().replace(/\/+$/, '');
  } catch {
    return 'https://admin.youthcamping.online';
  }
}

export function apiBaseUrl(): string {
  const explicit = process.env.E2E_API_URL?.trim();
  if (explicit) {
    const cleaned = explicit.replace(/\/+$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  return 'https://api.youthcamping.online/api';
}

export function e2eEnv(): string {
  const raw = (process.env.E2E_ENV || '').trim().toLowerCase();
  if (raw) return raw;
  const url = `${publicBaseUrl()} ${adminBaseUrl()}`.toLowerCase();
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
  if (url.includes('staging') || url.includes('preview')) return 'staging';
  return 'production';
}

export function isProductionEnv(): boolean {
  return e2eEnv() === 'production';
}

export function mutationsAllowed(): boolean {
  return process.env.E2E_ALLOW_MUTATIONS === 'true';
}

export function mutationSkipReason(): string {
  return (
    `Skipped mutation: E2E_ENV=${e2eEnv()} and E2E_ALLOW_MUTATIONS is not true. ` +
    'Production smoke stays read-only unless E2E_ALLOW_MUTATIONS=true.'
  );
}

export function skipUnlessMutationsAllowed(
  test: { skip: (condition: boolean, description?: string) => void },
): void {
  test.skip(!mutationsAllowed(), mutationSkipReason());
}

export function adminEmail(): string | undefined {
  const v = process.env.E2E_ADMIN_EMAIL?.trim();
  return v || undefined;
}

export function adminPassword(): string | undefined {
  const v = process.env.E2E_ADMIN_PASSWORD?.trim();
  return v || undefined;
}

export function hasAdminCredentials(): boolean {
  return Boolean(adminEmail() && adminPassword());
}

export function adminSkipReason(): string {
  return 'Skipped: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are not set.';
}
