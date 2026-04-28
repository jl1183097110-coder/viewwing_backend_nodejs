import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }

  return true;
}

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, ".env"));
  loadEnvFile(path.join(cwd, ".env.production"));
}

ensureDatabaseUrl();

const { pool } = await import("../drizzle.js");

const checkDatabaseConnection = async () => {
  try {
    const result = await pool.query<{
      now: string;
      current_database: string;
      current_user: string;
    }>(`
      select
        now() as now,
        current_database() as current_database,
        current_user as current_user
    `);

    const row = result.rows[0];
    if (!row) {
      throw new Error("Database connection succeeded but returned no rows");
    }

    console.log("Database connection successful");
    console.log(`Database: ${row.current_database}`);
    console.log(`User: ${row.current_user}`);
    console.log(`Time: ${row.now}`);
  } finally {
    await pool.end();
  }
};

checkDatabaseConnection().catch((error: unknown) => {
  if (error instanceof Error && error.message) {
    console.error(`Database connection failed: ${error.message}`);
  } else {
    console.error("Database connection failed:", error);
  }
  process.exitCode = 1;
});
