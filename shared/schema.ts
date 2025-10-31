import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(1000),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'deposit', 'withdraw', 'bet', 'win'
  amount: integer("amount").notNull(),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyCheckIns = pgTable("daily_check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  weekStartDate: text("week_start_date").notNull(), // ISO date string for the Monday of this week
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
});

export const spinHistory = pgTable("spin_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  prize: integer("prize").notNull(),
  spunAt: timestamp("spun_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const upgradeDemoSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertDailyCheckInSchema = createInsertSchema(dailyCheckIns).omit({
  id: true,
  claimedAt: true,
});

export const insertSpinHistorySchema = createInsertSchema(spinHistory).omit({
  id: true,
  spunAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type InsertDailyCheckIn = z.infer<typeof insertDailyCheckInSchema>;
export type SpinHistory = typeof spinHistory.$inferSelect;
export type InsertSpinHistory = z.infer<typeof insertSpinHistorySchema>;
