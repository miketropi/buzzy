"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Editor } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type StaffReplyEditorRef = {
  getValues: () => { html: string; text: string; isEmpty: boolean };
  focus: () => void;
};

/** Build TipTap HTML from stored plain + optional HTML (e.g. when opening a review reply). */
export function staffReplyInitialHtml(
  plain: string | null | undefined,
  html: string | null | undefined,
): string {
  const h = (html ?? "").trim();
  if (h) return h;
  const t = (plain ?? "").trim();
  if (!t) return "<p></p>";
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  return t
    .split(/\n\n+/)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  if (disabled) return null;

  const b = (label: string, onClick: () => void, isActive?: boolean, title?: string) => (
    <button
      type="button"
      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        isActive
          ? "bg-violet-200/80 text-violet-900 dark:bg-violet-900/60 dark:text-violet-100"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={isActive ?? false}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex flex-wrap gap-1 border-b border-slate-200/90 bg-slate-50/80 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800/40"
      role="toolbar"
      aria-label="Formatting"
    >
      {b("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Bold")}
      {b("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Italic")}
      {b(
        "U",
        () => editor.chain().focus().toggleUnderline().run(),
        editor.isActive("underline"),
        "Underline",
      )}
      {b(
        "S",
        () => editor.chain().focus().toggleStrike().run(),
        editor.isActive("strike"),
        "Strikethrough",
      )}
      {b(
        "•",
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive("bulletList"),
        "Bullet list",
      )}
      {b(
        "1.",
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive("orderedList"),
        "Numbered list",
      )}
      {b(
        "H2",
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive("heading", { level: 2 }),
        "Heading 2",
      )}
      {b(
        "H3",
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive("heading", { level: 3 }),
        "Heading 3",
      )}
      {b("`", () => editor.chain().focus().toggleCode().run(), editor.isActive("code"), "Inline code")}
      {b(
        "Pre",
        () => editor.chain().focus().toggleCodeBlock().run(),
        editor.isActive("codeBlock"),
        "Code block",
      )}
      {b(
        "—",
        () => editor.chain().focus().setHorizontalRule().run(),
        false,
        "Horizontal rule",
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

export const StaffReplyEditor = forwardRef<
  StaffReplyEditorRef,
  {
    placeholder?: string;
    disabled?: boolean;
    /** Increment when the modal opens so the document reloads from `initialHtml`. */
    contentVersion: number;
    initialHtml: string;
    onModEnter?: () => void;
    onDocumentChange?: (state: { isEmpty: boolean }) => void;
  }
>(function StaffReplyEditor(
  { placeholder, disabled, contentVersion, initialHtml, onModEnter, onDocumentChange },
  ref,
) {
  const onDocRef = useRef(onDocumentChange);
  onDocRef.current = onDocumentChange;
  const onModEnterRef = useRef(onModEnter);
  onModEnterRef.current = onModEnter;

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        }),
        Placeholder.configure({
          placeholder: placeholder ?? "Write a reply…",
        }),
      ],
      editable: !disabled,
      editorProps: {
        attributes: {
          class:
            "staff-reply-tiptap min-h-[7rem] max-h-[min(40vh,16rem)] overflow-y-auto px-3 py-2 text-sm text-slate-900 focus:outline-none dark:text-slate-100",
        },
        handleKeyDown: (_view, event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onModEnterRef.current?.();
            return true;
          }
          return false;
        },
      },
      content: "<p></p>",
      onUpdate: ({ editor: ed }) => {
        onDocRef.current?.({ isEmpty: ed.isEmpty });
      },
    },
    [],
  );

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const html = initialHtml?.trim() ? initialHtml : "<p></p>";
    editor.commands.setContent(html);
    queueMicrotask(() => {
      onDocRef.current?.({ isEmpty: editor.isEmpty });
    });
  }, [editor, contentVersion, initialHtml]);

  useImperativeHandle(ref, () => ({
    getValues: () => {
      if (!editor) {
        return { html: "<p></p>", text: "", isEmpty: true };
      }
      return {
        html: editor.getHTML(),
        text: editor.getText(),
        isEmpty: editor.isEmpty,
      };
    },
    focus: () => {
      editor?.commands.focus();
    },
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white dark:border-slate-600 dark:bg-slate-900">
      {editor ? <Toolbar editor={editor} disabled={!!disabled} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
});

StaffReplyEditor.displayName = "StaffReplyEditor";
