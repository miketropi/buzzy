import type { CommentWithPublicCommenter } from "@/lib/public-api/comment-types";
import { COMMENT_EDIT_WINDOW_MS } from "@/lib/public-api/comment-edit-policy";
import { attachmentsFromDb, type PublicAttachment } from "@/lib/public-api/attachments";

export type PublicCommentNode = {
  id: string;
  parent_id: string | null;
  content: string;
  /** Sanitized HTML when rich composer was used. */
  html_content: string | null;
  attachments: PublicAttachment[];
  status: string;
  upvotes: number;
  downvotes: number;
  /** Current commenter's vote: 1 up, -1 down, 0 none (requires token on GET). */
  your_vote: number;
  /** True when request included a commenter token matching this comment's author. */
  you_own: boolean;
  /** Whether the viewer may PATCH this comment now (token + time window + not deleted). */
  can_edit: boolean;
  /** ISO timestamp when the comment was last edited, if ever. */
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  commenter: { name: string; avatar: string | null };
  replies: PublicCommentNode[];
};

function shape(
  row: CommentWithPublicCommenter,
  replies: PublicCommentNode[],
  viewerCommenterId: string | null,
): PublicCommentNode {
  const you_own = viewerCommenterId !== null && row.commenterId === viewerCommenterId;
  const can_edit =
    you_own &&
    row.status !== "deleted" &&
    Date.now() - row.createdAt.getTime() <= COMMENT_EDIT_WINDOW_MS;
  return {
    id: row.id,
    parent_id: row.parentId,
    content: row.content,
    html_content: row.htmlContent ?? null,
    attachments: attachmentsFromDb(row.attachments),
    status: row.status,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    your_vote: 0,
    you_own,
    can_edit,
    edited_at: row.editedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    commenter: { name: row.commenter.name, avatar: row.commenter.avatar },
    replies,
  };
}

export function singlePublicComment(
  row: CommentWithPublicCommenter,
  viewerCommenterId: string | null = null,
): PublicCommentNode {
  return shape(row, [], viewerCommenterId);
}

export function nestPublicComments(
  roots: CommentWithPublicCommenter[],
  flat: CommentWithPublicCommenter[],
  viewerCommenterId: string | null = null,
): PublicCommentNode[] {
  const map = new Map<string, PublicCommentNode>();
  for (const r of roots) {
    map.set(r.id, shape(r, [], viewerCommenterId));
  }
  for (const c of flat) {
    map.set(c.id, shape(c, [], viewerCommenterId));
  }
  for (const c of flat) {
    if (!c.parentId) continue;
    const child = map.get(c.id);
    const parent = map.get(c.parentId);
    if (child && parent) {
      parent.replies.push(child);
    }
  }
  return roots.map((r) => map.get(r.id)!).filter(Boolean);
}

export function collectCommentIdsFromTree(nodes: PublicCommentNode[]): string[] {
  const ids: string[] = [];
  function walk(n: PublicCommentNode) {
    ids.push(n.id);
    for (const r of n.replies) walk(r);
  }
  for (const n of nodes) walk(n);
  return ids;
}

export function applyYourVotesToTree(nodes: PublicCommentNode[], byCommentId: Map<string, number>) {
  function walk(n: PublicCommentNode) {
    n.your_vote = byCommentId.get(n.id) ?? 0;
    for (const r of n.replies) walk(r);
  }
  for (const n of nodes) walk(n);
}
