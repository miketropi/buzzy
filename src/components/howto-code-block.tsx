"use client";

import { Highlight, themes } from "prism-react-renderer";
import { ClipboardCheck, Copy } from "lucide-react";
import { useState } from "react";

/** Night owl reads well on both light and dark dashboard shells. */
const highlightTheme = themes.nightOwl;

function CopyCodeButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
    >
      {copied ? (
        <>
          <ClipboardCheck className="h-4 w-4 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 opacity-80" />
          {label}
        </>
      )}
    </button>
  );
}

export function HowtoCodeBlock({
  code,
  language,
  languageLabel,
  copyLabel,
  copyText,
}: {
  code: string;
  /** Prism language id, e.g. `html`, `javascript`. */
  language: string;
  /** Short label shown in the toolbar (e.g. `HTML`). */
  languageLabel: string;
  copyLabel: string;
  copyText: string;
}) {
  const trimmed = code.replace(/\n$/, "");

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 dark:border-zinc-700">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#011627] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-cyan-200/90">
            {languageLabel}
          </span>
          <span className="text-xs font-medium text-zinc-500">Example</span>
        </div>
        <CopyCodeButton label={copyLabel} text={copyText} />
      </div>
      <div className="bg-[#011627]">
        <Highlight theme={highlightTheme} code={trimmed} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} m-0 overflow-x-auto p-4 text-[13px] leading-relaxed`}
              style={{
                ...style,
                margin: 0,
                background: "transparent",
                fontSize: "13px",
              }}
            >
              {tokens.map((line, lineIndex) => (
                <div key={lineIndex} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
