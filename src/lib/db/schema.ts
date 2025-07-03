import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  bigint,
  primaryKey,
  index,
  unique,
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
    description: text("description").notNull(),
    installCommands: text("install_commands").notNull(),
    repoUrl: varchar("repo_url", { length: 255 }).notNull(),
    viewCount: bigint("view_count", { mode: "number" }).default(0),
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
    type: varchar("type", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
    awardedAt: timestamp("awarded_at").defaultNow(),
  },
  (table) => ({
    appIdIdx: index("idx_achievements_app_id").on(table.appId),
    typeIdx: index("idx_achievements_type").on(table.type),
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
