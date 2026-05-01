import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type Payload = { cid: string; pid: string; exp: number };

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!s) {
    throw new Error("NEXTAUTH_SECRET or AUTH_SECRET must be set for commenter tokens");
  }
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createCommenterToken(commenterId: string, projectId: string): string {
  const exp = Date.now() + MAX_AGE_MS;
  const payload = Buffer.from(
    JSON.stringify({ cid: commenterId, pid: projectId, exp } satisfies Payload),
    "utf8",
  ).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyCommenterToken(
  token: string | null,
  expectedProjectId: string,
): { commenterId: string } | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payloadPart = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);
  const expected = sign(payloadPart);
  try {
    if (
      sigPart.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sigPart), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("cid" in parsed) ||
    !("pid" in parsed) ||
    !("exp" in parsed)
  ) {
    return null;
  }
  const { cid, pid, exp } = parsed as Payload;
  if (typeof cid !== "string" || typeof pid !== "string" || typeof exp !== "number") return null;
  if (pid !== expectedProjectId) return null;
  if (Date.now() > exp) return null;
  return { commenterId: cid };
}
