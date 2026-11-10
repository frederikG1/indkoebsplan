import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("src/database/data.db");
db.exec("PRAGMA foreign_keys = ON");

export default db;
