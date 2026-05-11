# Production deployment

This document describes how to run Buzzy (the Next.js dashboard, public API, and embedded widget) against production-grade MySQL and Redis. The app does not ship a container image in this repository; you typically run **Node.js on the host or your own image** and use Docker only for **backing services** when it helps.

---

## What you are deploying

| Piece | Role |
|--------|------|
| **Next.js** (`next build` → `next start`) | HTTP UI, `/api/v1/*`, NextAuth, dashboard |
| **MySQL 8.x** | Primary data store (Prisma) |
| **Redis** | Rate limiting and similar shared state |
| **Object storage (optional)** | Cloudflare R2 (or S3-compatible) for attachment uploads when configured |

Supporting services (SMTP, OAuth, Turnstile keys, etc.) are configured through environment variables or project settings as applicable.

---

## Prerequisites

- **Node.js** aligned with the repo (see `.nvmrc`, currently **24**).
- **MySQL** compatible with Prisma’s MySQL provider (**8.4** matches `docker-compose-product.yml`).
- **Redis** (**7** matches the compose file).

---

## Option A: Docker Compose for MySQL and Redis only

The file `docker-compose-product.yml` defines a **production-style** Compose project named `buzzy-prod` (separate volumes and defaults from the dev `docker-compose.yml`).

1. Create an env file (for example `.env.docker-prod`) with at least:

   ```bash
   MYSQL_ROOT_PASSWORD=your-root-password
   MYSQL_PASSWORD=your-app-user-password
   # Optional overrides:
   # MYSQL_DATABASE=buzzy
   # MYSQL_USER=buzzy
   # REDIS_PASSWORD=your-redis-password
   ```

   `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` are **required** by the compose file (`:?`).

2. Start services:

   ```bash
   docker compose --env-file .env.docker-prod -f docker-compose-product.yml up -d
   ```

3. By default, ports are bound to **127.0.0.1** only:

   - MySQL: `127.0.0.1:3306`
   - Redis: `127.0.0.1:6379`

   If the dev stack already uses those ports, publish on alternates, for example:

   ```bash
   MYSQL_PUBLISH_PORT=3307 REDIS_PUBLISH_PORT=6380 \
     docker compose --env-file .env.docker-prod -f docker-compose-product.yml up -d
   ```

4. Point your app at the same ports in `DATABASE_URL` and `REDIS_URL` (see below).

Compose details worth knowing:

- **Project name**: `buzzy-prod` (avoids clashing with a local `docker compose` dev project).
- **Redis**: append-only file (AOF) enabled for durability; optional `REDIS_PASSWORD`.
- **Restart**: `unless-stopped` on both services.

---

## Option B: Managed database and Redis

Use your cloud provider’s **MySQL** and **managed Redis** (ElastiCache, Memorystore, etc.). Set `DATABASE_URL` and `REDIS_URL` to the connection strings they give you. You do not need `docker-compose-product.yml` for that path.

Production checklist for managed tiers:

- Use TLS if the provider recommends it (encode options in the URL per Prisma/MySQL docs).
- Restrict network access (VPC, firewall, IP allow lists).

---

## Application environment variables

Create a **production** `.env` (or inject the same keys via your platform’s secret manager). Never commit real secrets.

### Required for a working install

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string, e.g. `mysql://USER:PASSWORD@HOST:3306/DATABASE` |
| `REDIS_URL` | Redis URL, e.g. `redis://127.0.0.1:6379` or `redis://:PASSWORD@HOST:6379` |
| `NEXTAUTH_SECRET` | Strong random secret for session/JWT crypto (alternatively `AUTH_SECRET` in some setups) |
| `NEXTAUTH_URL` | **Public origin** of the app, e.g. `https://comments.example.com` (no trailing path) |

Example when Compose binds MySQL and Redis locally:

```bash
DATABASE_URL="mysql://buzzy:YOUR_PASSWORD@127.0.0.1:3306/buzzy"
REDIS_URL="redis://127.0.0.1:6379"
```

With a Redis password:

```bash
REDIS_URL="redis://:YOUR_REDIS_PASSWORD@127.0.0.1:6379"
```

### Public URLs (widget and API)

Embed scripts and dashboard “how to install” helpers use:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SDK_URL` | Full URL to `buzzy.js`, e.g. `https://comments.example.com/buzzy.js` |
| `NEXT_PUBLIC_API_URL` | Public API base, e.g. `https://comments.example.com/api/v1` |

Set these to your real HTTPS origin so generated snippets point at production.

### Optional: dashboard OAuth

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub sign-in |

### Optional: email (SMTP)

Used when outbound email is enabled in your deployment:

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | SMTP host |
| `SMTP_PORT` | Port |
| `SMTP_USER` / `SMTP_PASS` | Credentials |
| `EMAIL_FROM` | From address |

### Optional: uploads (Cloudflare R2)

When all of the following are set, attachment uploads via presigned URLs are enabled:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL`

Configure bucket **CORS** so browsers on customer sites can `PUT`/`GET` as required. Without R2 variables, uploads can be omitted or disabled via product settings.

### Optional: Host SSO signing (dashboard helpers)

Signing examples for Host SSO may use **`BUZZY_HOST_SSO_SECRET`** on the server that runs signing scripts (`scripts/sign-host-sso-example.mjs`). See **`docs/host-sso-commenter-external-id.md`** for product behavior.

### Optional: spam / moderation tooling

See **`docs/spam-filtering-and-reporting.md`**. **`BUZZY_AKISMET_DISABLED=1`** disables Akismet checks globally when you need that escape hatch.

### Rate limits

Optional overrides (integers):

- `RATE_LIMIT_COMMENTS`
- `RATE_LIMIT_REVIEWS`
- `RATE_LIMIT_VOTES`
- `RATE_LIMIT_REPORTS`

---

## Database migrations

This repo ships **SQL migrations** under `prisma/migrations/`. For production, apply them with migrate deploy — not `db push`:

```bash
export DATABASE_URL="mysql://..."
npx prisma migrate deploy
```

Run this after deploying new code whenever migrations are included in the release.

---

## Build and run

Install dependencies and build:

```bash
npm ci
npm run build
```

`npm run build` runs Prisma generate, widget chrome sync, embed build, and `next build`.

Start the server:

```bash
NODE_ENV=production npm run start
```

By default `next start` listens on port **3000**. Put **HTTPS** termination and routing in front (Caddy, nginx, Traefik, or a cloud load balancer).

### Reverse proxy notes

- Set **`NEXTAUTH_URL`** (and **`NEXT_PUBLIC_*`**) to the **external** `https://` origin users see.
- Rate limiting reads **`X-Forwarded-For`** / **`X-Real-IP`** where present; configure your proxy to set them correctly.

---

## Process supervision

Keep `next start` running with **systemd**, **PM2**, **Docker** (your own image), Kubernetes, or a PaaS. The codebase does not require a cron job for the HTTP app itself.

---

## Post-deploy verification

1. Open the dashboard login URL.
2. Confirm health of DB: sign in, load a project.
3. Hit **`GET /api/v1/config?key=...`** (public widget bootstrap) using a known project key over HTTPS.
4. Load **`NEXT_PUBLIC_SDK_URL`** in the browser once to confirm **`buzzy.js`** is served (CORS headers are set in **`next.config.mjs`**).

---

## Security reminders

- Rotate **`NEXTAUTH_SECRET`** and database passwords independently of commits.
- Do not expose MySQL or Redis to the public internet unless your threat model intentionally allows it with strong auth/TLS.
- Treat **R2** keys like any other secret; scope IAM/R2 tokens minimally.

---

## Related files

- `docker-compose.yml` — local development MySQL + Redis.
- `docker-compose-product.yml` — production-oriented Compose stack for MySQL + Redis.
- `docs/host-sso-commenter-external-id.md` — Host SSO wiring.
- `docs/spam-filtering-and-reporting.md` — spam and reporting behavior.
