/**
 * Retry logic for external APIs. Exponential backoff, configurable attempts.
 * Use for: Stripe, OpenAI, email, external fetch calls.
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  retryable?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "retryable">> & { retryable?: RetryOptions["retryable"] } = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  timeoutMs: 0,
};

function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("econnreset") || msg.includes("etimedout") || msg.includes("network")) return true;
    if (msg.includes("rate limit") || msg.includes("429")) return true;
    if (msg.includes("503") || msg.includes("502") || msg.includes("service unavailable")) return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (ms <= 0) return promise;
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Operation timed out")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/**
 * Execute fn with retries. Optional timeout per attempt. Throws last error if all attempts fail.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs, timeoutMs, retryable = isRetryable } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const p = fn();
      return await withTimeout(p, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !retryable(error)) throw error;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      await sleep(delay);
    }
  }
  throw lastError;
}
