import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "operator"] }).notNull().default("operator"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Teams Model
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(), 
  name: text("name").notNull(),
  matchType: text("match_type", { enum: ["teamVsTeam", "dominationDeathmatch"] }).notNull(),
  photoUrl: text("photo_url"),
  players: jsonb("players").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  matchType: true,
  photoUrl: true,
  players: true,
});

// Videos Model
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  size: text("size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  name: true,
  url: true,
  size: true,
});

// Offers Model
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  title: true,
  description: true,
  active: true,
});

// Phrases Model
export const phrases = pgTable("phrases", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPhraseSchema = createInsertSchema(phrases).pick({
  text: true,
  active: true,
});

// Config Model
export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  logoUrl: text("logo_url"),
  waitingListDisplayTime: integer("waiting_list_display_time").notNull().default(5),
  showPopupOffers: boolean("show_popup_offers").notNull().default(true),
  showMotivationalPhrases: boolean("show_motivational_phrases").notNull().default(true),
  popupDisplayDuration: integer("popup_display_duration").notNull().default(10),
  displayAppEnabled: boolean("display_app_enabled").notNull().default(true),
});

export const insertConfigSchema = createInsertSchema(configs).pick({
  logoUrl: true,
  waitingListDisplayTime: true,
  showPopupOffers: true,
  showMotivationalPhrases: true,
  popupDisplayDuration: true,
  displayAppEnabled: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Phrase = typeof phrases.$inferSelect;
export type InsertPhrase = z.infer<typeof insertPhraseSchema>;

export type Config = typeof configs.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
