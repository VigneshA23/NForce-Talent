CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`actor_name` text NOT NULL,
	`action` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`requirement_id` text NOT NULL,
	`stage` text NOT NULL,
	`client_result` text NOT NULL,
	`result_source` text NOT NULL,
	`jd_version` integer NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedback_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`interview_id` text NOT NULL,
	`kind` text NOT NULL,
	`body` text NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`kind` text NOT NULL,
	`round` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`timezone` text NOT NULL,
	`interviewer_id` text,
	`interviewer_name` text NOT NULL,
	`meeting_url` text NOT NULL,
	`attendance` text NOT NULL,
	`employee_feedback` text,
	`assessment` text,
	`released` integer DEFAULT 0 NOT NULL,
	`owner_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jd_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`requirement_id` text NOT NULL,
	`version` integer NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`person_id` text,
	`auth_id` text,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_email_unique` ON `members` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_auth_id_unique` ON `members` (`auth_id`);--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`skills` text NOT NULL,
	`location` text NOT NULL,
	`availability` text NOT NULL,
	`project` text NOT NULL,
	`owner_id` text NOT NULL,
	`sample` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`client` text NOT NULL,
	`location` text NOT NULL,
	`skills` text NOT NULL,
	`jd` text NOT NULL,
	`jd_version` integer DEFAULT 1 NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`openings` integer NOT NULL,
	`owner_id` text NOT NULL,
	`sample` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`jd_version` integer NOT NULL,
	`recipient` text NOT NULL,
	`resume_label` text NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`due` text NOT NULL,
	`status` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text NOT NULL
);
