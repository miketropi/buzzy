-- Drop Phase D: appeals, moderation audit log, advisory_signals on comments/reviews

DROP TABLE IF EXISTS `appeals`;
DROP TABLE IF EXISTS `moderation_audit_logs`;

ALTER TABLE `comments` DROP COLUMN `advisory_signals`;
ALTER TABLE `reviews` DROP COLUMN `advisory_signals`;
