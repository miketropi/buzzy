import type { ReactNode } from "react";
import { useCommentThread } from "./comment-thread-context";
import { BzReplyIcon, BzThumbDownIcon, BzThumbUpIcon } from "./bz-icons";
import type { EmbedAttachment } from "./attachment-types";
import { BzAttachmentsDisplay } from "./bz-attachments-display";
import { initialsFromName } from "./initials";
import { trustedCommenterAvatarUrl } from "./trusted-commenter-avatar-url";

type Variant = "comfortable" | "compact";

type CommentCardSurface = "raised" | "flat" | "nestedReply";

function commentArticleClass(surface: CommentCardSurface) {
  const base = "bz-card bz-thread-card";
  if (surface === "raised") return base;
  if (surface === "nestedReply") return `${base} bz-card--surface-nested-reply`;
  return `${base} bz-card--surface-flat`;
}

export type ThreadComment = {
  id: string;
  parent_id?: string | null;
  content?: string;
  html_content?: string | null;
  attachments?: EmbedAttachment[];
  upvotes?: number;
  downvotes?: number;
  your_vote?: number;
  you_own?: boolean;
  can_edit?: boolean;
  edited_at?: string | null;
  commenter?: { name?: string; avatar?: string | null };
  created_at?: string;
  updated_at?: string;
  replies?: ThreadComment[];
};

function commentBodyClass(variant: Variant) {
  return variant === "comfortable" ? "bz-body--comfort" : "bz-body--compact";
}

function commentNameClass(variant: Variant) {
  return variant === "comfortable" ? "bz-name--lg" : "bz-name--sm";
}

function commentMetaClass(variant: Variant) {
  return variant === "comfortable" ? "bz-inline-meta" : "bz-inline-meta--sm";
}

function avatarClass(variant: Variant) {
  return variant === "comfortable" ? "bz-av--lg" : "bz-av--sm";
}

/** Short relative or calendar date for thread meta (no extra deps). */
function formatCommentMeta(iso?: string | null): string {
  if (iso == null || String(iso).trim() === "") return "";
  const raw = String(iso).trim();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.length > 12 ? raw.slice(0, 12) + "…" : raw;
  const now = Date.now();
  const diffMs = Math.max(0, now - d.getTime());
  const diffM = Math.floor(diffMs / 60_000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  const y = d.getFullYear();
  const sameYear = y === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" as const }),
  });
}

type BodyProps = {
  variant: Variant;
  initials: string;
  /** HTTPS URL from API; initials used when absent. */
  avatarUrl?: string | null;
  name: string;
  body: string;
  htmlBody?: string | null;
  /** Display label (e.g. relative date). */
  meta: string;
  /** ISO-ish timestamp for `<time dateTime>` when machine-parseable. */
  metaDateTime?: string | null;
  showActions?: boolean;
  commentId?: string;
  upvotes?: number;
  downvotes?: number;
  yourVote?: number;
  attachments?: EmbedAttachment[];
  editedAt?: string | null;
  canEdit?: boolean;
};

export function WidgetCommentCardBody({
  variant,
  initials,
  avatarUrl,
  name,
  body,
  htmlBody,
  meta,
  metaDateTime,
  showActions = true,
  commentId,
  upvotes = 0,
  downvotes = 0,
  yourVote = 0,
  attachments,
  editedAt,
  canEdit = false,
}: BodyProps) {
  const avatar = trustedCommenterAvatarUrl(avatarUrl);
  const ctx = useCommentThread();
  const interactive = Boolean(commentId && ctx);
  const composeLocked = Boolean(interactive && ctx && !ctx.canCompose);

  const hideSyntheticText =
    body.trim() === "(attachments)" && attachments && attachments.length > 0;

  const bodyEl =
    hideSyntheticText ? null : htmlBody && htmlBody.trim() ? (
      <div
        className={`bz-body bz-prose ${commentBodyClass(variant)}`}
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />
    ) : (
      <p className={`bz-body ${commentBodyClass(variant)}`}>{body}</p>
    );

  let actions: ReactNode = null;
  if (interactive && commentId && ctx) {
    const c = ctx;
    const showRow = c.enableReplies || c.enableVoting || Boolean(c.onReport);
    if (showRow) {
      actions = (
        <div className="bz-actions-row">
          {c.enableReplies ? (
            <>
              <button
                type="button"
                className="bz-reply-btn"
                disabled={c.voteBusyId !== null || composeLocked}
                title={composeLocked ? "Sign in to reply." : undefined}
                onClick={() => c.onReply(commentId)}
              >
                <BzReplyIcon className="bz-icon-sm" />
                Reply
              </button>
              <button
                type="button"
                className="bz-link"
                disabled={c.voteBusyId !== null || composeLocked}
                title={composeLocked ? "Sign in to quote." : undefined}
                onClick={() => c.onQuote(commentId, name, body)}
              >
                Quote
              </button>
              {c.onEdit && canEdit ? (
                <button
                  type="button"
                  className="bz-link"
                  disabled={c.voteBusyId !== null}
                  onClick={() =>
                    c.onEdit!({
                      id: commentId,
                      content: body,
                      html_content: htmlBody ?? null,
                      attachments: attachments ?? [],
                    })
                  }
                >
                  Edit
                </button>
              ) : null}
            </>
          ) : null}
          {c.onReport ? (
            <button
              type="button"
              className="bz-link"
              disabled={c.voteBusyId !== null}
              onClick={() => c.onReport!(commentId)}
            >
              Report
            </button>
          ) : null}
          {c.enableVoting ? (
            <span className="bz-votes">
              <button
                type="button"
                className={`bz-vote-btn${yourVote === 1 ? " bz-sel" : ""}`}
                disabled={c.voteBusyId !== null}
                aria-pressed={yourVote === 1}
                aria-label={`Like${upvotes ? `, ${upvotes}` : ""}`}
                onClick={() => c.onVote(commentId, yourVote === 1 ? 0 : 1)}
              >
                <BzThumbUpIcon className="bz-icon-sm bz-vote-ico" />
                <span>{upvotes}</span>
              </button>
              <button
                type="button"
                className={`bz-vote-btn${yourVote === -1 ? " bz-sel" : ""}`}
                disabled={c.voteBusyId !== null}
                aria-pressed={yourVote === -1}
                aria-label={`Dislike${downvotes ? `, ${downvotes}` : ""}`}
                onClick={() => c.onVote(commentId, yourVote === -1 ? 0 : -1)}
              >
                <BzThumbDownIcon className="bz-icon-sm bz-vote-ico" />
                <span>{downvotes}</span>
              </button>
            </span>
          ) : null}
        </div>
      );
    }
  } else if (showActions) {
    actions = (
      <div className="bz-actions">
        <span className="bz-reply">
          <BzReplyIcon className="bz-icon-sm" />
          Reply
        </span>
        <span className="bz-helpful">· 12 helpful</span>
      </div>
    );
  }

  return (
    <div className="bz-row bz-entry-row">
      <div className={`bz-av ${avatarClass(variant)}${avatar ? " bz-av--photo" : ""}`} aria-hidden>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- external avatar from trusted API
          <img
            key={commentId ? `bz-av-${commentId}-${avatar}` : avatar}
            className="bz-av-img"
            src={avatar}
            alt=""
            width={44}
            height={44}
            loading="lazy"
          />
        ) : (
          initials
        )}
      </div>
      <div className="bz-stack bz-entry-stack">
        <header className="bz-entry-header">
          <span className={`bz-name ${commentNameClass(variant)}`}>{name}</span>
          {meta ? (
            metaDateTime && !Number.isNaN(Date.parse(metaDateTime)) ? (
              <time className={`bz-entry-meta ${commentMetaClass(variant)}`} dateTime={metaDateTime}>
                {meta}
              </time>
            ) : (
              <span className={`bz-entry-meta ${commentMetaClass(variant)}`}>{meta}</span>
            )
          ) : null}
          {editedAt ? (
            <span className={`bz-entry-edited ${commentMetaClass(variant)}`} title="This comment was edited">
              (edited)
            </span>
          ) : null}
        </header>
        {bodyEl}
        {attachments && attachments.length > 0 ? (
          <BzAttachmentsDisplay items={attachments} compact={variant === "compact"} />
        ) : null}
        {actions}
      </div>
    </div>
  );
}

/** Dashboard preview — single card (sample data). */
export function WidgetCommentCard({
  variant,
  initials: initialsProp,
  name,
  body,
  meta,
  showActions = true,
  cardSurface = "raised",
}: {
  variant: Variant;
  initials?: string;
  name?: string;
  body?: string;
  meta?: string;
  showActions?: boolean;
  /** `flat`: list-style dividers · `raised`: elevated card surface (default). */
  cardSurface?: "raised" | "flat";
}) {
  const resolvedName = name ?? "Alex M.";
  const initials = initialsProp ?? initialsFromName(resolvedName);
  return (
    <article className={commentArticleClass(cardSurface === "flat" ? "flat" : "raised")}>
      <WidgetCommentCardBody
        variant={variant}
        initials={initials}
        avatarUrl={null}
        name={resolvedName}
        body={
          body ??
          "Clear layout and fast load — feels native on our storefront. Would recommend for teams shipping their own stack."
        }
        meta={meta ?? "2h ago"}
        showActions={showActions}
      />
    </article>
  );
}

/** Live API thread — vertical list layout. */
export function WidgetCommentThread({
  items,
  variant,
}: {
  items: ThreadComment[];
  variant: Variant;
}) {
  return (
    <div className="bz-list bz-stack">
      <div className="bz-entry-list-group">
        {items.map((c, i) => (
          <CommentThreadNode key={c.id || `c-${i}`} node={c} variant={variant} cardSurface="flat" />
        ))}
      </div>
    </div>
  );
}

function CommentThreadNode({
  node,
  variant,
  cardSurface,
}: {
  node: ThreadComment;
  variant: Variant;
  cardSurface: CommentCardSurface;
}) {
  const name = node.commenter?.name ? String(node.commenter.name) : "Anonymous";
  const initials = initialsFromName(name);
  const avatarUrl = node.commenter?.avatar ?? null;
  const createdRaw = node.created_at != null ? String(node.created_at) : "";
  const meta = formatCommentMeta(createdRaw || undefined);
  const body = String(node.content || "");
  const atts = (node.attachments ?? []) as EmbedAttachment[];
  const replies = node.replies || [];
  return (
    <article className={commentArticleClass(cardSurface)}>
      <WidgetCommentCardBody
        variant={variant}
        initials={initials}
        avatarUrl={avatarUrl}
        name={name}
        body={body}
        htmlBody={node.html_content ?? null}
        attachments={atts}
        meta={meta}
        metaDateTime={createdRaw || null}
        showActions={false}
        commentId={node.id}
        upvotes={node.upvotes ?? 0}
        downvotes={node.downvotes ?? 0}
        yourVote={node.your_vote ?? 0}
        editedAt={node.edited_at ?? null}
        canEdit={node.can_edit === true}
      />
      {replies.length > 0 ? (
        <div className="bz-replies" role="group" aria-label="Replies">
          {replies.map((r, j) => (
            <CommentThreadNode key={r.id || `r-${j}`} node={r} variant="compact" cardSurface="nestedReply" />
          ))}
        </div>
      ) : null}
    </article>
  );
}
