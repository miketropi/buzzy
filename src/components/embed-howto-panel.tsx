"use client";

import Link from "next/link";
import { useCallback, useId, useState, type ReactNode } from "react";
import { HowtoCodeBlock } from "@/components/howto-code-block";

type HowToTabId = "declarative" | "wordpress" | "programmatic" | "ajax-init" | "ajax-scan" | "host-profile";

const TAB_ITEMS: { id: HowToTabId; label: string }[] = [
  { id: "declarative", label: "Declarative" },
  { id: "wordpress", label: "WordPress" },
  { id: "programmatic", label: "Programmatic" },
  { id: "ajax-init", label: "Ajax · init" },
  { id: "ajax-scan", label: "Ajax · scan" },
  { id: "host-profile", label: "Logged-in users" },
];

function HowToTabList({
  active,
  onChange,
  baseId,
}: {
  active: HowToTabId;
  onChange: (id: HowToTabId) => void;
  baseId: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Integration method"
      className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-zinc-700"
    >
      {TAB_ITEMS.map((t) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            id={`${baseId}-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${baseId}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const idx = TAB_ITEMS.findIndex((x) => x.id === t.id);
              const next =
                e.key === "ArrowRight"
                  ? TAB_ITEMS[(idx + 1) % TAB_ITEMS.length]
                  : TAB_ITEMS[(idx - 1 + TAB_ITEMS.length) % TAB_ITEMS.length];
              onChange(next.id);
              window.setTimeout(() => document.getElementById(`${baseId}-tab-${next.id}`)?.focus(), 0);
            }}
            className={
              selected
                ? "-mb-px border-b-2 border-brand px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                : "border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function TabPanel({
  id,
  baseId,
  visible,
  children,
}: {
  id: HowToTabId;
  baseId: string;
  visible: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={`${baseId}-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${id}`}
      hidden={!visible}
      className={visible ? "mt-6 space-y-4" : "hidden"}
    >
      {visible ? children : null}
    </div>
  );
}

export function EmbedHowToPanel({
  projectId,
  sdkUrl,
  widgetMode,
  apiBaseUrl,
}: {
  projectId: string;
  sdkUrl: string;
  widgetMode: string;
  /** When the API lives on a different origin than the SDK, set NEXT_PUBLIC_API_URL. */
  apiBaseUrl?: string;
}) {
  const baseId = useId().replace(/:/g, "");
  const [tab, setTab] = useState<HowToTabId>("declarative");
  const showPanel = useCallback((id: HowToTabId) => tab === id, [tab]);

  const apiKeysHref = `/dashboard/projects/${projectId}/api-keys`;
  /** Example only — replace with the stable id for each screen (URL, path, slug, or internal id). */
  const pageUrlExample = "https://example.com/this-page";
  const apiAttr =
    apiBaseUrl && apiBaseUrl.length > 0
      ? `
  data-api-base="${apiBaseUrl.replace(/"/g, "&quot;")}"`
      : "";
  const declarativeSnippet = `<div id="buzzy-embed"></div>
<script
  type="module"
  src="${sdkUrl}"
  data-key="YOUR_PUBLIC_API_KEY"
  data-target="#buzzy-embed"
  data-page-url="${pageUrlExample}"
  data-mode="${widgetMode}"${apiAttr}
></script>`;

  const apiJs = apiBaseUrl && apiBaseUrl.length > 0 ? `      apiBase: "${apiBaseUrl.replace(/"/g, '\\"')}",\n` : "";
  const programmaticSnippet = `<script>
  window.BuzzyReady = function () {
    Buzzy.init({
      key: "YOUR_PUBLIC_API_KEY",
      target: "#buzzy-embed",
      pageUrl: "${pageUrlExample}",
      mode: "${widgetMode}",
      pageTitle: document.title,
${apiJs}    });
  };
</script>
<script type="module" src="${sdkUrl}"></script>`;

  const ajaxInitApi =
    apiBaseUrl && apiBaseUrl.length > 0 ? `\n  apiBase: "${apiBaseUrl.replace(/"/g, '\\"')}",` : "";
  const ajaxInitSnippet = `// Load buzzy.js once on the page (\`<script type="module" src="…">\`).
// After Ajax, a client router, or innerHTML injects the empty host:
window.Buzzy.init({
  key: "YOUR_PUBLIC_API_KEY",
  target: "#buzzy-embed",
  pageUrl: "${pageUrlExample}",
  mode: "${widgetMode}",
  pageTitle: document.title,${ajaxInitApi}
});`;

  const ajaxHostSnippet = `<div
  data-buzzy-host
  data-key="YOUR_PUBLIC_API_KEY"
  data-page-url="${pageUrlExample}"
  data-mode="${widgetMode}"${apiAttr}
></div>`;

  const ajaxScanSnippet = `// After injecting the HTML above into the DOM:
window.Buzzy.scan(parentElement); // e.g. document.getElementById("drawer")
// or search the whole document:
window.Buzzy.scan(document);`;

  const profileInitApi =
    apiBaseUrl && apiBaseUrl.length > 0 ? `\n  apiBase: "${apiBaseUrl.replace(/"/g, '\\"')}",` : "";
  const profileInitSnippet = `Buzzy.init({
  key: "YOUR_PUBLIC_API_KEY",
  target: "#buzzy-embed",
  pageUrl: "${pageUrlExample}",
  mode: "${widgetMode}",
  pageTitle: document.title,
  profile: { name: window.__userName, email: window.__userEmail },${profileInitApi}
});
// \`user\` is an alias for \`profile\`. Values are not verified by the server — same as typing in the form.`;

  const profileAttrsSnippet = `<!-- Optional on the mount node or [data-buzzy-host] (merged with init \`profile\`; init wins on conflicts): -->
<div
  id="buzzy-embed"
  data-user-name="Ada Lovelace"
  data-user-email="ada@example.com"
></div>`;

  const profileSsoSnippet = `// After your server mints the token (see steps above):
Buzzy.setHostIdentity(token);

// Or pass it when mounting (alias: ssoAssertion):
Buzzy.init({
  key: "YOUR_PUBLIC_API_KEY",
  target: "#buzzy-embed",
  pageUrl: "${pageUrlExample}",
  hostIdentity: token,
  mode: "${widgetMode}",
  pageTitle: document.title,
});`;

  /** Example JSON before base64url + HMAC — use YOUR user's values; exp must be Unix seconds. */
  const hostSsoPayloadExample = `{
  "pid": "${projectId}",
  "sub": "YOUR_STABLE_USER_ID",
  "name": "Display name",
  "iat": 1700000000,
  "exp": 1700000900,
  "email": "optional@example.com",
  "avatar": "https://example.com/avatar.png",
  "username": "optional_handle"
}`;

  const hostSsoNodeSignSnippet = `// Node.js — sign the same way your backend should:
import { createHmac } from "crypto";

const payload = {
  pid: "${projectId}",
  sub: user.id,
  name: user.displayName,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 600,
};
if (user.email) payload.email = user.email;
// avatar / username optional; avatar must be https:

const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const sig = createHmac("sha256", process.env.BUZZY_HOST_SSO_SECRET)
  .update(payloadB64)
  .digest("base64url");
const token = \`\${payloadB64}.\${sig}\`;
// Return token to the browser; never expose BUZZY_HOST_SSO_SECRET to the client.`;

  const profileSetSnippet = `// After login, logout, or profile edit (updates open widgets):
Buzzy.setProfile({ name: "Ada Lovelace", email: "ada@example.com" });
Buzzy.setProfile({ email: "" }); // clear email only (merge)
Buzzy.setProfile(null); // clear name and email`;

  return (
    <div className="space-y-8 text-slate-800 dark:text-zinc-200">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">How to embed</h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          You need the hosted <strong className="font-semibold text-slate-800 dark:text-zinc-200">buzzy.js</strong>{" "}
          script, your public API key, a required{" "}
          <strong className="font-semibold text-slate-800 dark:text-zinc-200">page id</strong> (
          <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">data-page-url</code> /{" "}
          <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">pageUrl</code>
          ) that identifies the screen (full URL, path, slug, or internal id — same value every time that page loads),
          and a <strong className="font-semibold text-slate-800 dark:text-zinc-200">CSS selector</strong> (
          <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">data-target</code>) for the mount point.
          The SDK reads <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">data-key</code> and optional{" "}
          <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">data-mode</code>.
          {apiBaseUrl ? (
            <>
              {" "}
              This environment uses a separate API origin — snippets include{" "}
              <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">data-api-base</code>.
            </>
          ) : null}
        </p>
        <p className="mt-3 text-base text-slate-600 dark:text-zinc-400">
          Create a publishable key on the{" "}
          <Link href={apiKeysHref} className="link-brand">
            API keys
          </Link>{" "}
          page, then replace{" "}
          <code className="rounded bg-slate-100 px-1 text-sm dark:bg-zinc-800">YOUR_PUBLIC_API_KEY</code> with the full
          secret shown once at creation.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
        <HowToTabList active={tab} onChange={setTab} baseId={baseId} />

        <TabPanel id="declarative" baseId={baseId} visible={showPanel("declarative")}>
          <p className="text-base text-slate-600 dark:text-zinc-400">
            Add a div (any <code className="text-sm">id</code> you like), then the script.{" "}
            <code className="text-sm">data-page-url</code> is <strong className="text-slate-800 dark:text-zinc-200">required</strong>{" "}
            and must repeat the same logical page id on every load (examples: full <code className="text-sm">https://…</code> URL,{" "}
            <code className="text-sm">/products/handle</code>, CMS slug, or internal id).{" "}
            <code className="text-sm">data-target</code> must match the container (e.g.{" "}
            <code className="text-sm">#buzzy-embed</code>).
          </p>
          <HowtoCodeBlock
            code={declarativeSnippet}
            language="markup"
            languageLabel="HTML"
            copyLabel="Copy snippet"
            copyText={declarativeSnippet}
          />
        </TabPanel>

        <TabPanel id="wordpress" baseId={baseId} visible={showPanel("wordpress")}>
          <ol className="list-decimal space-y-3 pl-5 text-base text-slate-600 dark:text-zinc-400">
            <li>
              Edit your page in Elementor and add an <strong className="text-slate-800 dark:text-zinc-200">HTML</strong>{" "}
              widget where you want comments or reviews.
            </li>
            <li>
              Paste the snippet below: empty <code className="text-sm">&lt;div&gt;</code> first, then the script. Match{" "}
              <code className="text-sm">data-target</code> to that div&apos;s <code className="text-sm">id</code> (e.g.{" "}
              <code className="text-sm">#buzzy-comments</code>). Set <code className="text-sm">data-page-url</code> to your
              page&apos;s canonical id (replace the example).
            </li>
            <li>
              Or set <strong className="text-slate-800 dark:text-zinc-200">Advanced → CSS ID</strong> on a section and
              use <code className="text-sm">data-target=&quot;#that-id&quot;</code>.
            </li>
          </ol>
          <HowtoCodeBlock
            code={declarativeSnippet}
            language="markup"
            languageLabel="HTML"
            copyLabel="Copy snippet"
            copyText={declarativeSnippet}
          />
        </TabPanel>

        <TabPanel id="programmatic" baseId={baseId} visible={showPanel("programmatic")}>
          <p className="text-base text-slate-600 dark:text-zinc-400">
            Define <code className="text-sm">BuzzyReady</code> <strong>before</strong> the module script.{" "}
            <code className="text-sm">pageUrl</code> is <strong>required</strong> in{" "}
            <code className="text-sm">Buzzy.init</code> (same rules as <code className="text-sm">data-page-url</code>).
          </p>
          <HowtoCodeBlock
            code={programmaticSnippet}
            language="markup"
            languageLabel="HTML"
            copyLabel="Copy snippet"
            copyText={programmaticSnippet}
          />
        </TabPanel>

        <TabPanel id="ajax-init" baseId={baseId} visible={showPanel("ajax-init")}>
          <p className="text-base text-slate-600 dark:text-zinc-400">
            Call <code className="text-sm">Buzzy.init</code> after the host exists.{" "}
            <code className="text-sm">pageUrl</code> is <strong>required</strong> — on SPAs route to the same string your
            backend should use for this view (not only <code className="text-sm">window.location.href</code> unless that is
            your canonical id).
          </p>
          <HowtoCodeBlock
            code={ajaxInitSnippet}
            language="javascript"
            languageLabel="JavaScript"
            copyLabel="Copy code"
            copyText={ajaxInitSnippet}
          />
        </TabPanel>

        <TabPanel id="ajax-scan" baseId={baseId} visible={showPanel("ajax-scan")}>
          <p className="text-base text-slate-600 dark:text-zinc-400">
            Each <code className="text-sm">[data-buzzy-host]</code> must include{" "}
            <strong className="text-slate-800 dark:text-zinc-200">data-page-url</strong> (required) and optional{" "}
            <code className="text-sm">data-page-title</code> when the title should differ from the host document (e.g.
            product in a modal). Optional <code className="text-sm">data-user-name</code> and{" "}
            <code className="text-sm">data-user-email</code> prefill the guest composer from your logged-in user.
          </p>
          <HowtoCodeBlock
            code={ajaxHostSnippet}
            language="markup"
            languageLabel="HTML"
            copyLabel="Copy HTML"
            copyText={ajaxHostSnippet}
          />
          <HowtoCodeBlock
            code={ajaxScanSnippet}
            language="javascript"
            languageLabel="JavaScript"
            copyLabel="Copy JS"
            copyText={ajaxScanSnippet}
          />
        </TabPanel>

        <TabPanel id="host-profile" baseId={baseId} visible={showPanel("host-profile")}>
          <div className="space-y-6 text-base text-slate-600 dark:text-zinc-400">
            <p>
              Use this when visitors are <strong className="font-medium text-slate-800 dark:text-zinc-200">authenticated on your site</strong>.
              There are two layers:{" "}
              <strong className="font-medium text-slate-800 dark:text-zinc-200">Host SSO</strong> (server-signed, trusted
              identity for the API) and{" "}
              <strong className="font-medium text-slate-800 dark:text-zinc-200">profile prefill</strong> (optional UI hints
              in the composer, not verified).
            </p>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                A. Host SSO (recommended)
              </h3>
              <p className="mt-2">
                Your <strong className="font-medium text-slate-800 dark:text-zinc-200">backend</strong> signs a short-lived
                token. The embed sends it as header{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">X-Buzzy-Host-Identity</code> on
                every widget API request. Keep the signing secret on the server only.
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>
                  Open{" "}
                  <Link href={apiKeysHref} className="link-brand">
                    API keys
                  </Link>{" "}
                  and under <strong className="text-slate-800 dark:text-zinc-200">Host SSO</strong>, click{" "}
                  <strong className="text-slate-800 dark:text-zinc-200">Generate</strong> (or Rotate). Copy the secret into
                  your app environment (e.g. <code className="text-sm">BUZZY_HOST_SSO_SECRET</code>). Regenerating invalidates
                  old tokens.
                </li>
                <li>
                  After <em>your</em> login/session check succeeds, build a JSON object. Required fields:{" "}
                  <code className="text-sm">pid</code> (this project&apos;s id — use the value below),{" "}
                  <code className="text-sm">sub</code> (stable user id on your system),{" "}
                  <code className="text-sm">name</code> (display name), <code className="text-sm">exp</code> (Unix{" "}
                  <strong>seconds</strong>, max ~15 minutes ahead). Recommended: <code className="text-sm">iat</code> (Unix
                  seconds). Optional: <code className="text-sm">email</code> (only if guest email is allowed in project
                  settings), <code className="text-sm">avatar</code> (https URL only),{" "}
                  <code className="text-sm">username</code> (stored in metadata).
                </li>
                <li>
                  <code className="text-sm">UTF-8</code> JSON → <code className="text-sm">base64url</code> (no padding) →
                  string <code className="text-sm">payloadB64</code>. Compute{" "}
                  <code className="text-sm">HMAC-SHA256(secret, payloadB64)</code>, digest as{" "}
                  <code className="text-sm">base64url</code> → <code className="text-sm">sig</code>. Token ={" "}
                  <code className="text-sm">payloadB64 + &quot;.&quot; + sig</code> (same pattern as Buzzy commenter device
                  tokens).
                </li>
                <li>
                  Return the token string to the browser (API route, SSR props, or session). Call{" "}
                  <code className="text-sm">Buzzy.setHostIdentity(token)</code> on login/session refresh, and{" "}
                  <code className="text-sm">Buzzy.setHostIdentity(null)</code> on logout.
                </li>
                <li>
                  If you call <code className="text-sm">Buzzy.init</code> after you already have a token, pass{" "}
                  <code className="text-sm">hostIdentity: token</code> (alias <code className="text-sm">ssoAssertion</code>)
                  so the first API calls include the header.
                </li>
                <li>
                  Full detail and edge cases: repo root <code className="text-sm">PROJECT.md</code> (Host SSO). Local
                  sanity check: <code className="text-sm">scripts/sign-host-sso-example.mjs</code> with{" "}
                  <code className="text-sm">BUZZY_PROJECT_ID</code> and <code className="text-sm">BUZZY_HOST_SSO_SECRET</code>
                  .
                </li>
              </ol>
            </div>

            <HowtoCodeBlock
              code={hostSsoPayloadExample}
              language="json"
              languageLabel="Payload shape"
              copyLabel="Copy JSON example"
              copyText={hostSsoPayloadExample}
            />
            <HowtoCodeBlock
              code={hostSsoNodeSignSnippet}
              language="javascript"
              languageLabel="Node (sign)"
              copyLabel="Copy Node signer"
              copyText={hostSsoNodeSignSnippet}
            />
            <HowtoCodeBlock
              code={profileSsoSnippet}
              language="javascript"
              languageLabel="Browser (embed)"
              copyLabel="Copy embed calls"
              copyText={profileSsoSnippet}
            />

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                B. Profile prefill (optional)
              </h3>
              <p className="mt-2">
                Fills name/email in the guest composer for convenience. The API does{" "}
                <strong className="text-slate-800 dark:text-zinc-200">not</strong> treat this as proof of identity unless you
                also send Host SSO. Use <code className="text-sm">data-user-*</code> on the mount node,{" "}
                <code className="text-sm">Buzzy.init({`{ profile }`})</code> / <code className="text-sm">user</code>, or{" "}
                <code className="text-sm">Buzzy.setProfile</code> when the session changes.
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>
                  Prefer setting values on the <strong className="text-slate-800 dark:text-zinc-200">same tick</strong> as{" "}
                  <code className="text-sm">init</code> or right after mount if the user is already logged in.
                </li>
                <li>
                  On SPA navigation, each embed boot reapplies attributes / init options; call{" "}
                  <code className="text-sm">setProfile</code> again if you only set fields from JavaScript.
                </li>
              </ol>
            </div>
          </div>

          <HowtoCodeBlock
            code={profileAttrsSnippet}
            language="markup"
            languageLabel="HTML"
            copyLabel="Copy data attributes"
            copyText={profileAttrsSnippet}
          />
          <HowtoCodeBlock
            code={profileInitSnippet}
            language="javascript"
            languageLabel="JavaScript"
            copyLabel="Copy init + profile"
            copyText={profileInitSnippet}
          />
          <HowtoCodeBlock
            code={profileSetSnippet}
            language="javascript"
            languageLabel="JavaScript"
            copyLabel="Copy setProfile"
            copyText={profileSetSnippet}
          />
        </TabPanel>
      </section>

      <p className="text-sm text-slate-500 dark:text-zinc-500">
        Script URL: <code className="break-all text-xs">{sdkUrl}</code> (from{" "}
        <code className="text-xs">NEXT_PUBLIC_SDK_URL</code>). In production the same app serves{" "}
        <code className="text-xs">/buzzy.js</code>, files under <code className="text-xs">/buzzy/</code> (lazy chunks),{" "}
        <code className="text-xs">/api/v1</code> unless you set a separate API URL.
      </p>
    </div>
  );
}
