import { defineConfig } from "prisma/config";

const url = process.env["DATABASE_URL"] || process.env["POSTGRES_URL"] || "";

if (!url) {
  console.error("DATABASE_URL is not set. Add a PostgreSQL plugin or set it manually in Railway.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"] || undefined,
  },
});
