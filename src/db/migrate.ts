import { readFile } from "fs/promises";
import { pool } from "./connection";

async function migrate() {
  const sql = await readFile(
    new URL("../migrations/001_create_emails.sql", import.meta.url),
    "utf-8"
  );

  await pool.query(sql);

  console.log("Migration completed successfully.");

  await pool.end();
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});