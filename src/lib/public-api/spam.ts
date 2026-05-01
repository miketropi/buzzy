import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";

export function isBlockedIp(ip: string, blocked: unknown): boolean {
  if (!ip || ip === "unknown") return false;
  if (!Array.isArray(blocked)) return false;
  return blocked.some((b) => typeof b === "string" && b.trim() === ip);
}

export function matchesSpamPatterns(content: string, settings: EffectiveProjectSettings): boolean {
  if (!settings.enableSpamFilter) return false;
  const lower = content.toLowerCase();
  for (const w of settings.blockedWords) {
    if (typeof w !== "string" || !w.trim()) continue;
    if (lower.includes(w.toLowerCase().trim())) return true;
  }
  return false;
}
