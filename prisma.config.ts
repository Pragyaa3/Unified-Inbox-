import { defineConfig, env } from "@prisma/config";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Throw a clear error if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

// Export Prisma config
export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
