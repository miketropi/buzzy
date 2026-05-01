import type { EmbedAttachment } from "./attachment-types";
import { createContext, useContext } from "react";

/** Minimal payload to open the embed edit composer (avoids circular imports with comment cards). */
export type CommentForEdit = {
  id: string;
  content: string;
  html_content?: string | null;
  attachments?: EmbedAttachment[];
};

export type CommentThreadContextValue = {
  enableReplies: boolean;
  enableVoting: boolean;
  onReply: (commentId: string) => void;
  onQuote: (commentId: string, authorName: string, excerpt: string) => void;
  onVote: (commentId: string, value: 1 | -1 | 0) => void;
  voteBusyId: string | null;
  /** When set, thread entries may show Edit for comments where `can_edit` is true. */
  onEdit?: (c: CommentForEdit) => void;
};

export const CommentThreadContext = createContext<CommentThreadContextValue | null>(null);

export function useCommentThread(): CommentThreadContextValue | null {
  return useContext(CommentThreadContext);
}
