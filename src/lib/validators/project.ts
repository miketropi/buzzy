import { normalizeHexRgb } from "@/lib/contrast-color";
import { z } from "zod";

export const widgetModeSchema = z.enum(["comment", "review", "rating"]);

/** Parses optional #rgb / #rrggbb for widget appearance (null clears overrides). */
const optionalRgbHex = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v, ctx): string | null | undefined => {
    if (v === undefined || v === null) return v;
    const t = v.trim();
    if (t === "") return null;
    const norm = normalizeHexRgb(t);
    if (!norm) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use hex like #f00 or #ff0044" });
      return z.NEVER;
    }
    return norm;
  });

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  allowedDomains: z.array(z.string().min(1).max(253)).default([]),
  widgetMode: widgetModeSchema.optional(),
});

export const patchProjectBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  allowedDomains: z.array(z.string().min(1).max(253)).optional(),
  widgetMode: widgetModeSchema.optional(),
});

export const projectSettingsPatchSchema = z
  .object({
    theme: z.enum(["light", "dark", "auto"]).optional(),
    primaryColor: z.string().max(32).optional(),
    colorPreset: z.enum(["brand_lime", "ocean", "sunset", "forest", "mono", "violet", "custom"]).optional(),
    entryLayout: z.enum(["list", "card_grid", "carousel"]).optional(),
    borderRadius: z.string().max(32).optional(),
    submitButtonStyle: z.enum(["filled", "outline", "soft"]).optional(),
    composerTextScale: z.enum(["sm", "md", "lg"]).optional(),
    submitButtonFgColor: optionalRgbHex.optional(),
    mutedTextColor: optionalRgbHex.optional(),
    fontFamily: z.string().max(200).optional(),
    useHostTypography: z.boolean().optional(),
    widgetMode: widgetModeSchema.optional(),
    allowAnonymous: z.boolean().optional(),
    allowGuestEmail: z.boolean().optional(),
    enableAttachments: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    enableVoting: z.boolean().optional(),
    enableReplies: z.boolean().optional(),
    enableRichEditor: z.boolean().optional(),
    maxDepth: z.number().int().min(1).max(10).optional(),
    enableSocialLogin: z.boolean().optional(),
    socialProviders: z.array(z.string()).optional(),
    enableRating: z.boolean().optional(),
    ratingScale: z.number().int().min(1).max(10).optional(),
    requireRatingText: z.boolean().optional(),
    allowMultipleReviews: z.boolean().optional(),
    showRatingSummary: z.boolean().optional(),
    ratingCategories: z.array(z.string()).optional(),
    notifyOnNew: z.boolean().optional(),
    notifyEmail: z.string().email().optional().nullable(),
    ssoEnabled: z.boolean().optional(),
    ssoSecretKey: z.string().optional().nullable(),
    enableSpamFilter: z.boolean().optional(),
    blockedWords: z.array(z.string()).optional(),
    blockedIPs: z.array(z.string()).optional(),
    locale: z.string().min(2).max(10).optional(),
  })
  .strict();

export const putDomainsBodySchema = z.object({
  allowedDomains: z.array(z.string().min(1).max(253)),
});

export const createApiKeyBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  environment: z.enum(["live", "test"]).default("live"),
});

export const configQuerySchema = z.object({
  key: z.string().min(1),
});

export const ssoBodySchema = z.object({
  token: z.string().min(1),
});
