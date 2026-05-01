import { createHash, randomBytes } from "crypto";

export type ApiKeyEnvironment = "live" | "test";

const PREFIX: Record<ApiKeyEnvironment, string> = {
  live: "pk_live_",
  test: "pk_test_",
};

export function generateApiKeyValue(environment: ApiKeyEnvironment): string {
  const secret = randomBytes(32).toString("base64url");
  return `${PREFIX[environment]}${secret}`;
}

export function hashApiKey(fullKey: string): string {
  return createHash("sha256").update(fullKey, "utf8").digest("hex");
}

export function formatApiKeyPrefix(fullKey: string): string {
  const n = 18;
  return fullKey.length <= n ? fullKey : `${fullKey.slice(0, n)}…`;
}
