import type { NextRequest } from "next/server";

import { widgetShouldShowTurnstileUi } from "@/lib/public-api/captcha-ui";
import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";
import { clientIp } from "@/lib/public-api/rate-limit-request";
import { verifyTurnstileToken } from "@/lib/public-api/turnstile-verify";
import { ValidationError } from "@/lib/utils/errors";

export function turnstileCaptchaConfigured(settings: EffectiveProjectSettings): boolean {
  return (
    settings.captchaProvider === "turnstile" &&
    Boolean(settings.captchaSiteKey?.trim() && settings.captchaSecretKey?.trim())
  );
}

export function shouldRequireCaptcha(
  settings: EffectiveProjectSettings,
  opts: { trustedPoster: boolean; spamProbePlain: string },
): boolean {
  if (!turnstileCaptchaConfigured(settings)) return false;
  return widgetShouldShowTurnstileUi({
    hasSiteKey: true,
    mode: settings.captchaMode ?? "anonymous_only",
    trustedPoster: opts.trustedPoster,
    spamProbePlain: opts.spamProbePlain,
    riskMinLinks: settings.captchaRiskMinLinks,
    riskMinScore: settings.captchaRiskMinScore,
  });
}

export async function assertTurnstileCaptchaIfNeeded(
  settings: EffectiveProjectSettings,
  request: NextRequest,
  captchaToken: string | undefined | null,
  trustedPoster: boolean,
  spamProbePlain: string,
): Promise<void> {
  if (!shouldRequireCaptcha(settings, { trustedPoster, spamProbePlain })) return;
  const secret = settings.captchaSecretKey?.trim();
  if (!secret) return;

  if (!captchaToken?.trim()) {
    throw new ValidationError("Please complete the captcha and try again.");
  }

  const ip = clientIp(request);
  const ok = await verifyTurnstileToken(secret, captchaToken.trim(), ip);
  if (!ok) {
    throw new ValidationError("Captcha verification failed. Try again.");
  }
}
