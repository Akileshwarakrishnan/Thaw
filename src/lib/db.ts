import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function resolveDatabaseUrl(): string {
  // If custom DATABASE_URL explicitly provided (e.g., external Postgres or custom path)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dev.db")) {
    return process.env.DATABASE_URL;
  }

  // On Vercel serverless environment, copy SQLite file to writable /tmp
  if (process.env.VERCEL) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      }
      const tmpUrl = `file:${tmpDbPath}`;
      process.env.DATABASE_URL = tmpUrl;
      return tmpUrl;
    } catch (err) {
      console.warn("Could not copy sqlite db to /tmp:", err);
    }
  }

  const defaultUrl = process.env.DATABASE_URL || "file:./dev.db";
  process.env.DATABASE_URL = defaultUrl;
  return defaultUrl;
}

const activeDbUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
