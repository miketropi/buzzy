-- Removed unused Project.moderationMode; submissions use JSON settings.requireApproval instead.
ALTER TABLE `projects` DROP COLUMN `moderationMode`;
