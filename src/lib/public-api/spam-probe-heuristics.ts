/** cheap text signals for captcha “risk” mode (not stored, not authoritative). */
export function computeLocalHeuristicSignals(text: string): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;
  if (text.length > 8000) {
    flags.push("very_long");
    score += 0.15;
  }
  const caps = (text.match(/[A-Z]/g) ?? []).length;
  const letters = (text.match(/[A-Za-z]/g) ?? []).length;
  if (letters > 40 && caps / letters > 0.55) {
    flags.push("high_caps_ratio");
    score += 0.2;
  }
  if (/(.)\1{12,}/.test(text)) {
    flags.push("repeated_chars");
    score += 0.15;
  }
  if (/\b(viagra|cialis|casino|crypto|nft|seo service)\b/i.test(text)) {
    flags.push("spammy_tokens");
    score += 0.25;
  }
  return { score: Math.min(1, score), flags };
}
