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
    blockedWords: [] as string[],
    blockedIPs: [] as string[],
    locale: "en",
  };
}
