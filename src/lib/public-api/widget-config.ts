import type { Project } from "@prisma/client";

import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";
import { isR2UploadConfigured } from "@/lib/public-api/r2-upload";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";

/** Public widget config (no secrets). Snake_case for SDK-facing JSON. */
export function buildPublicWidgetConfig(project: Project, settings: EffectiveProjectSettings) {
  return {
    theme: settings.theme,
    primary_color: settings.primaryColor,
    color_preset: settings.colorPreset,
    entry_layout: settings.entryLayout,
    border_radius: settings.borderRadius,
    font_family: settings.useHostTypography ? null : settings.fontFamily,
    use_host_typography: settings.useHostTypography,
    submit_button_style: settings.submitButtonStyle,
    composer_text_scale: settings.composerTextScale,
    ...(typeof settings.submitButtonFgColor === "string" && settings.submitButtonFgColor
      ? { submit_button_fg_color: settings.submitButtonFgColor }
      : {}),
    ...(typeof settings.mutedTextColor === "string" && settings.mutedTextColor
      ? { muted_text_color: settings.mutedTextColor }
      : {}),
    widget_mode: normalizeWidgetMode(project.widgetMode),
    locale: settings.locale,
    rating_scale: settings.ratingScale,
    enable_rating: settings.enableRating,
    require_rating_text: settings.requireRatingText,
    uploads_configured: isR2UploadConfigured(),
    features: {
      allow_anonymous: settings.allowAnonymous,
      allow_guest_email: settings.allowGuestEmail,
      allow_attachments: settings.enableAttachments,
      require_approval: settings.requireApproval,
      enable_voting: settings.enableVoting,
      enable_replies: settings.enableReplies,
      enable_rich_editor: settings.enableRichEditor,
      max_depth: settings.maxDepth,
    },
  };
}
