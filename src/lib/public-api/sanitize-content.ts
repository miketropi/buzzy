import sanitizeHtml from "sanitize-html";

/** Strip all HTML; safe plain text for stored `content`. */
export function sanitizeCommentContent(raw: string): string {
  const text = sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return text.trim();
}

/** Rich comment body for `htmlContent` — TipTap / embed output. */
export function sanitizeCommentHtml(raw: string): string {
  const out = sanitizeHtml(raw, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h3",
      "code",
      "pre",
      "img",
      "video",
      "source",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      video: ["src", "class", "controls", "playsinline", "preload", "width", "height"],
      source: ["src", "type"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["https", "http"],
      video: ["https", "http"],
      source: ["https", "http"],
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          href: attribs.href || "#",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  });
  return out.trim().slice(0, 200_000);
}
