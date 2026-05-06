-- MySQL default `String` mapped to VARCHAR(191); long HTTPS avatar URLs caused failed writes.
-- Widen so Host SSO `avatar` / `email` claims persist reliably.
ALTER TABLE `commenters` MODIFY `email` VARCHAR(255) NULL;
ALTER TABLE `commenters` MODIFY `avatar` VARCHAR(2048) NULL;
