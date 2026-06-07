import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from workspace root if not already defined
if (!process.env.DATABASE_URL) {
  const rootEnvPath = path.resolve(process.cwd(), "../../.env");
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  } else {
    dotenv.config();
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: [
    "users",
    "trips",
    "attendance",
    "payouts",
    "assignments",
    "guide_work_days",
    "guide_day_reports",
    "guide_expenses",
    "traveler_attendance",
    "trip_status_updates",
    "guide_trip_updates",
    "guide_checkin_points",
    "guide_hotel_updates",
    "guide_food_updates",
    "guide_group_photos",
    "guide_movement_updates",
    "guide_food_preference_audits"
  ]
});
