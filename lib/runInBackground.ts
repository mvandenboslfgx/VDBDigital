/**
 * Run a promise in the background without blocking the response.
 * Use for audit logging, email sending, and non-critical side effects.
 * Errors are logged but not rethrown.
 */

import { logger } from "@/lib/logger";

export function runInBackground(
  label: string,
  fn: () => Promise<void>
): void {
  void fn().catch((e) => {
    logger.logError(`Background/${label}`, e);
  });
}
