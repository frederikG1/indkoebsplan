import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

const db = new DatabaseSync(join(import.meta.dirname, "data.db"));
db.exec("PRAGMA foreign_keys = ON");

export default db;
