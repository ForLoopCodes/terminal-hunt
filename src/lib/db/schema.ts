import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  bigint,
  integer,
  primaryKey,
  index,
  unique,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userTag: varchar("user_tag", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    bio: text("bio"),
    socialLinks: jsonb("social_links"),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    userType: varchar("user_type", { length: 20 })
      .notNull()
      .default("individual"), // individual, company, organization, open_source_project
    companyName: varchar("company_name", { length: 100 }),
    website: varchar("website", { length: 255 }),
    isVerified: boolean("is_verified").default(false), // For verified accounts
    githubUsername: varchar("github_username", { length: 100 }),
    twitterHandle: varchar("twitter_handle", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userTagIdx: index("idx_users_user_tag").on(table.userTag),
    emailIdx: index("idx_users_email").on(table.email),
  })
);

// Apps table
export const apps = pgTable(
  "apps",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    name: varchar("name", { length: 100 }).notNull(),
    shortDescription: varchar("short_description", { length: 200 }),
    description: text("description").notNull(),
    website: varchar("website", { length: 255 }),
    documentationUrl: varchar("documentation_url", { length: 255 }),
    asciiArt: text("ascii_art"), // Custom ASCII art for the app
    installCommands: text("install_commands").notNull(),
    repoUrl: varchar("repo_url", { length: 255 }).notNull(),
    viewCount: bigint("view_count", { mode: "number" }).default(0),
    isPublic: boolean("is_public").default(true), // Allow private apps
    isFeatured: boolean("is_featured").default(false), // For featured apps
    status: varchar("status", { length: 20 }).default("active"), // active, archived, under_review
    licenseType: varchar("license_type", { length: 50 }), // MIT, GPL, Apache, etc.
    stars: bigint("stars", { mode: "number" }).default(0), // GitHub stars sync
    lastUpdated: timestamp("last_updated"), // Last update from repo
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    creatorIdIdx: index("idx_apps_creator_id").on(table.creatorId),
    createdAtIdx: index("idx_apps_created_at").on(table.createdAt),
  })
);

// Votes table
export const votes = pgTable(
  "votes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userAppUnique: unique("unique_user_app_vote").on(table.userId, table.appId),
    userIdIdx: index("idx_votes_user_id").on(table.userId),
    appIdIdx: index("idx_votes_app_id").on(table.appId),
  })
);

// Comments table
export const comments = pgTable(
  "comments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_comments_user_id").on(table.userId),
    appIdIdx: index("idx_comments_app_id").on(table.appId),
  })
);

// Tags table
export const tags = pgTable("tags", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// App_Tags junction table
export const appTags = pgTable(
  "app_tags",
  {
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.appId, table.tagId] }),
  })
);

// Achievements table
export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description").notNull(),
    type: varchar("type", { length: 50 }).notNull(), // milestone, popularity, quality, community, special
    criteria: jsonb("criteria"), // JSON object defining achievement criteria
    iconUrl: varchar("icon_url", { length: 255 }),
    badgeColor: varchar("badge_color", { length: 20 }).default("#3b82f6"),
    isActive: boolean("is_active").default(true),
    awardedAt: timestamp("awarded_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    appIdIdx: index("idx_achievements_app_id").on(table.appId),
    typeIdx: index("idx_achievements_type").on(table.type),
    awardedAtIdx: index("idx_achievements_awarded_at").on(table.awardedAt),
  })
);

// View_Logs table
export const viewLogs = pgTable(
  "view_logs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").defaultNow(),
  },
  (table) => ({
    appIdIdx: index("idx_view_logs_app_id").on(table.appId),
    viewedAtIdx: index("idx_view_logs_viewed_at").on(table.viewedAt),
  })
);

// Collections table (user's bookmark folders)
export const collections = pgTable(
  "collections",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false),
    color: varchar("color", { length: 20 }).default("#3b82f6"), // Hex color for folder
    sortOrder: integer("sort_order").default(0), // For user-defined ordering
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_collections_user_id").on(table.userId),
    userNameUnique: unique("unique_user_collection_name").on(
      table.userId,
      table.name
    ),
  })
);

// Collection_Apps junction table (apps in collections)
export const collectionApps = pgTable(
  "collection_apps",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0), // For ordering within collection
    addedAt: timestamp("added_at").defaultNow(),
    notes: text("notes"), // User notes about why they bookmarked this app
  },
  (table) => ({
    collectionAppUnique: unique("unique_collection_app").on(
      table.collectionId,
      table.appId
    ),
    collectionIdIdx: index("idx_collection_apps_collection_id").on(
      table.collectionId
    ),
    appIdIdx: index("idx_collection_apps_app_id").on(table.appId),
  })
);
