CREATE TABLE `submission_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submission_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`brand` text NOT NULL,
	`condition` text NOT NULL,
	`description` text NOT NULL,
	`provenance` text NOT NULL,
	`preference` text NOT NULL,
	`asking_price` text NOT NULL,
	`currency` text NOT NULL,
	`seller_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`location` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`consent_at` text NOT NULL,
	`language` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_reference_unique` ON `submissions` (`reference`);--> statement-breakpoint
CREATE INDEX `submissions_status_date` ON `submissions` (`status`,`created_at`);