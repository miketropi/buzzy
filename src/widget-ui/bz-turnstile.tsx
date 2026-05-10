"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;
  turnstileScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(s);
  });
  return turnstileScriptPromise;
}

/**
 * Renders a Cloudflare Turnstile widget and reports tokens via `onToken`.
 * Change `resetKey` after a successful post to obtain a fresh challenge.
 */
export function BzTurnstile({
  siteKey,
  onToken,
  resetKey,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
  resetKey: number | string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el || !siteKey) return;

    void (async () => {
      try {
        await loadTurnstileScript();
        if (cancelled || !containerRef.current) return;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* ignore */
          }
          widgetIdRef.current = null;
        }
        onToken(null);
        if (!window.turnstile) return;
        const id = window.turnstile.render(el, {
          sitekey: siteKey,
          callback: (t) => onToken(t),
          "error-callback": () => onToken(null),
          "expired-callback": () => onToken(null),
        });
        widgetIdRef.current = id;
      } catch {
        onToken(null);
      }
    })();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = null;
      onToken(null);
    };
  }, [siteKey, onToken, resetKey]);

  if (!siteKey) return null;

  return (
    <div className="bz-turnstile-wrap">
      <div ref={containerRef} />
    </div>
  );
}
