import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, RateLimitError, toApiErrorPayload, ValidationError } from "./errors";

export type SuccessMeta = {
  cursor?: string;
  hasMore?: boolean;
  total?: number;
};

export function jsonSuccess<T>(data: T, meta?: SuccessMeta, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(meta && Object.keys(meta).length ? { meta } : {}),
    },
    init,
  );
}

export function jsonError(
  err: unknown,
  init?: ResponseInit,
): NextResponse<{ success: false; error: ReturnType<typeof toApiErrorPayload> }> {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const hint = first
      ? `${first.path.length ? first.path.join(".") + ": " : ""}${first.message}`
      : "Invalid request";
    const payload = toApiErrorPayload(new ValidationError(hint, err.flatten()));
    return NextResponse.json({ success: false, error: payload }, { status: 400, ...init });
  }

  if (err instanceof RateLimitError) {
    const payload = toApiErrorPayload(err);
    return NextResponse.json(
      { success: false, error: payload },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((err.resetAt - Date.now()) / 1000)),
        },
        ...init,
      },
    );
  }

  const payload = toApiErrorPayload(err);
  const status =
    err instanceof AppError
      ? err.statusCode
      : payload.code === "INTERNAL_ERROR"
        ? 500
        : 400;

  return NextResponse.json({ success: false, error: payload }, { status, ...init });
}
