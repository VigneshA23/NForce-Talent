ALTER TABLE `portal_credentials` ADD `temporary` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `portal_credentials` ADD `temporary_expires_at` integer;