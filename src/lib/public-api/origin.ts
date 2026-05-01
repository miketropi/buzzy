import { InvalidOriginError } from "@/lib/utils/errors";

function isLocalHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

function hostMatchesAllowed(host: string, pattern: string): boolean {
  const p = pattern.trim().toLowerCase();
  const h = host.toLowerCase();
  if (!p) return false;
  if (p.startsWith("*.")) {
    const suffix = p.slice(2);
    if (h === suffix) return false;
    return h.endsWith(`.${suffix}`);
  }
  return h === p;
}

/**
 * Validates the browser Origin (or Referer fallback) against project allowedDomains.
 * Test keys allow missing Origin (e.g. curl) and localhost hosts.
 */
export function assertOriginAllowed(options: {
  originHeader: string | null;
  refererHeader: string | null;
  allowedDomainPatterns: string[];
  apiKeyEnvironment: string;
}): string | null {
  const { originHeader, refererHeader, allowedDomainPatterns, apiKeyEnvironment } = options;

  const tryParseHost = (urlLike: string | null): string | null => {
    if (!urlLike) return null;
    try {
      return new URL(urlLike).hostname;
    } catch {
      return null;
    }
  };

  if (apiKeyEnvironment === "test") {
    if (!originHeader && !refererHeader) {
      return null;
    }
    if (originHeader) {
      const h = tryParseHost(originHeader);
      if (h && isLocalHost(h)) return originHeader;
    }
  }

  const origin =
    originHeader ??
    ((): string | null => {
      if (!refererHeader) return null;
      try {
        return new URL(refererHeader).origin;
      } catch {
        return null;
      }
    })();
  const host = tryParseHost(origin) ?? (refererHeader ? tryParseHost(refererHeader) : null);

  if (!host) {
    if (apiKeyEnvironment === "test") return null;
    throw new InvalidOriginError();
  }

  if (apiKeyEnvironment === "test" && isLocalHost(host)) {
    return origin ?? refererHeader ?? null;
  }

  if (allowedDomainPatterns.some((pat) => hostMatchesAllowed(host, pat))) {
    return origin ?? `https://${host}`;
  }

  throw new InvalidOriginError();
}
