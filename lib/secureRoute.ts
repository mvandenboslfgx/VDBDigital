import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { validateCsrf } from "@/lib/csrf";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";
import {
  rateLimit,
  rateLimitAi,
  rateLimitAdmin,
  rateLimitAuth,
  rateLimitRegistration,
  rateLimitSensitive,
  getClientKey,
  getRateLimitKey,
} from "@/lib/rateLimit";
import { parseOrThrow } from "@/lib/validation";
import { isBodyOverLimit, MAX_BODY_BYTES_DEFAULT } from "@/lib/requestSafety";
import { getRequestIdFromRequest, generateRequestId } from "@/lib/requestId";

export type SecureAuthMode = "required" | "optional" | "admin";
export type SecureRateLimitMode = "auth" | "api" | "ai" | "registration" | "sensitive" | "admin";
export type SecureBodyMode = "json" | "formData" | "text" | "none" | "auto";

export type SecureRouteContext<TInput, TAuthCtx = undefined> = {
  request: Request;
  requestId: string;
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  input: TInput;
  authCtx: TAuthCtx;
};

export type SecureRouteOptions<TInput, TAuthCtx = undefined> = {
  auth: SecureAuthMode;
  rateLimit?: SecureRateLimitMode;
  csrf?: boolean;

  bodyMode?: SecureBodyMode;

  /**
   * Optional authorize hook for token-based or special-access routes.
   * Return `false` to deny.
   */
  authorize?: (ctx: {
    request: Request;
    requestId: string;
    user: Awaited<ReturnType<typeof getCurrentUser>>;
    input: TInput;
  }) => Promise<TAuthCtx | false | null | undefined>;

  schema?: ZodType<TInput>;
  skipRateLimit?: boolean | ((request: Request, user: Awaited<ReturnType<typeof getCurrentUser>> | null) => boolean);
  /**
   * Optional message for the client on invalid input.
   * Keep short to avoid info leaks.
   */
  invalidInputMessage?: string;
  /**
   * Optional max body size override.
   * Defaults to 512KB.
   */
  maxBodyBytes?: number;
  /**
   * Route-specific logger prefix.
   */
  logContext: string;
  handler: (ctx: SecureRouteContext<TInput, TAuthCtx>) => Promise<NextResponse>;
};

function withRequestId(resp: NextResponse, requestId: string): NextResponse {
  resp.headers.set("x-request-id", requestId);
  return resp;
}

async function parseBody(
  request: Request,
  bodyMode: SecureBodyMode
): Promise<{ ok: true; value: unknown } | { ok: false; status: number; message: string }> {
  if (bodyMode === "none") return { ok: true, value: undefined };
  if (bodyMode === "auto") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return parseBody(request, "json");
    }
    return parseBody(request, "formData");
  }
  if (bodyMode === "json") {
    try {
      return { ok: true, value: await request.json() };
    } catch {
      return { ok: false, status: 400, message: "Ongeldige invoer." };
    }
  }
  if (bodyMode === "text") {
    try {
      const t = await request.text();
      return { ok: true, value: t };
    } catch {
      return { ok: false, status: 400, message: "Ongeldige invoer." };
    }
  }
  // formData
  try {
    const form = await request.formData();
    const obj: Record<string, unknown> = {};
    for (const [k, v] of form.entries()) obj[k] = v;
    return { ok: true, value: obj };
  } catch {
    return { ok: false, status: 400, message: "Ongeldige invoer." };
  }
}

export function createSecureRoute<TInput, TAuthCtx = undefined>(options: SecureRouteOptions<TInput, TAuthCtx>) {
  return async function secureHandler(request: Request): Promise<NextResponse> {
    const requestId = getRequestIdFromRequest(request) ?? generateRequestId();
    const logBaseMeta = { requestId, route: options.logContext };

    let user: Awaited<ReturnType<typeof getCurrentUser>> = null;

    try {
      // Auth / RBAC
      if (options.auth === "required" || options.auth === "admin") {
        user = await getCurrentUser();
        if (!user) return withRequestId(safeJsonError("Niet geauthenticeerd.", 401, { requestId }), requestId);
        if (options.auth === "admin" && user.role !== "admin" && user.role !== "owner") {
          return withRequestId(safeJsonError("Geen toegang.", 403, { requestId }), requestId);
        }
      } else if (options.auth === "optional") {
        user = await getCurrentUser();
      }

      // CSRF protection
      if (options.csrf) {
        const ok = validateCsrf(request);
        if (!ok) {
          logger.security("csrf_rejected", logBaseMeta);
          return withRequestId(safeJsonError("Ongeldige aanvraag.", 403, { requestId }), requestId);
        }
      }

      // Rate limiting
      if (options.rateLimit) {
        const userId = user?.id ?? null;
        const shouldSkip =
          typeof options.skipRateLimit === "function"
            ? options.skipRateLimit(request, user)
            : options.skipRateLimit === true;

        if (!shouldSkip) {
          const keyBase = getRateLimitKey(request, userId);
          const key = `${options.rateLimit}:${keyBase}`;

          let ok: boolean;
          switch (options.rateLimit) {
            case "auth": {
              ok = rateLimitAuth(key).ok;
              break;
            }
            case "ai": {
              ok = rateLimitAi(key).ok;
              break;
            }
            case "registration": {
              ok = rateLimitRegistration(key).ok;
              break;
            }
            case "admin": {
              ok = rateLimitAdmin(key).ok;
              break;
            }
            case "sensitive": {
              ok = rateLimitSensitive(key).ok;
              break;
            }
            case "api":
            default: {
              ok = rateLimit(key).ok;
              break;
            }
          }

          if (!ok) {
            logger.security("rate_limit_rejected", { ...logBaseMeta, clientIp: getClientKey(request) });
            return withRequestId(safeJsonError("Te veel aanvragen. Probeer het later opnieuw.", 429, { requestId }), requestId);
          }
        }
      }

      // Body parsing
      const defaultBodyMode: SecureBodyMode = request.method === "GET" || request.method === "HEAD" ? "none" : "json";
      const bodyMode: SecureBodyMode = options.bodyMode ?? defaultBodyMode;
      const inputBodyNeeded = options.schema !== undefined || bodyMode !== "none";

      if (inputBodyNeeded) {
        if (isBodyOverLimit(request, options.maxBodyBytes ?? MAX_BODY_BYTES_DEFAULT, true)) {
          return withRequestId(safeJsonError("Verzoek te groot.", 413, { requestId }), requestId);
        }

        const parsed = await parseBody(request, bodyMode);
        if (!parsed.ok) {
          return withRequestId(safeJsonError(parsed.message, parsed.status, { requestId }), requestId);
        }

        let input: TInput;
        if (options.schema) {
          try {
            input = parseOrThrow(options.schema, parsed.value);
          } catch (err) {
            if (err instanceof ZodError) {
              logger.warn("input_validation_failed", { ...logBaseMeta, issues: err.issues.length });
              return withRequestId(
                safeJsonError(options.invalidInputMessage ?? "Ongeldige invoer.", 400, { requestId }),
                requestId
              );
            }
            throw err;
          }
        } else {
          input = parsed.value as TInput;
        }

        const authCtx = options.authorize
          ? await options.authorize({ request, requestId, user, input })
          : (undefined as unknown as TAuthCtx);

        if (authCtx === false) {
          return withRequestId(safeJsonError("Geen toegang.", 403, { requestId }), requestId);
        }

        const resp = await options.handler({
          request,
          requestId,
          user,
          input,
          authCtx: authCtx as TAuthCtx,
        });
        return withRequestId(resp, requestId);
      }

      // No body
      const resp = await options.handler({
        request,
        requestId,
        user,
        input: undefined as unknown as TInput,
        authCtx: (undefined as unknown) as TAuthCtx,
      });
      return withRequestId(resp, requestId);
    } catch (error) {
      logger.logError(`SecureRoute/${options.logContext}`, error, logBaseMeta);
      return withRequestId(handleApiError(error, options.logContext), requestId);
    }
  };
}
