import { computeLocalHeuristicSignals } from "@/lib/public-api/advisory-moderation";
import { countProbableUrls } from "@/lib/public-api/spam";

/**
 * Pure preview of when the server will require Turnstile (matches `captcha-gate` logic).
 * Used by embed UIs so we only render the widget when a token may be required.
 */
export function widgetShouldShowTurnstileUi(params: {
  hasSiteKey: boolean;
  mode: string;
  trustedPoster: boolean;
  spamProbePlain: string;
  riskMinLinks?: number;
  riskMinScore?: number;
}): boolean {
  if (!params.hasSiteKey) return false;
  const mode = params.mode || "anonymous_only";
  if (mode === "off") return false;
  const links = countProbableUrls(params.spamProbePlain);
  const h = computeLocalHeuristicSignals(params.spamProbePlain);
  const minLinks =
    typeof params.riskMinLinks === "number" && Number.isFinite(params.riskMinLinks)
      ? Math.max(1, Math.floor(params.riskMinLinks))
      : 4;
  const minScore =
    typeof params.riskMinScore === "number" && Number.isFinite(params.riskMinScore)
      ? Math.min(1, Math.max(0.01, params.riskMinScore))
      : 0.55;
  switch (mode) {
    case "always":
      return true;
    case "anonymous_only":
      return !params.trustedPoster;
    case "risk":
      if (params.trustedPoster) return false;
      return links >= minLinks || h.score >= minScore;
    default:
      return false;
  }
}
