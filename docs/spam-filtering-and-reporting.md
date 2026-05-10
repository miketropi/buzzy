# Spam filtering and reporting for Buzzy

This document summarizes **what Buzzy already does**, **gaps versus a full abuse-prevention stack**, and **practical options** for evolving spam filtering and user reporting. It is intended for product and engineering planning, not as an implementation spec.

---

## 1. Goals

| Goal | Notes |
| --- | --- |
| **Reduce automated abuse** | Bots, drive-by spam, SEO injection, mass account behavior |
| **Reduce low-quality UGC** | Promotional floods, duplicate posts, template reviews |
| **Detect policy violations** | Harassment, illegal content, fake reviews (often needs human review) |
| **Give users a voice** | “Report” flows without breaking trust or enabling brigading |
| **Keep operators effective** | Dashboards, queues, and automation with clear auditability |

No single layer is sufficient; production systems usually combine **rate limits**, **content signals**, **reputation**, **optional third-party APIs**, and **human moderation**.

---

## 2. What Buzzy already implements

### 2.1 Content filter (project settings)

- **Location**: `src/lib/public-api/spam.ts` (`getSpamBlockReasonForText` / legacy `matchesSpamPatterns` boolean)
- **Behavior**:
  - When `enableSpamFilter` is true (default in `src/lib/project-defaults.ts`), phrases in `blockedWords` are checked (case-insensitive). With **`spamMatchWholeWords`**, single-token lines use `\b` boundaries; multi-word phrases use non-alphanumeric separators (reduces substring false positives versus raw `includes`).
  - Optional **`spamBlockedRegex`**: up to 15 case-insensitive JS `RegExp` strings (invalid patterns skipped at runtime).
  - **`spamMaxUrlsPerPost`**: caps counts of `http(s)://` and `www.`‑style links in the body (0 = disabled).
- **Applied on**: Public API create/update for comments and reviews (`src/app/api/v1/comments/**`, `reviews/**`), plus internal staff replies that run the same spam gate.
- **Limitations**: Regex can be abused with pathological patterns on the server; phrase rules are still trivially bypassable (leetspeak, images). No ML or vendor APIs in this layer.

### 2.2 Duplicate message filter (same page, time window)

- **Location**: `src/lib/public-api/content-duplicate.ts`, fields `duplicateBodyHash` on `Comment` and `Review` in Prisma.
- **Behavior**: When **`spamDuplicateWindowSeconds` > 0**, new or edited public body text is fingerprinted (normalized lowercase, collapsed whitespace, SHA-256). If another **non-deleted** row on the same project and page has the same fingerprint within the window, the request is rejected with a validation error. Edits exclude the current comment/review id so authors can save without self-collision.

### 2.3 IP blocklist

- **Location**: `isBlockedIp()` in `src/lib/public-api/spam.ts`, fed from `settings.blockedIPs`.
- **Behavior**: Exact string match per client IP (see `clientIp()` in `src/lib/public-api/rate-limit-request.ts` using `X-Forwarded-For` / `X-Real-IP`).
- **Limitations**: IPs change (mobile, NAT); attackers rotate; listing full ranges is not supported in current helper.

### 2.4 Rate limits

- **Location**: `src/lib/public-api/rate-limit-request.ts` (Redis-backed via `src/lib/rate-limit`).

| Scope | Default env | Window |
| --- | --- | --- |
| Comments | `RATE_LIMIT_COMMENTS` (default 5) | 60s |
| Reviews | `RATE_LIMIT_REVIEWS` (default 3) | 3600s |
| Votes | `RATE_LIMIT_VOTES` (default 30) | 60s |
| Reports | `RATE_LIMIT_REPORTS` (default 10) | 3600s |
| Uploads | `RATE_LIMIT_UPLOADS` (default 30) | 3600s |

These address **volume** abuse, not semantic spam.

**Per-identity caps (Phase B)**: When **`spamPerIdentityCommentLimit`** or **`spamPerIdentityReviewLimit`** > 0, Redis keyed by `projectId:commenterId` enforces an additional limit over **`spamPerIdentityWindowSeconds`** (minimum 60), on top of IP limits—useful for shared NAT environments.

### 2.5 User reporting (API)

- **Store**: `Report` model in `prisma/schema.prisma` (`commentId` / `reviewId`, `reason`, optional `description`, `reporterIp`, `status` default `pending`).
- **Endpoints**:
  - `POST /api/v1/comments/:commentId/report`
  - `POST /api/v1/reviews/:reviewId/report`
- **Payload validation**: `reportCommentBodySchema` / `reportReviewBodySchema` in `src/lib/validators/comment.ts` and `review.ts` (reason enums, optional description).
- **Limits**: `assertReportRateLimit()` per IP.
- **Dashboard / widget**: Operators can triage pending reports under the project **Reports** tab; the embed exposes **Report** on comments/reviews (Phase A).

### 2.6 Content status

- Types include `ContentStatus` with `"spam"` among statuses (`src/types/index.ts`). The pipeline can mark or use spam as a status; the full moderation story depends on how the API and dashboard treat `status` and reports together.

---

## 3. Spam defense: a layered model

Useful mental model when choosing features:

1. **Edge / infrastructure**  
   - CDN/WAF rules, bot scores (e.g. Cloudflare), geographic policy, TLS.  
   - Out of scope for app code but often the highest ROI against volumetric abuse.

2. **Application rate and identity**  
   - Per-IP limits (already present).  
   - Per-user / per-session / per-device limits for authenticated or SSO-identified users.  
   - Cooldowns after failed posts, exponential backoff for suspicious behavior.

3. **Content and metadata signals**  
   - Rule-based lists (current `blockedWords`).  
   - **Link density**, excessive URLs, known short-link patterns, suspicious TLDs.  
   - **Duplicate / near-duplicate** detection (SimHash, minhash on normalized text).  
   - **Attachment** heuristics (file type, size, repeated hashes).  
   - **Entropy / repetition** (single-line spam, keyboard mashing).

4. **External reputation services**  
   - **Akismet** (WordPress ecosystem standard): REST `comment-check` with key, blog URL, IP, user agent, content; supports reporting spam/ham back for learning. Best when you can send structured author + content fields.  
   - **hCaptcha** / **reCAPTCHA** / **Turnstile**: raise cost for scripted sign-up and anonymous post flows.  
   - **Email / IP reputation APIs** (various vendors): useful when email collection is enabled.

5. **Machine learning and moderation APIs**  
   - Host-run classifiers (toxicity, NSFW, PII).  
   - LLM-assisted **classification** with strict policy prompts and low temperature — useful for triage but should not auto-delete without thresholds; latency and cost matter.

6. **Human moderation**  
   - Queue for `pending` content and `Report` rows.  
   - Audit log (who decided, when).  
   - Appeals path for false positives.

---

## 4. Reporting mechanism: product and technical patterns

### 4.1 Widget UX

- Entry points: overflow menu on each comment/review (“Report”), optional long-press on mobile.  
- Minimal friction: reason chips + optional details; avoid captcha on every report if rate limits exist.  
- **Anti-brigading**: do not auto-remove on first report; use thresholds, velocity caps, or trusted reporter signals.

### 4.2 Server rules

- **Deduplicate**: one open report per reporter + target, or cap duplicates.  
- **Escalation**: e.g. `pending` → after N distinct reporters or high-severity reason → notify moderators.  
- **Automation (careful)**: auto-hide or auto-set `status` to `spam` only with clear rules + logging.

### 4.3 Dashboard

- List **open reports** filtered by project, reason, age.  
- Deep link to the comment/review, one-click **Dismiss**, **Remove content**, **Ban IP** / **Ban user external id** (if SSO), **Mark spam**.  
- Update `Report.status` to `actioned` / `dismissed` for metrics.

### 4.4 Observability

- Metrics: reports per day, time-to-triage, false-positive rate (from appeals).  
- Optional webhook or email when report count exceeds threshold per item.

---

## 5. Recommended directions (phased)

These are **prioritized** combinations of work that fit a product like Buzzy (embeddable widget, API-first, optional anonymity).

### Phase A — Close the loop on what you already store

1. **Dashboard: reports queue**  
   - Query `Report` where `status = 'pending'`, join comment/review and project.  
2. **Widget: report UI**  
   - Wire `POST .../report` from the widget with the same reasons as validators.  
3. **Settings UI** for `blockedWords`, `blockedIPs`, `enableSpamFilter` if not fully exposed (reduce support burden).

### Phase B — Stronger cheap filters (no new vendors) — **implemented**

1. **Richer rule engine**: optional whole-word lists, optional regex list, max links per post (`spam.ts` + dashboard **General → Spam filtering**).
2. **Duplicate detection** on `(projectId, pageId, normalized body hash)` with **`spamDuplicateWindowSeconds`** (`content-duplicate.ts` + `duplicateBodyHash` columns).
3. **Per-identity rate limits** alongside IP limits (`spamPerIdentityCommentLimit` / `spamPerIdentityReviewLimit` + shared window in Redis).

### Phase C — Optional third-party — **implemented**

1. **Akismet**: Project settings (`akismetEnabled`, `akismetApiKey`, `akismetBlogUrl`, `akismetRejectSpam`). Server helper `src/lib/public-api/akismet-check.ts`; advisory merge in `content-advisory.ts`. Global kill-switch **`BUZZY_AKISMET_DISABLED=1`** skips outbound checks.
2. **CAPTCHA**: **Cloudflare Turnstile** when **`captchaProvider`** is `turnstile`. Keys + **`captchaMode`** (`off` | `anonymous_only` | `risk` | `always`) and optional **`captchaRiskMinLinks`** / **`captchaRiskMinScore`**. Widget reads **`captcha_site_key`**, **`captcha_mode`**, and risk knobs from public config; sends **`captcha_token`** on comment/review POSTs. **`captcha-ui.ts`** matches **`captcha-gate.ts`** so the widget only renders Turnstile when verification may be required.

### Phase D — Trust and safety program — **implemented**

1. **Advisory signals**: Local heuristics + optional OpenAI moderation (`OPENAI_API_KEY`); merged with Akismet; persisted on **`Comment`** / **`Review`** (`advisory_signals` JSON).
2. **Moderation audit log**: **`ModerationAuditLog`** + **`writeModerationAuditLog`** on triage / appeal / status updates as wired in internal routes.
3. **Appeals**: **`Appeal`** model; **`POST /api/v1/appeals`**; dashboard **Appeals** tab; rate limit **`RATE_LIMIT_APPEALS`** (default 5 / hour per IP).

---

## 6. Privacy and compliance

- **IP addresses** (`submitterIp`, `reporterIp`): document retention and legal basis (GDPR, etc.); consider TTL or hashing at rest for reports older than N days.  
- **User-visible text** in reports (descriptions): sanitize length and store for investigation only.  
- **Transparency**: short public policy on what is filtered automatically vs reviewed by humans.

---

## 7. Summary

| Layer | In Buzzy today | Typical next step |
| --- | --- | --- |
| Rate limits | Yes (per-IP env + optional per-identity Redis per project) | Vendor WAF, exponential backoff |
| Word / rule blocks | Words, IPs, optional whole-word + regex lists, URL cap, duplicate-window hash | Vendor APIs, smarter dedup |
| Reports DB + API | Yes (+ dashboard queue + embed report UI) | Webhooks / notifications |
| External spam API | Optional Akismet per project (advisory + optional reject) | Spam/ham feedback loops |
| CAPTCHA | Turnstile (off / guests-only / risk / always) | Other providers |
| ML / LLM moderation | Optional OpenAI moderation → advisory JSON | Self-hosted classifiers |

This roadmap keeps **incremental value**: Phase A unlocks the reporting system you already modeled; later phases add depth without committing to a single vendor.

---

## 8. References (external)

- Akismet developer documentation: building an integration, `comment-check`, submitting spam/ham feedback — [Akismet Development](https://akismet.com/development/)  
- OWASP and general API security guidance for abuse scenarios — useful for rate-limit and auth design  

---

## 9. Code map (this repository)

| Area | Path |
| --- | --- |
| Spam matching | `src/lib/public-api/spam.ts` |
| Duplicate detection | `src/lib/public-api/content-duplicate.ts`, `duplicateBodyHash` on `Comment` / `Review` |
| Per-identity limits | `src/lib/public-api/rate-limit-request.ts` (`assertCommentPostRateLimitForIdentity`, `assertReviewPostRateLimitForIdentity`) |
| Comment / review spam checks | `src/app/api/v1/comments/**/*.ts`, `src/app/api/v1/reviews/**/*.ts` |
| Report routes | `src/app/api/v1/comments/[commentId]/report/route.ts`, `.../reviews/[reviewId]/report/route.ts` |
| Rate limits | `src/lib/public-api/rate-limit-request.ts` |
| Report schema | `prisma/schema.prisma` → `Report` |
| Validators | `src/lib/validators/comment.ts`, `src/lib/validators/review.ts` |
| Project settings keys | `src/lib/project-defaults.ts`, `src/lib/validators/project.ts` |
| Phase C/D (Akismet, Turnstile, advisory, appeals) | `akismet-check.ts`, `turnstile-verify.ts`, `captcha-gate.ts`, `captcha-ui.ts`, `content-advisory.ts`, `moderation-audit.ts`, `appeals` routes under `api/v1` and `api/internal` |
| Prisma models | `ModerationAuditLog`, `Appeal`; `advisory_signals` on Comment/Review |
