# Buzzy

Embeddable **comments**, **reviews**, and **ratings** for the web. Hosts load `buzzy.js`, pass a publishable API key, a **required logical page id** (`data-page-url` / `pageUrl`: URL, path, slug, or id), and a container selector (`data-target`); the widget mounts in a **Shadow DOM**.

See [PROJECT.md](./PROJECT.md) for phases (embed SDK, shared widget chrome), SDK quick start, and WordPress notes.

## Prerequisites

- Node 20+ (recommended)
- MySQL 8 and Redis (local: `docker compose up -d`)

## Setup

```bash
cp .env.example .env
# Edit DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, OAuth, etc.

npm install
npm run db:push
npm run dev
```

`postinstall` runs Prisma client generation and **`gen:widget-chrome`** (CSS → TS strings). `predev` / **`build`** also run **`build:embed`** so `public/buzzy.js` stays in sync with `src/embed/buzzy-bundle.ts`.

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Prisma, widget chrome, embed bundle, production Next build |
| `npm run gen:widget-chrome` | Regenerate `src/lib/generated/widget-chrome-*.ts` from `src/embed/widget-chrome.css` |
| `npm run build:embed` | esbuild → `public/buzzy.js` + `public/buzzy/embed-*.js` (ESM, minified) |
| `npm run db:push` / `db:studio` | Prisma (with `dotenv-cli` + `.env`) |

## Env highlights

- **`NEXT_PUBLIC_SDK_URL`** — Snippet base for `buzzy.js` (e.g. `http://localhost:3000/buzzy.js`).
- **`NEXT_PUBLIC_API_URL`** — Optional API origin when it differs from the app origin.

Full list: [.env.example](./.env.example).
