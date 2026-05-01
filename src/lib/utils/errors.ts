export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "INVALID_ORIGIN"
  | "INVALID_API_KEY";

export class AppError extends Error {
  readonly statusCode: number;
  readonly exposeToClient: boolean;

  constructor(
    message: string,
    options: { statusCode?: number; cause?: unknown; exposeToClient?: boolean } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.statusCode = options.statusCode ?? 500;
    this.exposeToClient = options.exposeToClient ?? this.statusCode < 500;
  }
}

export class ValidationError extends AppError {
  readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message, { statusCode: 400, exposeToClient: true });
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, { statusCode: 401, exposeToClient: true });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, { statusCode: 403, exposeToClient: true });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, { statusCode: 404, exposeToClient: true });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, { statusCode: 409, exposeToClient: true });
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  readonly resetAt: number;

  constructor(resetAt: number, message = "Rate limit exceeded") {
    super(message, { statusCode: 429, exposeToClient: true });
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
}

export class InvalidApiKeyError extends AppError {
  constructor(message = "Invalid API key") {
    super(message, { statusCode: 401, exposeToClient: true });
    this.name = "InvalidApiKeyError";
  }
}

export class InvalidOriginError extends AppError {
  constructor(message = "Origin not allowed for this project") {
    super(message, { statusCode: 403, exposeToClient: true });
    this.name = "InvalidOriginError";
  }
}

function safeMessage(err: unknown): string {
  if (err instanceof AppError && err.exposeToClient) return err.message;
  if (process.env.NODE_ENV !== "production" && err instanceof Error) return err.message;
  return "Something went wrong";
}

export function toApiErrorPayload(err: unknown): {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
} {
  if (err instanceof ValidationError) {
    return {
      code: "VALIDATION_ERROR",
      message: err.message,
      details: err.details,
    };
  }
  if (err instanceof UnauthorizedError) {
    return { code: "UNAUTHORIZED", message: err.message };
  }
  if (err instanceof ForbiddenError) {
    return { code: "FORBIDDEN", message: err.message };
  }
  if (err instanceof NotFoundError) {
    return { code: "NOT_FOUND", message: err.message };
  }
  if (err instanceof ConflictError) {
    return { code: "CONFLICT", message: err.message };
  }
  if (err instanceof RateLimitError) {
    return { code: "RATE_LIMITED", message: err.message };
  }
  if (err instanceof InvalidApiKeyError) {
    return { code: "INVALID_API_KEY", message: err.message };
  }
  if (err instanceof InvalidOriginError) {
    return { code: "INVALID_ORIGIN", message: err.message };
  }
  if (err instanceof AppError) {
    return {
      code: err.statusCode === 403 ? "FORBIDDEN" : "INTERNAL_ERROR",
      message: safeMessage(err),
    };
  }
  return {
    code: "INTERNAL_ERROR",
    message: safeMessage(err),
  };
}
