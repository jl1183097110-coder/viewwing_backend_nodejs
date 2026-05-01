import { ensureRuntimeEnv } from "./lib/runtimeEnv.js";

ensureRuntimeEnv();

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
