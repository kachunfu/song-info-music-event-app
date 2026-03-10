ALTER TABLE "users" ADD COLUMN "username" text;
--> statement-breakpoint
UPDATE "users" SET "username" = "email" WHERE "username" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"addressee_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"creator_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_song_members" (
	"shared_song_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shared_song_members_shared_song_id_user_id_pk" PRIMARY KEY("shared_song_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lyrics_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"shared_song_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lyrics_post_favorites" (
	"lyrics_post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lyrics_post_favorites_lyrics_post_id_user_id_pk" PRIMARY KEY("lyrics_post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lyrics_post_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lyrics_post_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_songs" ADD CONSTRAINT "shared_songs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_song_members" ADD CONSTRAINT "shared_song_members_shared_song_id_shared_songs_id_fk" FOREIGN KEY ("shared_song_id") REFERENCES "shared_songs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_song_members" ADD CONSTRAINT "shared_song_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lyrics_posts" ADD CONSTRAINT "lyrics_posts_shared_song_id_shared_songs_id_fk" FOREIGN KEY ("shared_song_id") REFERENCES "shared_songs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lyrics_posts" ADD CONSTRAINT "lyrics_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lyrics_post_favorites" ADD CONSTRAINT "lyrics_post_favorites_lyrics_post_id_lyrics_posts_id_fk" FOREIGN KEY ("lyrics_post_id") REFERENCES "lyrics_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lyrics_post_favorites" ADD CONSTRAINT "lyrics_post_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lyrics_post_comments" ADD CONSTRAINT "lyrics_post_comments_lyrics_post_id_lyrics_posts_id_fk" FOREIGN KEY ("lyrics_post_id") REFERENCES "lyrics_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lyrics_post_comments" ADD CONSTRAINT "lyrics_post_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
