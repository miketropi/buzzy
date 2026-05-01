import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "../embed/embed-fetch";
import { getStoredToken, setStoredToken } from "../embed/embed-auth";
import { BUZZY_PROFILE_EVENT, getEmbedProfile } from "../embed/embed-profile";
import { CommentThreadContext, type CommentForEdit, type CommentThreadContextValue } from "./comment-thread-context";
import { WidgetCommentThread, type ThreadComment } from "./bz-comment-card";
import { BzAttachmentsPanel } from "./bz-attachments-panel";
import { BzAttachmentsDisplay } from "./bz-attachments-display";
import { BzCommentEditor, type BzCommentEditorRef } from "./bz-comment-editor";
import { BzComposerModal } from "./bz-composer-modal";
import { BzIconChevronLeft, BzIconChevronRight } from "./bz-modal-nav-icons";
import type { EmbedAttachment } from "./attachment-types";
import { normalizeEntryLayout } from "./entry-layout";
import {
  isRichEditorSubstantivelyEmpty,
  shouldSendRichHtml,
  strippedFromHtml,
} from "./rich-composer-helpers";

type Features = {
  enable_replies?: boolean;
  enable_voting?: boolean;
  enable_rich_editor?: boolean;
  allow_attachments?: boolean;
};

export function EmbedCommentsApp({
  ctx,
  cfg,
}: {
  ctx: { key: string; apiBase: string; pageUrl: string; pageTitle: string };
  cfg: Record<string, unknown>;
}) {
  const entryLayout = normalizeEntryLayout(cfg.entry_layout);
  const features = (cfg.features ?? {}) as Features;
  const enableReplies = features.enable_replies !== false;
  const enableVoting = features.enable_voting !== false;
  const enableRich = features.enable_rich_editor !== false;
  const uploadsOk = cfg.uploads_configured === true && features.allow_attachments !== false;

  const [rows, setRows] = useState<ThreadComment[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(() => getEmbedProfile().name ?? "");
  const [email, setEmail] = useState(() => getEmbedProfile().email ?? "");
  const [plainContent, setPlainContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [voteBusyId, setVoteBusyId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<EmbedAttachment[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  /** Persists TipTap HTML when step 0 unmounts; used when posting from step 2. */
  const [richDraftHtml, setRichDraftHtml] = useState("<p></p>");
  /** When set, composer is patching this comment instead of posting a new one. */
  const [editingId, setEditingId] = useState<string | null>(null);

  const editorRef = useRef<BzCommentEditorRef>(null);
  const plainRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(() => {
    setErr("");
    const u =
      ctx.apiBase +
      "/api/v1/comments?key=" +
      encodeURIComponent(ctx.key) +
      "&page_url=" +
      encodeURIComponent(ctx.pageUrl) +
      "&sort=newest";
    const tok = getStoredToken(ctx.key);
    const headers: Record<string, string> = {};
    if (tok) headers["X-Commenter-Token"] = tok;
    return fetchJson(u, { headers }).then((j) => {
      const list = ((j.data as { comments?: ThreadComment[] })?.comments || []) as ThreadComment[];
      setRows(list);
      setLoading(false);
    });
  }, [ctx.apiBase, ctx.key, ctx.pageUrl]);

  useEffect(() => {
    const sync = () => {
      const p = getEmbedProfile();
      setName(p.name ?? "");
      setEmail(p.email ?? "");
    };
    sync();
    globalThis.addEventListener(BUZZY_PROFILE_EVENT, sync as EventListener);
    return () => globalThis.removeEventListener(BUZZY_PROFILE_EVENT, sync as EventListener);
  }, []);

  useEffect(() => {
    load().catch((e: Error) => {
      setErr(e.message || String(e));
      setLoading(false);
    });
  }, [load]);

  const vote = useCallback(
    async (commentId: string, value: 1 | -1 | 0) => {
      const tok = getStoredToken(ctx.key);
      if (!tok) {
        setErr("Post a comment once so we can enable voting on this device.");
        return;
      }
      setVoteBusyId(commentId);
      setErr("");
      setSuccessMsg("");
      try {
        await fetchJson(`${ctx.apiBase}/api/v1/comments/${commentId}/vote?key=${encodeURIComponent(ctx.key)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Commenter-Token": tok,
          },
          body: { value },
        });
        await load();
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setVoteBusyId(null);
      }
    },
    [ctx.apiBase, ctx.key, load],
  );

  const onEditComment = useCallback(
    (c: CommentForEdit) => {
      if (!getStoredToken(ctx.key)) {
        setErr("Use the same browser where you posted this comment to edit it.");
        return;
      }
      setErr("");
      setSuccessMsg("");
      setParentId(null);
      setEditingId(c.id);
      setPlainContent(c.content ?? "");
      setRichDraftHtml(c.html_content?.trim() ? (c.html_content as string) : "<p></p>");
      setAttachments(c.attachments ?? []);
      setComposerStep(0);
      setComposerOpen(true);
      if (enableRich) requestAnimationFrame(() => editorRef.current?.focus());
      else requestAnimationFrame(() => plainRef.current?.focus());
    },
    [ctx.key, enableRich],
  );

  const onReply = useCallback(
    (id: string) => {
      setEditingId(null);
      setParentId(id);
      setRichDraftHtml("<p></p>");
      setComposerStep(0);
      setComposerOpen(true);
      if (enableRich) requestAnimationFrame(() => editorRef.current?.focus());
      else requestAnimationFrame(() => plainRef.current?.focus());
    },
    [enableRich],
  );

  const onQuote = useCallback(
    (_cid: string, authorName: string, excerpt: string) => {
      setEditingId(null);
      setComposerStep(0);
      setRichDraftHtml("<p></p>");
      setComposerOpen(true);
      if (enableRich) {
        requestAnimationFrame(() => {
          editorRef.current?.insertQuote(authorName, excerpt);
          editorRef.current?.focus();
        });
      } else {
        const q = excerpt.trim().slice(0, 400);
        const prefix = `> ${authorName}: ${q}\n\n`;
        setPlainContent((p) => prefix + p);
        requestAnimationFrame(() => plainRef.current?.focus());
      }
    },
    [enableRich],
  );

  const threadCtx = useMemo<CommentThreadContextValue>(
    () => ({
      enableReplies,
      enableVoting,
      onReply,
      onQuote,
      onVote: vote,
      voteBusyId,
      onEdit: onEditComment,
    }),
    [enableReplies, enableVoting, onReply, onQuote, vote, voteBusyId, onEditComment],
  );

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setComposerStep(0);
    setEditingId(null);
  }, []);

  const goCommentStep2 = useCallback(() => {
    setErr("");
    if (editingId) return;
    if (!name.trim()) {
      setErr("Please enter your name.");
      return;
    }
    if (enableRich) {
      const html = editorRef.current?.getValues().html ?? "<p></p>";
      setRichDraftHtml(html);
    }
    setComposerStep(1);
  }, [name, enableRich, editingId]);

  function submitComment() {
    setErr("");

    if (editingId) {
      const tok = getStoredToken(ctx.key);
      if (!tok) {
        setErr("Session missing. Post a comment once on this device, then try again.");
        return;
      }

      setSubmitting(true);

      const patchBody: Record<string, unknown> = {};
      const hasExistingAtt = attachments.length > 0;

      if (enableRich) {
        const fromEd = editorRef.current?.getValues();
        const rawHtml = (fromEd != null ? fromEd.html : richDraftHtml).trim();
        const rawText = (fromEd?.text ?? "").trim();
        if (isRichEditorSubstantivelyEmpty(rawHtml, rawText) && !hasExistingAtt) {
          setErr("Add a comment or keep your attachments.");
          setSubmitting(false);
          return;
        }
        if (!isRichEditorSubstantivelyEmpty(rawHtml, rawText)) {
          patchBody.content = rawText || strippedFromHtml(rawHtml);
          if (shouldSendRichHtml(rawHtml)) {
            patchBody.html = rawHtml;
          }
        } else if (hasExistingAtt) {
          patchBody.content = "(attachments)";
        }
      } else {
        if (!plainContent.trim() && !hasExistingAtt) {
          setErr("Add a comment or keep your attachments.");
          setSubmitting(false);
          return;
        }
        if (plainContent.trim()) patchBody.content = plainContent.trim();
        else if (hasExistingAtt) patchBody.content = "(attachments)";
      }

      fetchJson(
        `${ctx.apiBase}/api/v1/comments/${encodeURIComponent(editingId)}?key=${encodeURIComponent(ctx.key)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Commenter-Token": tok,
          },
          body: patchBody,
        },
      )
        .then(() => {
          setErr("");
          setSuccessMsg("Your comment was updated.");
          setPlainContent("");
          setAttachments([]);
          setParentId(null);
          setRichDraftHtml("<p></p>");
          if (enableRich) editorRef.current?.clear();
          closeComposer();
          return load();
        })
        .catch((e: Error) => {
          setErr(e.message || String(e));
        })
        .finally(() => {
          setSubmitting(false);
        });
      return;
    }

    setSubmitting(true);

    const body: Record<string, unknown> = {
      page_url: ctx.pageUrl,
      page_title: ctx.pageTitle,
      commenter: {
        name: name.trim(),
        email: email.trim(),
      },
    };

    const hasAtt = attachments.length > 0;

    if (enableRich) {
      const fromEd = editorRef.current?.getValues();
      const rawHtml = (fromEd != null ? fromEd.html : richDraftHtml).trim();
      const rawText = (fromEd?.text ?? "").trim();
      if (isRichEditorSubstantivelyEmpty(rawHtml, rawText) && !hasAtt) {
        setErr("Add a comment or at least one attachment.");
        setSubmitting(false);
        return;
      }
      if (!isRichEditorSubstantivelyEmpty(rawHtml, rawText)) {
        const plainFromHtml = strippedFromHtml(rawHtml);
        body.content = rawText || plainFromHtml;
        if (shouldSendRichHtml(rawHtml)) {
          body.html = rawHtml;
        }
      }
    } else {
      if (!plainContent.trim() && !hasAtt) {
        setErr("Add a comment or at least one attachment.");
        setSubmitting(false);
        return;
      }
      if (plainContent.trim()) body.content = plainContent.trim();
    }

    if (hasAtt) {
      body.attachments = attachments;
    }

    if (parentId) body.parent_id = parentId;

    if (!name.trim()) {
      setErr("Name is required.");
      setSubmitting(false);
      return;
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const tok = getStoredToken(ctx.key);
    if (tok) headers["X-Commenter-Token"] = tok;

    fetchJson(ctx.apiBase + "/api/v1/comments?key=" + encodeURIComponent(ctx.key), {
      method: "POST",
      headers,
      body,
    })
      .then((j) => {
        const d = j.data as { comment?: { status?: string }; commenter_token?: string };
        if (d?.commenter_token) setStoredToken(ctx.key, d.commenter_token);
        setErr("");
        setSuccessMsg(
          d.comment?.status === "pending"
            ? "Your comment was saved and is waiting for approval. It will show here after a moderator publishes it."
            : "Your comment was posted.",
        );
        setPlainContent("");
        setAttachments([]);
        setParentId(null);
        setRichDraftHtml("<p></p>");
        if (enableRich) editorRef.current?.clear();
        closeComposer();
        return load();
      })
      .catch((e: Error) => {
        setErr(e.message || String(e));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  const commentStepLabels = ["Your profile & message", "Attachments & post"];
  const isEditing = editingId !== null;

  return (
    <div className="bz-main-stack">
      <div className="bz-panel">
        <p className="bz-head">Comments</p>
        <CommentThreadContext.Provider value={threadCtx}>
          <div className="bz-thread-entries">
            {loading ? (
              <p className="bz-meta">Loading…</p>
            ) : rows.length ? (
              entryLayout === "list" ? (
                <div className="bz-list bz-stack">
                  <WidgetCommentThread items={rows} variant="comfortable" entryLayout="list" />
                </div>
              ) : (
                <WidgetCommentThread items={rows} variant="comfortable" entryLayout={entryLayout} />
              )
            ) : (
              <p className="bz-meta">No comments yet.</p>
            )}
          </div>
        </CommentThreadContext.Provider>
        {successMsg ? <p className="bz-success">{successMsg}</p> : null}
        {err && !composerOpen ? <p className="bz-msg">{err}</p> : null}
        <div className="bz-comp--cta">
          {parentId ? (
            <p className="bz-meta bz-comp-reply-hint">
              Replying in thread ·{" "}
              <button type="button" className="bz-link" onClick={() => setParentId(null)}>
                Cancel reply
              </button>
            </p>
          ) : null}
          <button
            type="button"
            className="bz-btn bz-btn--block"
            onClick={() => {
              setErr("");
              setSuccessMsg("");
              setEditingId(null);
              setComposerStep(0);
              setRichDraftHtml("<p></p>");
              setComposerOpen(true);
            }}
          >
            {parentId ? "Continue reply" : "Write a comment"}
          </button>
        </div>
        <BzComposerModal
          open={composerOpen}
          onClose={closeComposer}
          title={isEditing ? "Edit comment" : parentId ? "Reply" : "Post a comment"}
          stepIndex={isEditing ? 0 : composerStep}
          totalSteps={isEditing ? 1 : 2}
          stepLabels={isEditing ? ["Edit comment"] : commentStepLabels}
          footer={
            <div className="bz-modal-footer-inner">
              {isEditing ? (
                <>
                  <button type="button" className="bz-btn--secondary bz-btn--modal" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bz-btn bz-btn--modal bz-btn--modal-primary"
                    disabled={submitting}
                    onClick={() => submitComment()}
                  >
                    {submitting ? "Saving…" : "Save changes"}
                  </button>
                </>
              ) : composerStep === 0 ? (
                <>
                  <button type="button" className="bz-btn--secondary bz-btn--modal" onClick={closeComposer}>
                    Cancel
                  </button>
                  <button type="button" className="bz-btn bz-btn--modal bz-btn--modal-primary" onClick={goCommentStep2}>
                    Continue
                    <BzIconChevronRight className="bz-ico bz-ico--trailing" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="bz-btn--secondary bz-btn--modal"
                    onClick={() => {
                      setErr("");
                      setComposerStep(0);
                    }}
                    disabled={submitting}
                  >
                    <BzIconChevronLeft className="bz-ico bz-ico--leading" />
                    Back
                  </button>
                  <button
                    type="button"
                    className="bz-btn bz-btn--modal bz-btn--modal-primary"
                    disabled={submitting}
                    onClick={() => submitComment()}
                  >
                    {submitting ? "Posting…" : "Post comment"}
                  </button>
                </>
              )}
            </div>
          }
        >
          {err && composerOpen ? <p className="bz-msg">{err}</p> : null}
          {isEditing ? (
            <>
              <p className="bz-modal-intro">
                Update your text here. You can edit for a short time after posting, on the same browser you used to
                comment. Existing attachments stay on the comment.
              </p>
              {attachments.length > 0 ? (
                <div className="bz-form-field">
                  <span className="bz-l">Attachments</span>
                  <BzAttachmentsDisplay items={attachments} compact={false} />
                </div>
              ) : null}
              <div className="bz-form-field">
                <label className="bz-l" htmlFor={enableRich ? "buzzy-c-editor" : "buzzy-c-content"}>
                  Comment
                </label>
                {enableRich ? (
                  <div id="buzzy-c-editor">
                    <BzCommentEditor
                      ref={editorRef}
                      disabled={submitting}
                      initialHtml={richDraftHtml}
                      placeholder="Edit your comment…"
                    />
                  </div>
                ) : (
                  <textarea
                    ref={plainRef}
                    id="buzzy-c-content"
                    className="bz-in"
                    name="content"
                    rows={5}
                    value={plainContent}
                    onChange={(e) => setPlainContent(e.target.value)}
                  />
                )}
              </div>
            </>
          ) : composerStep === 0 ? (
            <>
              {parentId ? (
                <p className="bz-modal-intro">
                  You&apos;re replying in a thread — your note nests under the original comment. Add images or documents
                  in step 2, or skip straight to post if it&apos;s text only.
                </p>
              ) : (
                <p className="bz-modal-intro">
                  Step 1 is your name, optional email, and what you want to say. Step 2 is optional uploads — keep this
                  screen clean until you need files.
                </p>
              )}
              <div className="bz-form-field">
                <label className="bz-l" htmlFor="buzzy-c-name">
                  Your name
                </label>
                <input
                  id="buzzy-c-name"
                  className="bz-in"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="bz-form-field">
                <label className="bz-l" htmlFor="buzzy-c-email">
                  Email (optional)
                </label>
                <input
                  id="buzzy-c-email"
                  className="bz-in"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="bz-form-field">
                <label className="bz-l" htmlFor={enableRich ? "buzzy-c-editor" : "buzzy-c-content"}>
                  Comment
                </label>
                {enableRich ? (
                  <div id="buzzy-c-editor">
                    <BzCommentEditor
                      ref={editorRef}
                      disabled={submitting}
                      initialHtml={richDraftHtml}
                      placeholder="Write your comment… Formatting tools below — uploads are in the next step."
                    />
                  </div>
                ) : (
                  <textarea
                    ref={plainRef}
                    id="buzzy-c-content"
                    className="bz-in"
                    name="content"
                    rows={5}
                    value={plainContent}
                    onChange={(e) => setPlainContent(e.target.value)}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <p className="bz-modal-intro">
                Optional: attach images, PDFs, Word files, or a short video — or leave this step empty and post with
                just what you wrote in step 1.
              </p>
              <div className="bz-form-field">
                <label className="bz-l" htmlFor="buzzy-c-attachments">
                  Attachments
                </label>
                <div id="buzzy-c-attachments">
                  <BzAttachmentsPanel
                    items={attachments}
                    onChange={setAttachments}
                    uploadsEnabled={uploadsOk}
                    disabled={submitting}
                    apiBase={ctx.apiBase}
                    apiKey={ctx.key}
                  />
                </div>
              </div>
            </>
          )}
        </BzComposerModal>
      </div>
    </div>
  );
}
