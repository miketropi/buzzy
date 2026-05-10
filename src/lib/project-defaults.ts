/** Defaults for embedded `ProjectSettings` (keep in sync with `prisma/schema.prisma`). */
export function defaultProjectSettings() {
  return {
    theme: "light",
    primaryColor: "#f5db8d",
    colorPreset: "brand_lime" as string,
    entryLayout: "list" as string,
    borderRadius: "8px",
    /** Primary action buttons in the widget: solid fill, outline, or soft wash. */
    submitButtonStyle: "filled" as string,
    /** Base UI scale for composer labels, inputs, and body copy in the widget. */
    composerTextScale: "md" as string,
    /** Optional #rgb / #RRGGBB for primary submit label — null picks contrast vs accent automatically. */
    submitButtonFgColor: null as string | null,
    /** Optional muted/secondary label color (#rgb / #RRGGBB); null keeps theme neutrals. */
    mutedTextColor: null as string | null,
    fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
    useHostTypography: false,
    widgetMode: "comment",
    allowAnonymous: true,
    allowGuestEmail: true,
    /** When false, comment/review posts cannot include image, video, or file attachments. */
    enableAttachments: true,
    requireApproval: false,
    enableVoting: true,
    enableReplies: true,
    enableRichEditor: true,
    maxDepth: 3,
    enableSocialLogin: false,
    socialProviders: [] as string[],
    enableRating: true,
    ratingScale: 5,
    requireRatingText: false,
    allowMultipleReviews: false,
    showRatingSummary: true,
    ratingCategories: [] as string[],
    notifyOnNew: true,
    notifyEmail: null as string | null,
    ssoEnabled: false,
    ssoSecretKey: null as string | null,
    enableSpamFilter: true,
    /** When true, blocked phrases use word boundaries (fewer false positives than raw substring). */
    spamMatchWholeWords: false,
    /** Reject posts whose text has more than this many http(s)/www links; 0 = off. */
    spamMaxUrlsPerPost: 0,
    /** Extra case-insensitive RegExp checks (one pattern per entry; invalid patterns are skipped). */
    spamBlockedRegex: [] as string[],
    /** If > 0, block the same normalized body on the same page within this many seconds. */
    spamDuplicateWindowSeconds: 0,
    /** Per commenter + project rate limit (Redis), in addition to per-IP caps; 0 = off. */
    spamPerIdentityCommentLimit: 0,
    spamPerIdentityReviewLimit: 0,
    /** Sliding window (seconds) used with the per-identity limits above. */
    spamPerIdentityWindowSeconds: 3600,
    blockedWords: [] as string[],
    blockedIPs: [] as string[],
    /** Akismet comment-check (API key stored server-side only). */
    akismetEnabled: false,
    akismetApiKey: null as string | null,
    akismetBlogUrl: null as string | null,
    akismetRejectSpam: false,
    captchaProvider: "off" as string,
    captchaSiteKey: null as string | null,
    captchaSecretKey: null as string | null,
    captchaMode: "anonymous_only" as string,
    captchaRiskMinLinks: 4,
    captchaRiskMinScore: 0.55,
    locale: "en",
  };
}
