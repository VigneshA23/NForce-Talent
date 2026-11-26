CREATE TABLE `feedback_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`interview_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`scheduled_at` integer NOT NULL,
	`sent_at` integer,
	`last_sent_at` integer,
	`opened_at` integer,
	`submitted_at` integer,
	`expires_at` integer NOT NULL,
	`reminder_count` integer DEFAULT 0 NOT NULL,
	`delivery_id` text,
	`last_error` text,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_requests_token_hash_unique` ON `feedback_requests` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_request_interview` ON `feedback_requests` (`interview_id`);--> statement-breakpoint
CREATE INDEX `feedback_request_status` ON `feedback_requests` (`status`,`scheduled_at`);
