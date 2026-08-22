import { adminEmail, adminPassword, apiBaseUrl } from './env';

export type AdminSession = {
  token: string;
  admin: Record<string, unknown>;
};

export type ApiResult = {
  ok: boolean;
  status: number;
  url: string;
  method: string;
  json: any;
  text: string;
};

function prismaErrorInBody(text: string): boolean {
  return /P2022|P2025|PrismaClientKnownRequestError/i.test(text);
}

export async function apiRequest(
  method: string,
  path: string,
  opts: {
    token?: string;
    body?: unknown;
    form?: FormData;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResult> {
  const url = path.startsWith('http')
    ? path
    : `${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form as any;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, { method, headers, body });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    ok: res.ok,
    status: res.status,
    url,
    method,
    json,
    text,
  };
}

export function describeApiFailure(result: ApiResult, testName: string): string {
  return `[${testName}] ${result.method} ${result.url} -> ${result.status} ${result.text.slice(0, 400)}`;
}

export function assertApiOk(result: ApiResult, testName: string) {
  if (result.status >= 500) {
    throw new Error(describeApiFailure(result, testName));
  }
  if (prismaErrorInBody(result.text)) {
    throw new Error(
      `Prisma/validation error in ${testName}: ${describeApiFailure(result, testName)}`,
    );
  }
}

export async function loginAdminApi(): Promise<AdminSession> {
  const email = adminEmail();
  const password = adminPassword();
  if (!email || !password) {
    throw new Error('Admin credentials are not configured');
  }
  const result = await apiRequest('POST', '/admin/login', {
    body: { email, password },
  });
  if (!result.ok) {
    throw new Error(describeApiFailure(result, 'loginAdminApi'));
  }
  const data = result.json?.data || result.json;
  const token = data?.token;
  const admin = data?.admin || data?.user;
  if (!token) {
    throw new Error('Login succeeded but no token was returned');
  }
  return { token, admin };
}

export async function apiGet(path: string, token?: string) {
  return apiRequest('GET', path, { token });
}

export async function apiPatch(path: string, token: string, body: unknown) {
  return apiRequest('PATCH', path, { token, body });
}
