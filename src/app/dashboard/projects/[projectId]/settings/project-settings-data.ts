import { COLOR_PRESETS, type ColorPresetId } from "@/lib/appearance-presets";
import { normalizeHexRgb } from "@/lib/contrast-color";
import { domainsFromJson } from "@/lib/json-domains";
import { prisma } from "@/lib/prisma";
import { defaultProjectSettings } from "@/lib/project-defaults";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";

function storedHex(raw: Record<string, unknown>, key: string): string | null {
  const v = raw[key];
  if (typeof v !== "string") return null;
  return normalizeHexRgb(v.trim());
}

function stringLinesFromRaw(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  if (!Array.isArray(v)) return "";
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

function inferPresetFromPrimary(hex: string): ColorPresetId {
  const norm = hex.trim().toLowerCase();
  for (const p of COLOR_PRESETS) {
    if (p.id !== "custom" && p.primary.toLowerCase() === norm) return p.id;
  }
  return "custom";
}

export type ProjectSettingsAppearanceProps = {
  theme: string;
  primary: string;
  colorPreset: ColorPresetId;
  borderRadius: string;
  fontFamily: string;
  useHostTypography: boolean;
  submitButtonStyle: string;
  submitButtonFgColor: string | null;
  mutedTextColor: string | null;
};

export type ProjectSettingsPageData = {
  projectId: string;
  normalizedWidgetMode: string;
  initialName: string;
  initialDomainsText: string;
  initialAutoApprove: boolean;
  initialEnableAttachments: boolean;
  initialAllowAnonymous: boolean;
  initialEnableSpamFilter: boolean;
  initialBlockedWordsText: string;
  initialBlockedIPsText: string;
  initialSpamMatchWholeWords: boolean;
  initialSpamMaxUrlsPerPost: number;
  initialSpamBlockedRegexText: string;
  initialSpamDuplicateWindowSeconds: number;
  initialSpamPerIdentityCommentLimit: number;
  initialSpamPerIdentityReviewLimit: number;
  initialSpamPerIdentityWindowSeconds: number;
  initialAkismetEnabled: boolean;
  /** True when an API key exists in settings (value is never loaded for the form). */
  initialAkismetHasKey: boolean;
  initialAkismetBlogUrl: string;
  initialAkismetRejectSpam: boolean;
  initialCaptchaProvider: string;
  initialCaptchaSiteKey: string;
  initialCaptchaHasSecretKey: boolean;
  initialCaptchaMode: string;
  initialCaptchaRiskMinLinks: number;
  initialCaptchaRiskMinScore: number;
  initialOpenaiModerationEnabled: boolean;
  appearance: ProjectSettingsAppearanceProps;
};

export async function loadProjectSettingsPageDataForOwner(args: {
  projectId: string;
  ownerUserId: string;
}): Promise<ProjectSettingsPageData | null> {
  const project = await prisma.project.findFirst({
    where: { id: args.projectId, ownerId: args.ownerUserId },
    select: {
      id: true,
      name: true,
      widgetMode: true,
      allowedDomains: true,
      settings: true,
    },
  });

  if (!project) return null;

  const domainsText = domainsFromJson(project.allowedDomains).join("\n");
  const defs = defaultProjectSettings();
  const raw =
    project.settings && typeof project.settings === "object"
      ? (project.settings as unknown as Record<string, unknown>)
      : {};

  const str = (k: string, fallback: string) => {
    const v = raw[k];
    return typeof v === "string" ? v : fallback;
  };

  const bool = (k: string, fallback: boolean) => {
    const v = raw[k];
    return typeof v === "boolean" ? v : fallback;
  };

  const num = (k: string, fallback: number) => {
    const v = raw[k];
    return typeof v === "number" && Number.isFinite(v) ? v : fallback;
  };

  const primary = str("primaryColor", defs.primaryColor);
  const rawPreset = typeof raw.colorPreset === "string" && raw.colorPreset ? raw.colorPreset : "";
  const initialColorPreset = COLOR_PRESETS.some((p) => p.id === rawPreset)
    ? (rawPreset as ColorPresetId)
    : inferPresetFromPrimary(primary);

  const initialRequireApproval = bool("requireApproval", defs.requireApproval);
  const initialAutoApprove = !initialRequireApproval;
  const initialEnableAttachments = bool("enableAttachments", defs.enableAttachments);
  const initialAllowAnonymous = bool("allowAnonymous", defs.allowAnonymous);

  const submitStyles = ["filled", "outline", "soft"] as const;
  const rawSubmit = str("submitButtonStyle", defs.submitButtonStyle);
  const initialSubmitButtonStyle = submitStyles.includes(rawSubmit as (typeof submitStyles)[number])
    ? rawSubmit
    : defs.submitButtonStyle;

  const initialSubmitButtonFgColor = storedHex(raw, "submitButtonFgColor") ?? null;
  const initialMutedTextColor = storedHex(raw, "mutedTextColor") ?? null;

  const initialEnableSpamFilter = bool("enableSpamFilter", defs.enableSpamFilter);
  const initialBlockedWordsText = stringLinesFromRaw(raw, "blockedWords");
  const initialBlockedIPsText = stringLinesFromRaw(raw, "blockedIPs");
  const initialSpamMatchWholeWords = bool("spamMatchWholeWords", defs.spamMatchWholeWords);
  const initialSpamMaxUrlsPerPost = Math.floor(
    Math.min(500, Math.max(0, num("spamMaxUrlsPerPost", defs.spamMaxUrlsPerPost))),
  );
  const initialSpamBlockedRegexText = stringLinesFromRaw(raw, "spamBlockedRegex");
  const initialSpamDuplicateWindowSeconds = Math.floor(
    Math.min(604800, Math.max(0, num("spamDuplicateWindowSeconds", defs.spamDuplicateWindowSeconds))),
  );
  const initialSpamPerIdentityCommentLimit = Math.floor(
    Math.min(500, Math.max(0, num("spamPerIdentityCommentLimit", defs.spamPerIdentityCommentLimit))),
  );
  const initialSpamPerIdentityReviewLimit = Math.floor(
    Math.min(500, Math.max(0, num("spamPerIdentityReviewLimit", defs.spamPerIdentityReviewLimit))),
  );
  const initialSpamPerIdentityWindowSeconds = Math.floor(
    Math.min(604800, Math.max(60, num("spamPerIdentityWindowSeconds", defs.spamPerIdentityWindowSeconds))),
  );

  const initialAkismetEnabled = bool("akismetEnabled", defs.akismetEnabled);
  const akKeyRaw = raw.akismetApiKey;
  const initialAkismetHasKey = typeof akKeyRaw === "string" && akKeyRaw.trim().length > 0;
  const initialAkismetBlogUrl = str("akismetBlogUrl", "");
  const initialAkismetRejectSpam = bool("akismetRejectSpam", defs.akismetRejectSpam);

  const captchaProviders = ["off", "turnstile"] as const;
  const rawCaptchaProv = str("captchaProvider", defs.captchaProvider);
  const initialCaptchaProvider = captchaProviders.includes(rawCaptchaProv as (typeof captchaProviders)[number])
    ? rawCaptchaProv
    : defs.captchaProvider;

  const initialCaptchaSiteKey = str("captchaSiteKey", "");
  const csk = raw.captchaSecretKey;
  const initialCaptchaHasSecretKey = typeof csk === "string" && csk.trim().length > 0;

  const captchaModes = ["off", "anonymous_only", "risk", "always"] as const;
  const rawCaptchaMode = str("captchaMode", defs.captchaMode);
  const initialCaptchaMode = captchaModes.includes(rawCaptchaMode as (typeof captchaModes)[number])
    ? rawCaptchaMode
    : defs.captchaMode;

  const initialCaptchaRiskMinLinks = Math.floor(
    Math.min(100, Math.max(1, num("captchaRiskMinLinks", defs.captchaRiskMinLinks))),
  );
  const initialCaptchaRiskMinScore = Math.min(
    1,
    Math.max(0.01, num("captchaRiskMinScore", defs.captchaRiskMinScore)),
  );
  const initialOpenaiModerationEnabled = bool("openaiModerationEnabled", defs.openaiModerationEnabled);

  return {
    projectId: project.id,
    normalizedWidgetMode: normalizeWidgetMode(project.widgetMode),
    initialName: project.name,
    initialDomainsText: domainsText,
    initialAutoApprove,
    initialEnableAttachments,
    initialAllowAnonymous,
    initialEnableSpamFilter,
    initialBlockedWordsText,
    initialBlockedIPsText,
    initialSpamMatchWholeWords,
    initialSpamMaxUrlsPerPost,
    initialSpamBlockedRegexText,
    initialSpamDuplicateWindowSeconds,
    initialSpamPerIdentityCommentLimit,
    initialSpamPerIdentityReviewLimit,
    initialSpamPerIdentityWindowSeconds,
    initialAkismetEnabled,
    initialAkismetHasKey,
    initialAkismetBlogUrl,
    initialAkismetRejectSpam,
    initialCaptchaProvider,
    initialCaptchaSiteKey,
    initialCaptchaHasSecretKey,
    initialCaptchaMode,
    initialCaptchaRiskMinLinks,
    initialCaptchaRiskMinScore,
    initialOpenaiModerationEnabled,
    appearance: {
      theme: str("theme", defs.theme),
      primary,
      colorPreset: initialColorPreset,
      borderRadius: str("borderRadius", defs.borderRadius),
      fontFamily: str("fontFamily", defs.fontFamily),
      useHostTypography: bool("useHostTypography", defs.useHostTypography),
      submitButtonStyle: initialSubmitButtonStyle,
      submitButtonFgColor: initialSubmitButtonFgColor,
      mutedTextColor: initialMutedTextColor,
    },
  };
}
