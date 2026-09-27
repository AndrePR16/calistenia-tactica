// Almacén simple basado en un archivo JSON. Suficiente para desarrollo local
// y para que pruebes la app en tu persona. Para producción, migrar esto a
// Postgres/MySQL es directo porque el "shape" de los datos ya está definido
// aquí (users / profiles / progress / leads).
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data-store", "db.json");

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    const empty = { users: {}, profiles: {}, progress: {}, leads: {} };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

module.exports = { readDb, writeDb };
