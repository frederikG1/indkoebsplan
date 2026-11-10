import "dotenv/config";
import bcrypt from "bcrypt";
import db from "./connection.ts";

const email = process.env.SEED_USER_EMAIL;
const password = process.env.SEED_USER_PASSWORD;

if (!email || !password) {
  throw new Error("SEED_USER_EMAIL og SEED_USER_PASSWORD skal stå i .env");
}

const passwordHash = await bcrypt.hash(password, 12);

db.prepare(
  `
    INSERT OR IGNORE INTO user (username, email, password_hash) VALUES (?, ?, ?)`,
).run("dummy", email, passwordHash);

console.log("Seed complete");
