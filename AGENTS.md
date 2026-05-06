# Agent context — Buzzy

Orient here before changing behavior across dashboard, APIs, or the embed SDK. **Detailed product/embed contract:** [PROJECT.md](./PROJECT.md). **Local setup:** [README.md](./README.md).

## What this is

**Buzzy** is an embeddable **comments**, **reviews**, and **ratings** product. Host sites load **`/buzzy.js`** (ES module) with a publishable API key, **`data-page-url`** (logical page id), and a mount selector. The widget runs in **Shadow DOM**. Dashboard users manage projects, keys, appearance, and moderation.

## Stack

- **App:** Next.js **14** (App Router), React 18, TypeScript, Tailwind (dashboard/components — **not** inside `widget-ui`).
- **Data:** Prisma **5** + **MySQL 8** (`prisma/schema.prisma`).
- **Cache / rate limits:** Redis (`ioredis`, `src/lib/redis.ts`, `src/lib/rate-limit.ts`).
- **Auth:** NextAuth v5 (`src/lib/auth.ts`, `src/lib/auth.config.ts`). **Middleware** in `src/middleware.ts`: `/api/v1/*` is public (with CORS for OPTIONS); `/api/internal/*` and `/dashboard/*` require a session.

## Routes and API surface

- **`/api/v1/*`** — **Public widget API** (API key + optional commenter token / host SSO header). Handlers under `src/app/api/v1/`. Shared helpers: `src/lib/public-api/*` (CORS, origin checks, serialization, host SSO, R2 uploads).
- **`/api/internal/*`** — **Dashboard/server** JSON API; session-protected by middleware.
- **`/api/auth/*`** — NextAuth and registration-style routes as present in `src/app/api/auth/`.

When adding public endpoints, follow existing patterns for **origin/domain allowlists**, **rate limiting**, and **key validation**.

## Embed pipeline (do not skip when changing widget UI)

1. **Source chrome CSS:** `src/embed/widget-chrome.css` — uses `var(--bz-*)` on `.bz`.
2. **Codegen:** `npm run gen:widget-chrome` → `src/lib/generated/widget-chrome-shadow.ts` and `widget-chrome-scoped.ts` (runs on `postinstall`, `predev`, `build`).
3. **Tokens / shared styles:** `src/lib/widget-chrome-tokens.ts` — dashboard preview and embed must stay aligned (`WidgetAppearancePreview` vs embed apps).
4. **Embed bundle:** `src/embed/buzzy-bundle.ts` → **`npm run build:embed`** → `public/buzzy.js` + lazy `public/buzzy/embed-*.js` (esbuild, ESM).
5. **Feature UI:** `src/widget-ui/*` — use **`bz-*`** classes only; **no Tailwind** in widget-ui. Dynamic apps: `embed-comments-app.tsx`, `embed-reviews-app.tsx`.

After changing chrome markup, classes, or widget-only components: run **`gen:widget-chrome`** and **`build:embed`** (or full `npm run dev` / `npm run build`).

## Repository map (high signal)

| Area | Path |
| --- | --- |
| Dashboard pages | `src/app/dashboard/` |
| Auth pages | `src/app/(auth)/` |
| Public API | `src/app/api/v1/` |
| Internal API | `src/app/api/internal/` |
| Embed entry & fetch | `src/embed/` |
| Widget presentational UI | `src/widget-ui/` |
| Dashboard components | `src/components/` |
| Auth, Prisma, Redis | `src/lib/` |
| Validators (Zod) | `src/lib/validators/` |
| Static embed output | `public/buzzy.js`, `public/buzzy/embed-*.js` |
| Scripts | `scripts/` (`sync-widget-chrome.mjs`, `build-embed.mjs`, etc.) |

## Tooling and Node

- **`.nvmrc`** pins the expected Node version for this repo (currently **24**). README still mentions 20+; prefer **`.nvmrc`** when choosing a runtime.
- **Lint:** `npm run lint` (Next ESLint).

## Conventions for agents

- Prefer **small, focused diffs**; match existing patterns in the nearest route or `lib/public-api` helper.
- **Never** edit `src/lib/generated/widget-chrome-*.ts` by hand — regenerate via `gen:widget-chrome`.
- Keep **dashboard appearance** and **embed** visually and structurally in sync when touching shared chrome (see PROJECT.md Phase 5).
- **Secrets:** Host SSO uses per-project HMAC (`embedSsoSecret` on `Project`); document behavior in PROJECT.md when changing verification or headers.
