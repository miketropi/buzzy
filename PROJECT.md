# Buzzy — project documentation

> **Recovery notice:** A longer multi-section specification previously lived in this file. If you still need that full document, restore it from backup, cloud sync, or **Cursor → Local History** on `PROJECT.md`.

Buzzy is an embeddable comments, reviews, and ratings platform. Sites integrate by loading **`buzzy.js`** with a **public API key**, a required **`data-page-url`** (logical page id), and a **CSS selector** (`data-target`) pointing at an empty host element; the SDK mounts the widget there in a **Shadow DOM** (`public/buzzy.js`).

## Phase 4 — Embed SDK

The app serves **`/buzzy.js`** (static file). The loader reads **`GET /api/v1/config`**, applies tokens from the response, and mounts **comment**, **review**, or **rating** flows using existing `/api/v1/comments`, `/api/v1/reviews`, and `/api/v1/ratings/summary`. Optional **`data-api-base`** / **`apiBase`** points at the API origin when it differs from the script host (value is an origin only; trailing `/api/v1` is stripped if present).

## Phase 5 — Shared widget chrome

Dashboard **appearance preview** and the **embed** must not diverge: one structural stylesheet and one token builder drive both.

- **Source CSS:** `src/embed/widget-chrome.css` — layout and component rules only; theme uses `var(--bz-*)` on `.bz`.
- **Codegen:** `npm run gen:widget-chrome` (`scripts/sync-widget-chrome.mjs`) writes `src/lib/generated/widget-chrome-shadow.ts` and `widget-chrome-scoped.ts` (Shadow DOM vs `.buzzy-widget-scope` prefix). Runs on **`predev`** and **`build`**; also **`postinstall`** so a fresh `npm install` can compile without a manual step.
- **Tokens:** `src/lib/widget-chrome-tokens.ts` — `dashboardToTokenInput` / `widgetConfigToTokenInput`, `buildShadowWidgetStylesheet`, `buildScopedWidgetStylesheet`.
- **Embed bundle:** `src/embed/buzzy-bundle.ts` → `npm run build:embed` → `public/buzzy.js` (**ES module**, minified) plus lazy chunks in **`public/buzzy/embed-*.js`**, loaded after config for **comment** vs **review/rating** only. Include **`type="module"`** on the script tag. The entry ships **React + react-dom/client**; feature UI is loaded dynamically. Presentational modules live in **`src/widget-ui/*`**. Only **`bz-*`** classes and shared tokens/CSS apply inside the widget; Tailwind is not used in `widget-ui`.

When you change chrome markup or class names, update **`widget-chrome.css`** and **`src/widget-ui`**, run **`gen:widget-chrome`**, **`build:embed`**, and keep embed app logic in **`embed-comments-app.tsx`** / **`embed-reviews-app.tsx`** aligned with **`WidgetAppearancePreview`**.

## SDK quick start

```html
<div id="buzzy-embed"></div>
<script
  type="module"
  src="https://your-host/buzzy.js"
  data-key="YOUR_PUBLIC_API_KEY"
  data-target="#buzzy-embed"
  data-page-url="https://yoursite.com/this-page"
  data-mode="comment"
></script>
```

Deploy **`buzzy.js`** and the **`buzzy/`** folder (lazy **`embed-*.js`** chunks) from `public/`; the browser loads chunks under the same origin path as the entry script.

- **`data-key`** — publishable key from the dashboard (API keys tab).
- **`data-page-url`** — **required.** Stable id for the screen this widget represents: full `https` URL, a path (`/products/slug`), CMS slug, or internal id. Reuse the same string whenever that logical page loads so comments/reviews stay scoped correctly.
- **`data-target`** — any valid CSS selector for the container (e.g. `#buzzy-embed`, `.comments-root`).
- **`data-mode`** — optional override: `comment` | `review` | `rating` (see project defaults). Legacy `all` is treated as `review`.
- **`data-user-name`** / **`data-user-email`** — optional; prefill the guest composer from your logged-in session (merged with `Buzzy.init({ profile })` when both are used; init wins on conflicts).

### Host SSO (server-verified embed identity)

1. **Dashboard → API keys → Host SSO:** generate the **HMAC secret** (per project; shown once per generation).
2. **Your backend** (after you authenticate the user) signs a compact token:
   - JSON payload (UTF-8) then **base64url**: **`pid`** (Buzzy project UUID), **`sub`** (your user id), **`name`**, **`exp`** (Unix seconds, ≤15 min skew), optional **`iat`**, **`email`** (only if project allows guest email), **`avatar`** (HTTPS URL), **`username`** (stored in `metadata`).
   - **Signature:** `HMAC-SHA256(secret, payloadBase64url)` → **base64url**.
   - **Token:** `{payload}.{sig}`.
3. **Embed:** `Buzzy.setHostIdentity(token)` or `Buzzy.init({ hostIdentity: token })` (alias `ssoAssertion`). Sends **`X-Buzzy-Host-Identity`** on API requests.
4. **Behavior:** Upserts `Commenter` with `provider: host_sso`. Allows posting when **anonymous is disabled** if the assertion verifies. **Example:** `scripts/sign-host-sso-example.mjs`.

Regenerating the secret invalidates existing tokens.

### Host user profile (session sync)

To keep name/email aligned with a logged-in user:

1. **`Buzzy.init({ …, profile: { name, email } })`** — `user` is an alias for `profile`.
2. **Attributes** on the mount node: `data-user-name`, `data-user-email` (also supported on `[data-buzzy-host]`).
3. **`Buzzy.setProfile({ name, email })`** after login, profile edit, or merge partial updates; **`Buzzy.setProfile(null)`** clears. Empty string on a field clears that field when merging.

**Host profile** is for UX prefill only and is **not** verified. Use **Host SSO** for server-signed identity (`sub`, `name`, `avatar`, etc.).

Each embed **boot** reapplies `data-user-*` / `init` `profile` and clears the store when neither supplies a field, so SPA navigations do not leave a stale prefill. Call **`Buzzy.setProfile`** again after `init` if you set the session only in JS and not on the host node. **`Buzzy.setHostIdentity`** is also reapplied from `init` / `data-host-identity` per boot.

### Ajax, SPAs, and dynamic HTML

`buzzy.js` is an **ES module**: the browser evaluates it **once**. The built-in **auto-init** (scanning `<script src="…/buzzy.js" data-key data-target>`) therefore only runs on that first load. If you inject the widget **later** (AJAX, tabs, client router), trigger mounting yourself after the new nodes exist:

1. **Manual host** — same options as the script tag, programmatic:

   ```js
   window.Buzzy.init({
     key: "YOUR_PUBLIC_API_KEY",
     target: "#buzzy-embed", // or document.getElementById("buzzy-embed")
     pageUrl: "https://yoursite.com/this-page", // required — same rules as data-page-url
     apiBase: "https://your-api-origin", // optional
     mode: "comment", // optional
     pageTitle: document.title, // optional
   });
   ```

2. **Declarative bulk scan** — insert a self-describing host and call **`Buzzy.scan(root)`** (default `root` = `document`). Each **`[data-buzzy-host]`** needs **`data-key`** and **`data-page-url`**; already-mounted nodes are skipped.

   ```html
   <div
     data-buzzy-host
     data-key="YOUR_PUBLIC_API_KEY"
     data-page-url="https://shop.example/p/1"
     data-api-base="https://your-api-origin"
     data-mode="comment"
     data-page-title="Product"
   ></div>
   ```

   ```js
   // After appending the fragment (jQuery example: $(container).html(…))
   window.Buzzy.scan(container); // or document.getElementById("drawer")
   ```

   Optional attributes: **`data-api-base`**, **`data-mode`**, **`data-page-title`**. **`data-page-url`** is required on each host.

Environment variables: **`NEXT_PUBLIC_SDK_URL`** (default in How to use: `http://localhost:3000/buzzy.js`), **`NEXT_PUBLIC_API_URL`** (optional separate API origin, e.g. `https://api.example.com` — no path suffix required).

## WordPress / Elementor

1. Add an **HTML** widget in Elementor where the widget should appear.
2. Paste an empty container (e.g. `<div id="buzzy-comments"></div>`) plus the `<script>` tag, with `data-target="#buzzy-comments"` matching that `id`, and **required** `data-page-url` set to this page's logical id (full URL or path).
3. Or assign **Advanced → CSS ID** on a section and use `data-target="#your-id"`.

No separate plugin is required—only the script, parameters, and selector.

---

*Regenerate longer architecture, API, and schema sections from your previous revision or version control if needed.*
