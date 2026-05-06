/**
 * Host site → widget: guest fields (name / email) synced from the parent page.
 * Not cryptographically verified; same trust model as the user typing in the form.
 */

export type EmbedUserProfile = {
  name?: string;
  email?: string;
  /** From Host SSO JWT display decode or data-user-avatar — widget UI only */
  avatarUrl?: string;
};

export const BUZZY_PROFILE_EVENT = "buzzy:profile";

let profile: EmbedUserProfile = {};

export function getEmbedProfile(): EmbedUserProfile {
  return { ...profile };
}

function dispatchProfileChanged() {
  if (typeof globalThis.dispatchEvent === "function") {
    globalThis.dispatchEvent(new Event(BUZZY_PROFILE_EVENT));
  }
}

/**
 * Replaces the stored profile (used when mounting an embed with host attributes / init options).
 */
export function replaceEmbedProfile(next: EmbedUserProfile | null) {
  if (!next || (!next.name && !next.email && !next.avatarUrl)) {
    profile = {};
  } else {
    profile = { ...next };
  }
  dispatchProfileChanged();
}

/**
 * Merges partial fields from host callbacks. Pass empty strings to clear a field. Pass null to reset all.
 */
export function setEmbedProfile(next: EmbedUserProfile | null) {
  if (next === null) {
    profile = {};
  } else {
    profile = { ...profile };
    if (next.name !== undefined) {
      const t = next.name.trim();
      if (t) profile.name = t;
      else delete profile.name;
    }
    if (next.email !== undefined) {
      const t = next.email.trim();
      if (t) profile.email = t;
      else delete profile.email;
    }
    if (next.avatarUrl !== undefined) {
      const t = next.avatarUrl.trim();
      if (t) profile.avatarUrl = t;
      else delete profile.avatarUrl;
    }
  }
  dispatchProfileChanged();
}
