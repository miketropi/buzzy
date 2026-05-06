import { useSyncExternalStore } from "react";

import { BUZZY_HOST_IDENTITY_EVENT, getHostIdentityPresent } from "../embed/embed-host-identity";

export function subscribeHostIdentityChanged(cb: () => void): () => void {
  globalThis.addEventListener(BUZZY_HOST_IDENTITY_EVENT, cb);
  return () => globalThis.removeEventListener(BUZZY_HOST_IDENTITY_EVENT, cb);
}

/** True when Host SSO (`X-Buzzy-Host-Identity`) is set — composer should hide editable name/email. */
export function useHostIdentityProvisioned(): boolean {
  return useSyncExternalStore(subscribeHostIdentityChanged, getHostIdentityPresent, () => false);
}
