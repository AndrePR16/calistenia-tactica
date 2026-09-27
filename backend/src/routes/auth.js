const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { readDb } = require("../db");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const db = readDb();
  const user = Object.values(db.users).find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password || "", user.passwordHash)) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }
  const token = signToken(user.id);
  const hasProfile = Boolean(db.profiles[user.id]);
  res.json({ token, hasProfile });
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Falta autenticación" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { router, authMiddleware };
