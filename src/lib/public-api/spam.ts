import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";

export function isBlockedIp(ip: string, blocked: unknown): boolean {
  if (!ip || ip === "unknown") return false;
  if (!Array.isArray(blocked)) return false;
  return blocked.some((b) => typeof b === "string" && b.trim() === ip);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Counts http(s):// and bare www. occurrences (cheap heuristic for Phase B URL caps). */
export function countProbableUrls(content: string): number {
  const slice = content.slice(0, 200_000);
  const re = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/gi;
  const m = slice.match(re);
  return m?.length ?? 0;
}

function blockedWordMatches(fullContent: string, word: string, wholeWord: boolean): boolean {
  const trimmed = word.trim();
  if (!trimmed) return false;
  if (!wholeWord) {
    return fullContent.toLowerCase().includes(trimmed.toLowerCase());
  }
  const wl = trimmed.toLowerCase();
  if (/\s/.test(wl)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(wl)}([^a-z0-9]|$)`, "i").test(fullContent);
  }
  return new RegExp(`\\b${escapeRegExp(wl)}\\b`, "i").test(fullContent);
}

function matchesSpamRegexList(content: string, patterns: unknown): boolean {
  if (!Array.isArray(patterns)) return false;
  const slice = content.slice(0, 100_000);
  for (const p of patterns) {
    if (typeof p !== "string") continue;
    const t = p.trim();
    if (!t) continue;
    try {
      if (new RegExp(t, "i").test(slice)) return true;
    } catch {
      /* Invalid pattern — ignore */
    }
  }
  return false;
}

function matchesSpamWords(content: string, settings: EffectiveProjectSettings): boolean {
  if (!settings.enableSpamFilter) return false;
  const wholeWord = !!settings.spamMatchWholeWords;
  for (const w of settings.blockedWords) {
    if (typeof w !== "string" || !w.trim()) continue;
    if (blockedWordMatches(content, w, wholeWord)) return true;
  }
  return false;
}

function sanitizedMaxUrls(v: EffectiveProjectSettings["spamMaxUrlsPerPost"]): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return 0;
  return Math.min(500, Math.floor(v));
}

/**
 * Consolidated Phase A/B checks: URL cap, blocked words (substring or token-style), regex list (optional).
 */
export function getSpamBlockReasonForText(content: string, settings: EffectiveProjectSettings): string | null {
  const maxUrls = sanitizedMaxUrls(settings.spamMaxUrlsPerPost);
  if (maxUrls > 0) {
    const n = countProbableUrls(content);
    if (n > maxUrls) {
      return `Too many links for this site (${n}; max ${maxUrls})`;
    }
  }

  if (matchesSpamWords(content, settings)) {
    return "This message was blocked by the spam filter";
  }

  if (matchesSpamRegexList(content, settings.spamBlockedRegex)) {
    return "This message was blocked by the spam filter";
  }

  return null;
}

export function matchesSpamPatterns(content: string, settings: EffectiveProjectSettings): boolean {
  return getSpamBlockReasonForText(content, settings) !== null;
}
