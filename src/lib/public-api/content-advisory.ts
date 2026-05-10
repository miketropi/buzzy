import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { akismetCommentCheck, isAkismetGloballyDisabled } from "@/lib/public-api/akismet-check";
import {
  computeLocalHeuristicSignals,
  fetchOpenAiModerationCategoryScores,
} from "@/lib/public-api/advisory-moderation";
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

export type BuildAdvisoryArgs = {
  request: NextRequest;
  settings: EffectiveProjectSettings;
  projectId: string;
  firstAllowedDomain: string | undefined;
  pageUrl: string;
  bodyText: string;
  authorName: string;
  authorEmail: string | null;
  kind: "comment" | "review";
};

export type BuildAdvisoryOutcome = {
  advisory: Prisma.InputJsonValue | undefined;
  rejectForAkismet: boolean;
};

export async function buildContentAdvisoryPayload(
  args: BuildAdvisoryArgs,
): Promise<BuildAdvisoryOutcome> {
  const heuristic = computeLocalHeuristicSignals(args.bodyText);
  const base: Record<string, unknown> = {
    v: 1,
    at: new Date().toISOString(),
    heuristic: { score: heuristic.score, flags: heuristic.flags },
  };

  const blog = resolveBlogUrl(args.settings, args.firstAllowedDomain);
  const permalink = permalinkForEmbed(blog, args.pageUrl);
  const ip = clientIp(args.request);
  const ua = args.request.headers.get("user-agent") ?? "";
  const ref = args.request.headers.get("referer") ?? "";

  let rejectForAkismet = false;

  const akKey = args.settings.akismetApiKey?.trim();
  const akOn = args.settings.akismetEnabled && akKey && !isAkismetGloballyDisabled();
  if (akOn) {
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
    base.akismet = { spam: r.spam, invalid: r.invalid, pro_tip_discard: r.proTipDiscard };
    if (r.spam && args.settings.akismetRejectSpam) {
      rejectForAkismet = true;
    }
  }

  const openAiOn = args.settings.openaiModerationEnabled && !!process.env.OPENAI_API_KEY;
  if (openAiOn) {
    const m = await fetchOpenAiModerationCategoryScores(args.bodyText);
    if (m) {
      base.openai_moderation = { flagged: m.flagged, categories: m.categories };
    }
  }

  return {
    advisory: base as unknown as Prisma.InputJsonValue,
    rejectForAkismet,
  };
}
