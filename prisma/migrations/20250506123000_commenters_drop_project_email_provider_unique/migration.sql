-- `@@unique([projectId, email, provider])` blocked multiple `host_sso` identities (distinct `externalId`)
-- that share one email — and SSO upserts only key on `(projectId, externalId)`. Anonymous reuse of the same
-- email is still enforced in `resolveAnonymousCommenterId` (application-level find/create).
DROP INDEX `commenters_projectId_email_provider_key` ON `commenters`;
