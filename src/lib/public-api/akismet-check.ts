const AKISMET_ENDPOINT = "https://rest.akismet.com/1.1/comment-check";
const USER_AGENT = "Buzzy/0.1 | Akismet/1.0";

export function isAkismetGloballyDisabled(): boolean {
  return process.env.BUZZY_AKISMET_DISABLED === "1";
}

export type AkismetCheckResult = {
  spam: boolean;
  invalid: boolean;
  proTipDiscard: boolean;
};

/**
 * Returns spam verdict; `invalid` when the key or blog URL is wrong (fail-open for posting).
 */
export async function akismetCommentCheck(args: {
  apiKey: string;
  blog: string;
  userIp: string;
  userAgent: string;
  referrer: string;
  permalink: string;
  commentContent: string;
  commentAuthor: string;
  commentAuthorEmail?: string | null;
  commentType: "comment" | "review" | "message";
}): Promise<AkismetCheckResult> {
  const body = new URLSearchParams();
  body.set("api_key", args.apiKey);
  body.set("blog", args.blog);
  body.set("user_ip", args.userIp || "0.0.0.0");
  body.set("user_agent", args.userAgent || "Unknown");
  body.set("referrer", args.referrer || "");
  body.set("permalink", args.permalink);
  body.set("comment_type", args.commentType);
  body.set("comment_author", args.commentAuthor || "");
  body.set("comment_author_email", args.commentAuthorEmail ?? "");
  body.set("comment_content", args.commentContent.slice(0, 100_000));

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4500);
  try {
    const res = await fetch(AKISMET_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: body.toString(),
      signal: ctrl.signal,
    });
    const ver = (await res.text()).trim();
    const proTipDiscard = res.headers.get("x-akismet-pro-tip") === "discard";
    if (ver === "true") {
      return { spam: true, invalid: false, proTipDiscard };
    }
    if (ver === "false") {
      return { spam: false, invalid: false, proTipDiscard: false };
    }
    return { spam: false, invalid: true, proTipDiscard: false };
  } catch {
    return { spam: false, invalid: true, proTipDiscard: false };
  } finally {
    clearTimeout(t);
  }
}
