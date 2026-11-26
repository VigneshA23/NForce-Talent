CREATE UNIQUE INDEX `application_person_requirement` ON `applications` (`person_id`,`requirement_id`);--> statement-breakpoint
CREATE INDEX `application_owner` ON `applications` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `jd_requirement_version` ON `jd_versions` (`requirement_id`,`version`);