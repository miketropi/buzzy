import type { NextRequest } from "next/server";

import { akismetCommentCheck, isAkismetGloballyDisabled } from "@/lib/public-api/akismet-check";
import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";
import { clientIp } from "@/lib/public-api/rate-limit-request";

function resolveBlogUrl(
  settings: EffectiveProjectSettings,
  firstAllowedHost: string | undefined,
): string {
  const raw = settings.akismetBlogUrl?.trim();
  if (raw && /^https?:\/\//i.test(raw)) return raw;
  if (firstAllowedHost) {
    const host = firstAllowedHost.replace(/^\*\./, "");
    return `https://${host}`;
  }
  return "https://localhost";
}

function permalinkForEmbed(blog: string, pageUrl: string): string {
  if (/^https?:\/\//i.test(pageUrl)) return pageUrl;
  const base = blog.replace(/\/$/, "");
  const path = pageUrl.startsWith("/") ? pageUrl : `/${pageUrl}`;
  return `${base}${path}`;
}

export type AkismetPostGateArgs = {
  request: NextRequest;
  settings: EffectiveProjectSettings;
  firstAllowedDomain: string | undefined;
  pageUrl: string;
  bodyText: string;
  authorName: string;
  authorEmail: string | null;
  kind: "comment" | "review";
};

/** Returns true when Akismet marks spam and the project is configured to reject. */
export async function shouldRejectPostForAkismet(args: AkismetPostGateArgs): Promise<boolean> {
  const akKey = args.settings.akismetApiKey?.trim();
  const akOn = args.settings.akismetEnabled && akKey && !isAkismetGloballyDisabled();
  if (!akOn) {
    return false;
  }

  const blog = resolveBlogUrl(args.settings, args.firstAllowedDomain);
  const permalink = permalinkForEmbed(blog, args.pageUrl);
  const ip = clientIp(args.request);
  const ua = args.request.headers.get("user-agent") ?? "";
  const ref = args.request.headers.get("referer") ?? "";

  const r = await akismetCommentCheck({
    apiKey: akKey,
    blog,
    userIp: ip,
    userAgent: ua,
    referrer: ref,
    permalink,
    commentContent: args.bodyText,
    commentAuthor: args.authorName,
    commentAuthorEmail: args.authorEmail,
    commentType: args.kind === "review" ? "review" : "comment",
  });

  return r.spam && args.settings.akismetRejectSpam;
}
