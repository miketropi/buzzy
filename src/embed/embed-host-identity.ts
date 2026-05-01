import { BUZZY_HOST_IDENTITY_HEADER } from "../lib/public-api/buzzy-host-identity-header";

let token: string | null = null;

export function setHostIdentityToken(next: string | null) {
  token = next?.trim() || null;
}

export function hostIdentityHeaders(): Record<string, string> {
  return token ? { [BUZZY_HOST_IDENTITY_HEADER]: token } : {};
}
