/** Shared TipTap submit helpers for comment + review embeds. */

export function strippedFromHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h3>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20_000);
}

export function isRichEditorSubstantivelyEmpty(html: string, rawText: string): boolean {
  if (rawText.trim().length > 0) return false;
  if (/<img[\s>]/i.test(html)) return false;
  if (/<video[\s>]/i.test(html)) return false;
  const t = html.trim();
  if (!t) return true;
  const collapsed = t.replace(/\s/g, "");
  if (
    collapsed === "<p></p>" ||
    collapsed === "<p><br></p>" ||
    /^<p><br[^>]*\/?><\/p>$/.test(collapsed)
  ) {
    return true;
  }
  return strippedFromHtml(html).length === 0;
}

export function shouldSendRichHtml(html: string): boolean {
  const t = html.trim();
  if (!t) return false;
  if (/<img[\s>]/i.test(t)) return true;
  if (/<video[\s>]/i.test(t)) return true;
  const collapsed = t.replace(/\s/g, "");
  if (
    collapsed === "<p></p>" ||
    collapsed === "<p><br></p>" ||
    /^<p><br[^>]*\/?><\/p>$/.test(collapsed)
  ) {
    return false;
  }
  return true;
}
