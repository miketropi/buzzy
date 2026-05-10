import type { NextRequest } from "next/server";

import { verifyCommenterToken } from "@/lib/public-api/commenter-token";
import {
  BUZZY_HOST_IDENTITY_HEADER,
  verifyHostSsoAssertion,
} from "@/lib/public-api/host-sso-assertion";

/** True when Host SSO assertion is valid or a valid widget commenter token is present (not a first-time anonymous guest). */
export function isTrustedWidgetPoster(
  request: NextRequest,
  project: { id: string; embedSsoSecret: string | null },
): boolean {
  const rawSso = request.headers.get(BUZZY_HOST_IDENTITY_HEADER)?.trim();
  if (rawSso && project.embedSsoSecret) {
    const claims = verifyHostSsoAssertion(rawSso, project.id, project.embedSsoSecret);
    if (claims) return true;
  }
  const tok = request.headers.get("x-commenter-token");
  return verifyCommenterToken(tok, project.id) !== null;
}
