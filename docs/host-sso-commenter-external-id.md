# Host SSO: `sub`, `externalId`, and multiple apps

This document clarifies how Buzzy ties Host SSO assertions to **`Commenter`** rows and what happens when **`sub`** values overlap across apps or projects.

## Token field vs database column

- The Host SSO JWT payload includes **`sub`** — the host’s stable user identifier (subject).
- After verification, that value is stored on the **`commenters`** row as **`externalId`** — there is **no separate `externalId` field in the token**; it is **`sub`** in the signed payload.

Relevant implementation: `src/lib/public-api/resolve-host-sso-commenter.ts` (lookup and upsert by `claims.sub`), and verification in `src/lib/public-api/host-sso-assertion.ts`.

## Upsert (“sync”) behavior

For each verified assertion, Buzzy:

1. Finds a row with **`projectId`** = API key’s project, **`provider`** = `host_sso`, **`externalId`** = **`sub`**.
2. If found: **updates** `name`, `email`, `avatar`, and metadata (e.g. `username`) from the claims.
3. If not found: **creates** a new commenter with those fields.

So the identity “syncs” whenever a valid assertion is presented: profile fields follow the latest token.

## Uniqueness scope: per Buzzy project

The schema enforces uniqueness on **`(projectId, externalId)`**, not globally:

- The same **`sub`** string in **different Buzzy projects** → **different** `Commenter` rows (different `projectId`). No collision, no merging across projects.

## Two apps using the same `sub`

Interpret “apps” carefully:

### A) Different Buzzy projects (different publishable keys / different `pid` in token)

- Same **`sub`** in App 1 and App 2 → **two separate commenters**, one per project.
- Each project has its own Host SSO secret; tokens are bound to **`pid`** and verified with **that project’s secret** (`verifyHostSsoAssertion` checks `pid === expectedProjectId`).

### B) Same Buzzy project (same API key / same project id)

- Same **`sub`** from any integration surface → **one** `Commenter` row for that project.
- Typical intent: web, mobile, or multiple pages all represent **the same logical product** wired to **one** Buzzy project; one user maps to **one** Buzzy commenter account (shared history: comments, reviews, votes for that commenter id).

If two distinct products share **one** Buzzy project but must **not** share commenters even when upstream user ids collide, **namespace **`sub`** in your backend** before signing (for example `shop:user-42` vs `admin:user-42`). Buzzy does not add an extra namespace beyond **`projectId`**.

## References

| Topic | Location |
|--------|-----------|
| Upsert logic | `src/lib/public-api/resolve-host-sso-commenter.ts` |
| JWT verify (`pid`, `sub`, `exp`, etc.) | `src/lib/public-api/host-sso-assertion.ts` |
| Commenter uniqueness | `prisma/schema.prisma` → `Commenter`, `@@unique([projectId, externalId])` |
| Operational overview | `PROJECT.md` → **Host SSO** |
