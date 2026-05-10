/** Cheap local signals only — advisory, never authoritative on its own. */
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

export async function fetchOpenAiModerationCategoryScores(
  text: string,
): Promise<{ flagged: boolean; categories: Record<string, number> } | null> {
  const key = process.env.OPENAI_API_KEY;
  const trimmed = text.trim();
  if (!key || !trimmed) return null;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: trimmed.slice(0, 8000),
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      results?: Array<{ category_scores?: Record<string, number>; flagged?: boolean }>;
    };
    const r = j.results?.[0];
    if (!r?.category_scores) return null;
    return { flagged: r.flagged === true, categories: r.category_scores };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
