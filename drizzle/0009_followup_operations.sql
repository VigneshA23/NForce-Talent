ALTER TABLE `tasks` ADD `priority` text NOT NULL DEFAULT 'Normal';
ALTER TABLE `tasks` ADD `category` text NOT NULL DEFAULT 'General';
ALTER TABLE `tasks` ADD `notes` text NOT NULL DEFAULT '';
ALTER TABLE `tasks` ADD `related_type` text NOT NULL DEFAULT 'None';
ALTER TABLE `tasks` ADD `related_id` text NOT NULL DEFAULT '';
ALTER TABLE `tasks` ADD `timezone` text NOT NULL DEFAULT 'America/New_York';
ALTER TABLE `tasks` ADD `created_by` text NOT NULL DEFAULT '';
ALTER TABLE `tasks` ADD `completed_at` text;
ALTER TABLE `tasks` ADD `version` integer NOT NULL DEFAULT 1;
