import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Experiments table
export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'electric-circuits', 'free-fall', 'projectile-motion'
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  instructions: text("instructions").notNull(),
  theory: text("theory").notNull(),
  requiredTools: text("required_tools").array()
});

// Tools table
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  iconUrl: text("icon_url").notNull(),
  experimentId: integer("experiment_id").notNull(),
  properties: jsonb("properties")
});

// Insert schemas
export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true
});

// Types
export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = z.infer<typeof insertExperimentSchema>;

export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;

// Connection interface for components
export interface ConnectionPoint {
  id: string;
  type: string; // 'input', 'output', 'bidirectional'
  x: number;
  y: number;
  toolId: number;
  connected: boolean;
}

export interface Connection {
  id: string;
  sourceId: string; // ID of source connection point
  targetId: string; // ID of target connection point
  sourceTool: number; // ID of source tool
  targetTool: number; // ID of target tool
}

// Simulation Result type
export interface Measurement {
  label: string;
  value: string;
  unit: string;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface SimulationResult {
  measurements: Measurement[];
  graphTitle?: string;
  graphData?: GraphPoint[];
}

// User type (for future authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
