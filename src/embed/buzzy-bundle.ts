/**
 * Buzzy embed — bundled to public/buzzy.js (see scripts/build-embed.mjs).
 * ESM + dynamic imports: comment vs review/rating chunks load after config is known.
 */

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { WIDGET_CHROME_STRUCTURAL_SHADOW } from "../lib/generated/widget-chrome-shadow";
import { buildShadowWidgetStylesheet, widgetConfigToTokenInput } from "../lib/widget-chrome-tokens";
import { normalizeApiBase as normalizeApiBaseFromFetch, fetchJson } from "./embed-fetch";
import { replaceEmbedProfile, setEmbedProfile, type EmbedUserProfile } from "./embed-profile";
import { setHostIdentityToken } from "./embed-host-identity";

const VERSION = "0.1.0";

function scriptOrigin(): string {
  try {
    if (typeof import.meta !== "undefined" && import.meta.url && !import.meta.url.startsWith("blob:")) {
      return new URL(import.meta.url).origin;
    }
  } catch {
    /* ignore */
  }
  const doc = typeof document !== "undefined" ? document : undefined;
  const cs = doc?.currentScript && "src" in doc.currentScript ? (doc.currentScript as HTMLScriptElement).src : "";
  if (!cs) return "";
  try {
    return new URL(cs).origin;
  } catch {
    return "";
  }
}

const normalizeApiBase = normalizeApiBaseFromFetch;

function prefersDark(): boolean {
  return typeof globalThis.matchMedia === "function" && globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyShell(shadow: ShadowRoot, cfg: Record<string, unknown>) {
  const tokens = widgetConfigToTokenInput(
    {
      theme: cfg.theme as string | undefined,
      primary_color: cfg.primary_color as string | undefined,
      border_radius: cfg.border_radius as string | undefined,
      font_family: (cfg.font_family as string | null | undefined) ?? null,
      use_host_typography: cfg.use_host_typography as boolean | undefined,
      submit_button_style: cfg.submit_button_style as string | undefined,
      composer_text_scale: cfg.composer_text_scale as string | undefined,
      submit_button_fg_color: cfg.submit_button_fg_color as string | null | undefined,
      muted_text_color: cfg.muted_text_color as string | null | undefined,
    },
    prefersDark(),
  );
  const style = document.createElement("style");
  style.textContent = buildShadowWidgetStylesheet(".bz", tokens, WIDGET_CHROME_STRUCTURAL_SHADOW);
  const root = document.createElement("div");
  root.className = `bz bz-btn-style--${tokens.submitButtonStyle} bz-text-scale--${tokens.composerTextScale}`;
  shadow.appendChild(style);
  shadow.appendChild(root);
  return root;
}

type BuzzyCtx = {
  key: string;
  apiBase: string;
  pageUrl: string;
  pageTitle: string;
};

type BuzzyBootCtx = BuzzyCtx & {
  modeOverride?: string | null;
  userProfile?: EmbedUserProfile;
  /** HMAC-signed host identity token (see dashboard API keys → Host SSO). Sent as `X-Buzzy-Host-Identity`. */
  hostIdentity?: string | null;
};

function readUserProfileFromElement(el: Element): EmbedUserProfile {
  const name = el.getAttribute("data-user-name");
  const email = el.getAttribute("data-user-email");
  const avatarRaw = el.getAttribute("data-user-avatar");
  const out: EmbedUserProfile = {};
  if (name != null) {
    const t = name.trim();
    if (t) out.name = t;
  }
  if (email != null) {
    const t = email.trim();
    if (t) out.email = t;
  }
  if (avatarRaw != null) {
    const t = avatarRaw.trim();
    if (t && /^https:\/\//i.test(t)) out.avatarUrl = t;
  }
  return out;
}

/** Host data-* attributes plus optional init/scan override (`override` wins per field). */
function mergeBootProfile(hostAttrs: EmbedUserProfile, override?: EmbedUserProfile): EmbedUserProfile | null {
  const merged: EmbedUserProfile = { ...hostAttrs };
  if (override) {
    if (override.name !== undefined) {
      const t = override.name.trim();
      if (t) merged.name = t;
      else delete merged.name;
    }
    if (override.email !== undefined) {
      const t = override.email.trim();
      if (t) merged.email = t;
      else delete merged.email;
    }
    if (override.avatarUrl !== undefined) {
      const t = override.avatarUrl.trim();
      if (t && /^https:\/\//i.test(t)) merged.avatarUrl = t;
      else delete merged.avatarUrl;
    }
  }
  return merged.name || merged.email || merged.avatarUrl ? merged : null;
}

function applyBootHostIdentity(hostIdentity?: string | null) {
  if (hostIdentity?.trim()) {
    setHostIdentityToken(hostIdentity.trim());
  } else {
    setHostIdentityToken(null);
  }
}

function applyBootProfile(host: HTMLElement, userProfile?: EmbedUserProfile) {
  const hostAttrs = readUserProfileFromElement(host);
  const merged = mergeBootProfile(hostAttrs, userProfile);
  replaceEmbedProfile(merged);
}

function mountReact(panel: HTMLElement, node: ReturnType<typeof createElement>) {
  createRoot(panel).render(node);
}

async function mountComments(panel: HTMLElement, ctx: BuzzyCtx, cfg: Record<string, unknown>) {
  const { EmbedCommentsApp } = await import("../widget-ui/embed-comments-app");
  mountReact(panel, createElement(EmbedCommentsApp, { ctx, cfg }));
}

async function mountReviews(
  panel: HTMLElement,
  ctx: BuzzyCtx,
  cfg: Record<string, unknown>,
  ratingOnly: boolean,
) {
  const { EmbedReviewsApp } = await import("../widget-ui/embed-reviews-app");
  mountReact(panel, createElement(EmbedReviewsApp, { ctx, cfg, ratingOnly }));
}

function boot(host: HTMLElement, ctx: BuzzyBootCtx) {
  if (host.dataset.buzzyMounted === "1") return;
  host.dataset.buzzyMounted = "1";
  applyBootProfile(host, ctx.userProfile);
  applyBootHostIdentity(ctx.hostIdentity);
  const shadow = host.attachShadow({ mode: "open" });
  const loading = document.createElement("div");
  loading.className = "bz";
  loading.style.padding = "1rem";
  loading.textContent = "Loading…";
  shadow.appendChild(loading);

  let apiBase = normalizeApiBase(ctx.apiBase || "");
  if (!apiBase) apiBase = scriptOrigin() || globalThis.location.origin;

  const cfgUrl = apiBase + "/api/v1/config?key=" + encodeURIComponent(ctx.key);
  fetchJson(cfgUrl)
    .then(async (j) => {
      const cfg = (j.data || {}) as Record<string, unknown>;
      shadow.removeChild(loading);
      const panel = applyShell(shadow, cfg);
      let mode = ctx.modeOverride || (cfg.widget_mode as string) || "comment";
      if (mode !== "comment" && mode !== "review" && mode !== "rating") mode = "comment";
      const nextCtx: BuzzyCtx = { ...ctx, apiBase };
      if (mode === "comment") await mountComments(panel, nextCtx, cfg);
      else await mountReviews(panel, nextCtx, cfg, mode === "rating");
    })
    .catch((e: Error) => {
      shadow.innerHTML = "";
      const d = document.createElement("div");
      d.style.cssText = "padding:1rem;font-family:system-ui,sans-serif;";
      d.textContent = "Buzzy: " + (e.message || String(e));
      shadow.appendChild(d);
    });
}

function scan(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLElement>("[data-buzzy-host]");
  for (let i = 0; i < nodes.length; i++) {
    const host = nodes[i];
    if (host.dataset.buzzyMounted === "1") continue;
    const key = host.getAttribute("data-key");
    if (!key) {
      console.warn("Buzzy.scan: data-key is required on [data-buzzy-host]", host);
      continue;
    }
    const pageUrl = host.getAttribute("data-page-url")?.trim();
    if (!pageUrl) {
      console.warn(
        "Buzzy.scan: data-page-url is required on [data-buzzy-host] — set it to this screen's logical id (https URL, path, slug, or internal id).",
        host,
      );
      continue;
    }
    boot(host, {
      key,
      apiBase: normalizeApiBase(host.getAttribute("data-api-base") || ""),
      pageUrl,
      pageTitle: host.getAttribute("data-page-title")?.trim() || document.title,
      modeOverride: host.getAttribute("data-mode"),
      hostIdentity: host.getAttribute("data-host-identity")?.trim() || null,
    });
  }
}

function init(opts: {
  key: string;
  target: string | HTMLElement;
  /** Required: stable id for this screen (full URL, path, slug, or id — reuse whenever this page loads). */
  pageUrl: string;
  mode?: string | null;
  apiBase?: string;
  api_base?: string;
  pageTitle?: string;
  /** Optional: prefill guest name/email from your logged-in user (merged with data-user-* on `target` if present). Not verified server-side. */
  profile?: EmbedUserProfile;
  /** Alias for `profile`. */
  user?: EmbedUserProfile;
  /** Optional: HMAC-signed assertion from your server (`X-Buzzy-Host-Identity`). Requires Host SSO secret in the dashboard. */
  hostIdentity?: string | null;
  /** Alias for `hostIdentity`. */
  ssoAssertion?: string | null;
}) {
  const o = opts || {};
  if (!o.key) throw new Error("Buzzy.init: key is required");
  if (!o.target) throw new Error("Buzzy.init: target is required");
  const pageUrl = typeof o.pageUrl === "string" ? o.pageUrl.trim() : "";
  if (!pageUrl) {
    throw new Error(
      "Buzzy.init: pageUrl is required. Use the logical id for this screen (e.g. https://shop.com/p/1, /products/handle, a CMS slug, or an internal id your app uses consistently).",
    );
  }
  const el =
    typeof o.target === "string" ? document.querySelector(o.target) : o.target;
  if (!el || !(el instanceof HTMLElement)) throw new Error("Buzzy.init: target element not found");
  const idTok = o.hostIdentity ?? o.ssoAssertion ?? null;
  boot(el, {
    key: o.key,
    apiBase: normalizeApiBase(o.apiBase || o.api_base || ""),
    pageUrl,
    pageTitle: o.pageTitle != null ? o.pageTitle : document.title,
    modeOverride: o.mode ?? null,
    userProfile: o.profile ?? o.user,
    hostIdentity: idTok,
  });
}

function autoInit() {
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (!s.src || !/buzzy\.js(\?|#|$)/i.test(s.src)) continue;
    const key = s.getAttribute("data-key");
    const target = s.getAttribute("data-target");
    const pageUrl = s.getAttribute("data-page-url")?.trim();
    if (!key || !target) continue;
    if (!pageUrl) {
      console.warn(
        "Buzzy: skipping script — data-page-url is required (logical page id for this embed: https URL, path, slug, or id). Add data-page-url to your Buzzy script tag.",
      );
      continue;
    }
    try {
      const el = document.querySelector(target);
      if (el instanceof HTMLElement) {
        const scriptProfile = readUserProfileFromElement(s);
        boot(el, {
          key,
          apiBase: normalizeApiBase(s.getAttribute("data-api-base") || ""),
          pageUrl,
          pageTitle: s.getAttribute("data-page-title")?.trim() || document.title,
          modeOverride: s.getAttribute("data-mode"),
          userProfile: scriptProfile.name || scriptProfile.email ? scriptProfile : undefined,
          hostIdentity: s.getAttribute("data-host-identity")?.trim() || null,
        });
      }
    } catch (e) {
      console.warn("Buzzy auto-init:", e);
    }
  }
}

type BuzzyGlobal = {
  version: string;
  /** Mount one host (`target` = selector or element). Safe to call after Ajax injects the node. */
  init: typeof init;
  /**
   * Mount every `[data-buzzy-host]` descendant of `root` that is not already mounted.
   * Call this after loading HTML via AJAX / `fetch` / a router — ES modules only run auto-init once.
   */
  scan: typeof scan;
  /**
   * Update guest name/email for open embeds (login, logout, profile edit). Merges partial fields.
   * Pass `null` to clear. Same trust model as the composer — not server-verified unless you add a signed flow later.
   */
  setProfile: typeof setProfile;
  /**
   * Set or clear the HMAC-signed host identity token (see dashboard → API keys → Host SSO).
   * Updates `X-Buzzy-Host-Identity` on subsequent API calls from the embed.
   */
  setHostIdentity: typeof setHostIdentity;
};

function setProfile(next: EmbedUserProfile | null) {
  setEmbedProfile(next);
}

function setHostIdentity(next: string | null) {
  setHostIdentityToken(next);
}

const w = globalThis as typeof globalThis & { Buzzy?: BuzzyGlobal; BuzzyReady?: (() => void) | undefined };
w.Buzzy = {
  version: VERSION,
  init,
  scan,
  setProfile,
  setHostIdentity,
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  if (typeof w.BuzzyReady === "function") {
    try {
      w.BuzzyReady();
    } catch (e) {
      console.error(e);
    }
  }
}
