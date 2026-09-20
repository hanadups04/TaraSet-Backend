// src/scripts/test-db.ts
import { pool } from "../config/db";

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connected! Server time:", result.rows[0].now);

    // Confirm you can actually see your existing data
    const items = await pool.query(
      "SELECT * FROM circles_tbl ORDER BY circle_id",
    );
    console.log("Sample rows:", items.rows);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await pool.end();
  }
}

testConnection();