/**
 * Fetch wrapper with a short retry for transient 5xx and network drops.
 * Timeouts are not retried (would double wait). 4xx is returned as-is.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 2,
  baseDelayMs = 250,
): Promise<Response | null> {
  const attempts = Math.max(1, maxRetries);
  let attempt = 0;

  while (attempt < attempts) {
    try {
      const response = await fetch(url, options);

      if (response.status >= 500 && attempt < attempts - 1) {
        attempt++;
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[fetchWithRetry] HTTP ${response.status} for ${url}. Retrying in ${delay}ms (${attempt}/${attempts})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      if (name === "TimeoutError" || name === "AbortError") {
        throw error;
      }

      attempt++;
      if (attempt >= attempts) {
        console.error(
          `[fetchWithRetry] Network request failed permanently for ${url}:`,
          error,
        );
        return null;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[fetchWithRetry] Network error for ${url}. Retrying in ${delay}ms (${attempt}/${attempts})...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return null;
}
