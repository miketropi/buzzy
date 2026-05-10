import { BzAttachmentsDisplay } from "./bz-attachments-display";
import type { EmbedAttachment } from "./attachment-types";
import { WidgetStaticStars } from "./bz-stars";
import { initialsFromName } from "./initials";
import { trustedCommenterAvatarUrl } from "./trusted-commenter-avatar-url";

type Variant = "comfortable" | "compact";

function avatarClass(variant: Variant) {
  return variant === "comfortable" ? "bz-av--lg" : "bz-av--sm";
}

function bodyClass(variant: Variant) {
  return variant === "comfortable" ? "bz-body--comfort" : "bz-body--compact";
}

function nameClass(variant: Variant) {
  return variant === "comfortable" ? "bz-name--lg" : "bz-name--sm";
}

function metaClass(variant: Variant) {
  return variant === "comfortable" ? "bz-inline-meta" : "bz-inline-meta--sm";
}

/** Dashboard sample + live embed reviews — identical layout. */
export function WidgetReviewCard({
  variant,
  initials: initialsProp,
  avatarUrl,
  name,
  body,
  htmlBody,
  attachments,
  staffReplyHtml,
  staffReplyPlain,
  staffRepliedAt,
  starRating,
  scale = 5,
  meta,
  surface = "raised",
  onReport,
}: {
  variant: Variant;
  initials?: string;
  /** HTTPS URL from API `commenter.avatar`; initials when absent. */
  avatarUrl?: string | null;
  name?: string;
  body?: string;
  /** Sanitized HTML from API `html_content`. */
  htmlBody?: string | null;
  attachments?: EmbedAttachment[];
  /** Sanitized HTML from API `staff_reply_html`. */
  staffReplyHtml?: string | null;
  /** Plain fallback when no staff HTML. */
  staffReplyPlain?: string | null;
  staffRepliedAt?: string | null;
  starRating: number;
  scale?: number;
  /** e.g. "Verified · 2h ago" in preview; optional in embed */
  meta?: string;
  /** `flat`: compact list rows · `raised`: elevated card surface. */
  surface?: "raised" | "flat";
  onReport?: () => void;
}) {
  const resolvedName = name ?? "Alex M.";
  const initials = initialsProp ?? initialsFromName(resolvedName);
  const photo = trustedCommenterAvatarUrl(avatarUrl);
  const resolvedMeta = meta ?? "Verified · 2h ago";
  const atts = attachments ?? [];
  const hideSynthetic =
    (body?.trim() === "(attachments)" || body?.trim() === "(image)" || body?.trim() === "(video)") &&
    atts.length > 0;
  const bodyBlock =
    hideSynthetic ? null : htmlBody && htmlBody.trim() ? (
      <div
        className={`bz-body bz-prose ${bodyClass(variant)}`}
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />
    ) : body ? (
      <p className={`bz-body ${bodyClass(variant)}`}>{body}</p>
    ) : null;

  const staffLabel =
    staffRepliedAt && staffRepliedAt.includes("T")
      ? `Official reply · ${new Date(staffRepliedAt).toLocaleDateString()}`
      : "Official reply";

  const staffBlock =
    staffReplyHtml?.trim() ? (
      <div className="bz-staff-reply">
        <p className="bz-staff-reply-label">{staffLabel}</p>
        <div
          className={`bz-body bz-prose ${bodyClass(variant)}`}
          dangerouslySetInnerHTML={{ __html: staffReplyHtml }}
        />
      </div>
    ) : staffReplyPlain?.trim() ? (
      <div className="bz-staff-reply">
        <p className="bz-staff-reply-label">{staffLabel}</p>
        <p className={`bz-body ${bodyClass(variant)}`}>{staffReplyPlain}</p>
      </div>
    ) : null;

  const surfaceClass = surface === "flat" ? " bz-card--surface-flat" : "";

  return (
    <div className={`bz-card${surfaceClass}`}>
      <div className="bz-row">
        <div className={`bz-av ${avatarClass(variant)}${photo ? " bz-av--photo" : ""}`}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- external avatar from trusted API
            <img className="bz-av-img" src={photo} alt="" width={44} height={44} loading="lazy" />
          ) : (
            initials
          )}
        </div>
        <div className="bz-stack">
          <div className="bz-inline-row">
            <span className={`bz-name ${nameClass(variant)}`}>{resolvedName}</span>
            <WidgetStaticStars filled={starRating} scale={scale} />
            <span className={metaClass(variant)}>{resolvedMeta}</span>
          </div>
          {bodyBlock}
          {atts.length > 0 ? (
            <BzAttachmentsDisplay items={atts} compact={variant === "compact"} />
          ) : null}
          {staffBlock}
          {onReport ? (
            <div className="bz-actions-row">
              <button type="button" className="bz-link" onClick={onReport}>
                Report
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Live embed + dashboard — vertical list of review rows. */
export type ReviewFeedItem = {
  id?: string;
  rating?: number;
  content?: string;
  html_content?: string | null;
  attachments?: EmbedAttachment[];
  created_at?: string;
  commenter?: { name?: string; avatar?: string | null };
  staff_reply_content?: string | null;
  staff_reply_html?: string | null;
  staff_replied_at?: string | null;
};

function reviewFeedRowProps(r: ReviewFeedItem) {
  const rname = r.commenter?.name ? String(r.commenter.name) : "Anonymous";
  const avatarUrl = r.commenter?.avatar ?? null;
  const rt = Number(r.rating) || 0;
  const meta = String(r.created_at || "").slice(0, 10);
  const html =
    r.html_content != null && String(r.html_content).trim() ? String(r.html_content) : undefined;
  const textBody = r.content != null && String(r.content).trim() ? String(r.content) : undefined;
  const atts = (r.attachments ?? []) as EmbedAttachment[];
  const staffHtml =
    r.staff_reply_html != null && String(r.staff_reply_html).trim()
      ? String(r.staff_reply_html)
      : undefined;
  const staffPlain =
    r.staff_reply_content != null && String(r.staff_reply_content).trim()
      ? String(r.staff_reply_content)
      : undefined;
  return {
    rname,
    avatarUrl,
    rt,
    meta,
    body: html ? undefined : textBody,
    htmlBody: html,
    attachments: atts,
    staffReplyHtml: staffHtml,
    staffReplyPlain: staffPlain,
    staffRepliedAt: r.staff_replied_at,
  };
}

export function WidgetReviewFeed({
  reviews,
  scale,
  onReportReview,
}: {
  reviews: ReviewFeedItem[];
  scale: number;
  onReportReview?: (reviewId: string) => void;
}) {
  if (!reviews.length) return null;

  return (
    <div className="bz-list bz-stack">
      <div className="bz-entry-list-group">
        {reviews.map((r, i) => {
          const {
            rname,
            avatarUrl,
            rt,
            meta,
            body,
            htmlBody,
            attachments,
            staffReplyHtml,
            staffReplyPlain,
            staffRepliedAt,
          } = reviewFeedRowProps(r);
          return (
            <WidgetReviewCard
              key={r.id ?? i}
              variant="comfortable"
              initials={initialsFromName(rname)}
              avatarUrl={avatarUrl}
              name={rname}
              body={body}
              htmlBody={htmlBody}
              attachments={attachments}
              staffReplyHtml={staffReplyHtml}
              staffReplyPlain={staffReplyPlain}
              staffRepliedAt={staffRepliedAt}
              starRating={rt}
              scale={scale}
              meta={meta}
              surface="flat"
              onReport={r.id && onReportReview ? () => onReportReview(String(r.id)) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
