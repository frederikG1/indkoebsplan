import db from "./connection.ts";

const deleteMode = process.argv.includes("--delete");

if (deleteMode) {
  db.exec(`DROP TABLE IF EXISTS list_item`);
  db.exec(`DROP TABLE IF EXISTS offer`);
  db.exec(`DROP TABLE IF EXISTS product`);
  db.exec(`DROP TABLE IF EXISTS category`);
  db.exec(`DROP TABLE IF EXISTS store`);
  db.exec(`DROP TABLE IF EXISTS chain`);
  db.exec(`DROP TABLE IF EXISTS user`);
}

db.exec(`CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
    )`);

db.exec(`CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    gtin TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    quantity REAL,
    unit TEXT
    )`);

db.exec(`CREATE TABLE IF NOT EXISTS chain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
    )`);

db.exec(`CREATE TABLE IF NOT EXISTS store (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain_id INTEGER NOT NULL REFERENCES chain(id) ON DELETE CASCADE,
    external_id TEXT,
    name TEXT NOT NULL,
    address TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    UNIQUE (chain_id, external_id)
    )`);

db.exec(`CREATE TABLE IF NOT EXISTS offer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain_id INTEGER NOT NULL REFERENCES chain(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES store(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    price_cents INTEGER NOT NULL,
    before_price_cents INTEGER,
    valid_from TEXT NOT NULL,
    valid_to TEXT NOT NULL
    )`);

db.exec(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
    )`);

db.exec(`CREATE TABLE IF NOT EXISTS list_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    required_brand TEXT,
    quantity INTEGER NOT NULL DEFAULT 1
    )`);

console.log("DB Setup complete");
