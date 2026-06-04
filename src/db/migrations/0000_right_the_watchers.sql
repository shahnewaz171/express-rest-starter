CREATE TYPE "public"."permission_action" AS ENUM('create', 'read', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."permission_module" AS ENUM('permission', 'role', 'role_permission', 'role_user', 'user');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('admin', 'developer', 'moderator', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'invited', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."verification_token_status" AS ENUM('cancelled', 'verified', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."verification_token_type" AS ENUM('forgot_password', 'user_verification');--> statement-breakpoint
CREATE TABLE "auth_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"body" text NOT NULL,
	"event" text NOT NULL,
	"subject" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_templates_event_unique" UNIQUE("event")
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" "permission_action" NOT NULL,
	"module" "permission_module" NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "role_name" NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"can_do_the_action" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"new_email" text,
	"phone_number" text,
	"password" text NOT NULL,
	"old_passwords" text[] DEFAULT '{}' NOT NULL,
	"status" "user_status" DEFAULT 'unverified' NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" "verification_token_status" DEFAULT 'unverified' NOT NULL,
	"token" text NOT NULL,
	"type" "verification_token_type" DEFAULT 'user_verification' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_templates" ADD CONSTRAINT "auth_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_templates_created_at_idx" ON "auth_templates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auth_templates_created_by_idx" ON "auth_templates" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "auth_templates_subject_idx" ON "auth_templates" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "auth_templates_updated_at_idx" ON "auth_templates" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_tokens_access_token_idx" ON "auth_tokens" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "auth_tokens_user_id_idx" ON "auth_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_tokens_created_at_idx" ON "auth_tokens" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auth_tokens_refresh_token_idx" ON "auth_tokens" USING btree ("refresh_token");--> statement-breakpoint
CREATE INDEX "auth_tokens_updated_at_idx" ON "auth_tokens" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "permissions_created_at_idx" ON "permissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "permissions_created_by_idx" ON "permissions" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_action_module_idx" ON "permissions" USING btree ("action","module");--> statement-breakpoint
CREATE INDEX "permissions_updated_at_idx" ON "permissions" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "roles_created_by_idx" ON "roles" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_idx" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_created_at_idx" ON "role_permissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "role_permissions_created_by_idx" ON "role_permissions" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "role_permissions_updated_at_idx" ON "role_permissions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "role_permissions_updated_by_idx" ON "role_permissions" USING btree ("updated_by");--> statement-breakpoint
CREATE UNIQUE INDEX "role_users_role_id_user_id_idx" ON "role_users" USING btree ("role_id","user_id");--> statement-breakpoint
CREATE INDEX "role_users_created_at_idx" ON "role_users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "role_users_updated_at_idx" ON "role_users" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_new_email_unique_idx" ON "users" USING btree ("new_email");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "otp_email_type_unique" ON "verification_tokens" USING btree ("email","type");--> statement-breakpoint
CREATE INDEX "verification_tokens_user_type_created_idx" ON "verification_tokens" USING btree ("user_id","type","created_at");--> statement-breakpoint
CREATE INDEX "verification_tokens_user_type_status_idx" ON "verification_tokens" USING btree ("user_id","type","status");--> statement-breakpoint
CREATE INDEX "verification_tokens_created_at_idx" ON "verification_tokens" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "verification_tokens_updated_at_idx" ON "verification_tokens" USING btree ("updated_at");