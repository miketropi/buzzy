function tokenKey(key: string) {
  return `buzzy_commenter:${key.slice(0, 12)}`;
}

export function getStoredToken(key: string): string {
  try {
    return globalThis.localStorage.getItem(tokenKey(key)) || "";
  } catch {
    return "";
  }
}

export function setStoredToken(key: string, token: string): void {
  try {
    if (token) globalThis.localStorage.setItem(tokenKey(key), token);
  } catch {
    /* ignore */
  }
}
