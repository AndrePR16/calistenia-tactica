const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

const { readDb, writeDb } = require("../db");
const { sendAccessEmail, isDevMode } = require("../utils/email");
const { generatePassword } = require("../utils/password");

const router = express.Router();

/**
 * US-27 — Simula la confirmación de pago (en producción esto lo dispararía
 * el webhook de Culqi, no el propio comprador). Crea el usuario, genera una
 * contraseña aleatoria y le envía por correo sus accesos.
 *
 * body: { email, leadId? }
 *   - leadId (opcional): si el usuario ya hizo el test de US-28 como visitante
 *     anónimo, se copia esa respuesta a su perfil para que no tenga que
 *     repetir el test al registrarse.
 *
 * TODO producción: reemplazar este endpoint por el webhook real de Culqi
 * (verificar firma del evento, leer el email desde el cargo confirmado en
 * vez de recibirlo del cliente) — ver README "De prueba local a producción".
 */
router.post("/", async (req, res) => {
  const { email, leadId } = req.body || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  const db = readDb();
  const existing = Object.values(db.users).find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
  }

  const userId = uuid();
  const plainPassword = generatePassword();
  const passwordHash = bcrypt.hashSync(plainPassword, 10);

  db.users[userId] = {
    id: userId,
    email,
    username: email,
    passwordHash,
    createdAt: new Date().toISOString(),
    productLevel: process.env.PRODUCT_LEVEL || "basico",
  };

  // Si venía de un lead con el test (US-28) ya resuelto, migramos ese perfil.
  let profileSeed = null;
  if (leadId && db.leads[leadId]) {
    profileSeed = db.leads[leadId];
    db.leads[leadId].converted = true;
  }
  if (profileSeed) {
    db.profiles[userId] = {
      ...profileSeed.answers,
      recommendation: profileSeed.recommendation,
      createdAt: new Date().toISOString(),
      fromLead: leadId,
    };
  }

  db.progress[userId] = { completedDays: [] };

  writeDb(db);

  const emailResult = await sendAccessEmail({
    to: email,
    username: email,
    password: plainPassword,
  });

  const response = {
    ok: true,
    hasProfile: Boolean(profileSeed),
    emailSent: emailResult.sent,
  };

  // Solo en desarrollo devolvemos la contraseña en la respuesta, para que
  // puedas probarte la app tú mismo sin tener que ir a revisar el archivo
  // de "correo simulado". En producción esto NUNCA se devuelve por API.
  if (isDevMode()) {
    response.devPassword = plainPassword;
    response.devEmailPreviewPath = emailResult.devPreviewPath;
  }

  res.status(201).json(response);
});

module.exports = router;
