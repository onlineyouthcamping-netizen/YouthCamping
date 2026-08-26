import { unstable_cache } from "next/cache";
import { fetchWithRetry } from "./fetchWithRetry";

export type PublicErrorKind = "http" | "timeout" | "network" | "unknown";

export type PublicSuccess<T> = {
  ok: true;
  data: T;
  empty: boolean;
  notFound?: boolean;
  stale?: boolean;
};

export type PublicFailure = {
  ok: false;
  kind: PublicErrorKind;
  status?: number;
};

export type PublicResult<T> = PublicSuccess<T> | PublicFailure;

const lastGood = new Map<string, unknown>();

export function getLastGood<T>(key: string): T | undefined {
  if (!lastGood.has(key)) return undefined;
  return lastGood.get(key) as T;
}

export function setLastGood<T>(key: string, data: T): void {
  lastGood.set(key, data);
}

export function clearLastGood(key: string): void {
  lastGood.delete(key);
}

export const MARKETING_FETCH_TIMEOUT_MS = 10_000;
export const CHROME_FETCH_TIMEOUT_MS = 8_000;

function isTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "TimeoutError" || err.name === "AbortError";
}

export function withFetchTimeout(
  init: RequestInit | undefined,
  timeoutMs: number,
): RequestInit {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  return { ...init, signal };
}

function classifyFetchError(err: unknown): PublicErrorKind {
  if (isTimeoutError(err)) return "timeout";
  return "network";
}

type LoadPublicJsonOptions<T> = {
  cacheKey: string;
  url: string;
  init?: RequestInit;
  timeoutMs?: number;
  revalidateSeconds: number;
  parse: (json: unknown) => T;
  isEmpty: (data: T) => boolean;
  emptyValue: T;
  /** Confirmed missing resource (do not treat as outage). */
  treat404AsEmpty?: boolean;
  /** Do not persist / recall last-good (live transactional). */
  skipCache?: boolean;
};

async function loadOnce<T>(
  opts: LoadPublicJsonOptions<T>,
): Promise<PublicResult<T>> {
  try {
    const res = await fetchWithRetry(
      opts.url,
      withFetchTimeout(opts.init, opts.timeoutMs ?? MARKETING_FETCH_TIMEOUT_MS),
      2,
      250,
    );
    if (!res) return { ok: false, kind: "network" };

    if (res.status === 404 && opts.treat404AsEmpty) {
      clearLastGood(opts.cacheKey);
      return {
        ok: true,
        data: opts.emptyValue,
        empty: true,
        notFound: true,
      };
    }

    if (!res.ok) {
      return { ok: false, kind: "http", status: res.status };
    }

    const json = await res.json();
    const data = opts.parse(json);
    return { ok: true, data, empty: opts.isEmpty(data) };
  } catch (err) {
    return { ok: false, kind: classifyFetchError(err) };
  }
}

/**
 * Marketing fetch with stale-if-error:
 * success → store in Next unstable_cache + in-memory last-good
 * failure → previous cached value if any, else a typed failure (never fake data)
 */
export async function loadPublicJson<T>(
  opts: LoadPublicJsonOptions<T>,
): Promise<PublicResult<T>> {
  if (opts.skipCache || typeof window !== "undefined") {
    const live = await loadOnce(opts);
    if (live.ok && !live.notFound) {
      setLastGood(opts.cacheKey, live.data);
    } else if (!live.ok) {
      const cached = getLastGood<T>(opts.cacheKey);
      if (cached !== undefined) {
        return {
          ok: true,
          data: cached,
          empty: opts.isEmpty(cached),
          stale: true,
        };
      }
    }
    return live;
  }

  try {
    const data = await unstable_cache(
      async () => {
        const result = await loadOnce(opts);
        if (!result.ok) {
          throw new Error(`SIE|${result.kind}|${result.status ?? ""}`);
        }
        if (!result.notFound) {
          setLastGood(opts.cacheKey, result.data);
        }
        return result.data;
      },
      [opts.cacheKey],
      { revalidate: opts.revalidateSeconds },
    )();

    return {
      ok: true,
      data,
      empty: opts.isEmpty(data),
    };
  } catch (err) {
    const cached = getLastGood<T>(opts.cacheKey);
    if (cached !== undefined) {
      return {
        ok: true,
        data: cached,
        empty: opts.isEmpty(cached),
        stale: true,
      };
    }
    const match =
      err instanceof Error
        ? err.message.match(/^SIE\|(http|timeout|network|unknown)\|(\d*)$/)
        : null;
    if (match) {
      return {
        ok: false,
        kind: match[1] as PublicErrorKind,
        status: match[2] ? Number(match[2]) : undefined,
      };
    }
    return { ok: false, kind: "unknown" };
  }
}

export function unwrapData<T>(result: PublicResult<T>, fallback: T): T {
  if (result.ok) return result.data;
  return fallback;
}
