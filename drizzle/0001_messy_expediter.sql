CREATE TABLE `cms_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`request_key` text NOT NULL,
	`created_at` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`data` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_orders_reference_unique` ON `cms_orders` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `cms_orders_request_key_unique` ON `cms_orders` (`request_key`);--> statement-breakpoint
CREATE TABLE `cms_products` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
