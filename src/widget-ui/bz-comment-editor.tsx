"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Editor } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type BzCommentEditorRef = {
  clear: () => void;
  focus: () => void;
  insertQuote: (authorName: string, excerpt: string) => void;
  getValues: () => { html: string; text: string };
};

const DECORATIVE_TOOLBAR_LABELS = ["B", "I", "U", "•", "1.", "❝", "Link"] as const;

function BzEditorToolbarDecorative() {
  return (
    <div className="bz-editor-toolbar" aria-hidden="true">
      {DECORATIVE_TOOLBAR_LABELS.map((label) => (
        <span key={label} className="bz-editor-toolbar-btn bz-editor-toolbar-btn--fake">
          {label}
        </span>
      ))}
    </div>
  );
}

function BzEditorToolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  if (disabled) {
    return null;
  }

  const b = (label: string, onClick: () => void, isActive?: boolean, title?: string) => (
    <button
      type="button"
      className={`bz-editor-toolbar-btn${isActive ? " bz-editor-toolbar-btn--active" : ""}`}
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={isActive ?? false}
    >
      {label}
    </button>
  );

  return (
    <div className="bz-editor-toolbar" role="toolbar" aria-label="Formatting">
      {b("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Bold")}
      {b("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Italic")}
      {b(
        "U",
        () => editor.chain().focus().toggleUnderline().run(),
        editor.isActive("underline"),
        "Underline",
      )}
      {b("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), "Strikethrough")}
      {b(
        "• List",
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive("bulletList"),
        "Bullet list",
      )}
      {b(
        "1. List",
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive("orderedList"),
        "Numbered list",
      )}
      {b(
        "❝",
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive("blockquote"),
        "Quote",
      )}
      {b(
        "Link",
        () => {
          const prev = (editor.getAttributes("link").href as string) || "";
          const url = typeof window !== "undefined" ? window.prompt("Link URL", prev || "https://") : null;
          if (url === null) return;
          if (url.trim() === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
        },
        editor.isActive("link"),
        "Insert or edit link",
      )}
    </div>
  );
}

/** Rich text only — uploads go through `BzAttachmentsPanel`. */
export const BzCommentEditor = forwardRef<
  BzCommentEditorRef,
  {
    disabled?: boolean;
    placeholder?: string;
    /** When the editor is read-only, show the same toolbar chrome as the live embed (e.g. appearance preview). */
    decorativeToolbar?: boolean;
    /** TipTap HTML document (e.g. restored after a multi-step composer was on another step). */
    initialHtml?: string;
  }
>(function BzCommentEditor({ disabled, placeholder, decorativeToolbar, initialHtml }, ref) {
  const edRef = useRef<Editor | null>(null);

  const initialContent =
    typeof initialHtml === "string" && initialHtml.trim().length > 0 ? initialHtml : "<p></p>";

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ heading: false }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        }),
        Placeholder.configure({
          placeholder: placeholder ?? "Write a comment…",
        }),
      ],
      editable: !disabled,
      editorProps: {
        attributes: {
          class: "bz-tiptap",
        },
      },
      content: initialContent,
    },
    [disabled, placeholder, initialContent],
  );

  useEffect(() => {
    edRef.current = editor ?? null;
  }, [editor]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      editor?.commands.clearContent(true);
    },
    focus: () => {
      editor?.commands.focus();
    },
    insertQuote: (authorName: string, excerpt: string) => {
      const t = excerpt.trim().slice(0, 500);
      editor
        ?.chain()
        .focus()
        .insertContent([
          {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: `${authorName} wrote: ${t}` }],
              },
            ],
          },
          { type: "paragraph" },
        ])
        .run();
    },
    getValues: () => ({
      html: editor?.getHTML() ?? "<p></p>",
      text: editor?.getText() ?? "",
    }),
  }));

  return (
    <div className="bz-editor-wrap bz-composer-surface">
      {disabled && decorativeToolbar ? (
        <BzEditorToolbarDecorative />
      ) : editor ? (
        <BzEditorToolbar editor={editor} disabled={!!disabled} />
      ) : null}
      <div className="bz-composer-editor-body">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});
