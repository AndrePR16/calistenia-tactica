const express = require("express");
const { v4: uuid } = require("uuid");
const { readDb, writeDb } = require("../db");
const {
  recomendar,
  SILUETA_OPCIONES,
  OBJETIVO_OPCIONES,
  EXPERIENCIA_OPCIONES,
  TIPO_OPERADOR_OPCIONES,
  TIPO_OPERADOR_INFO,
} = require("../utils/recommendation");

const router = express.Router();

function buildRouter(authMiddleware) {
  // Opciones para que el frontend arme el formulario sin hardcodear listas.
  router.get("/onboarding-options", (req, res) => {
    res.json({
      objetivo: OBJETIVO_OPCIONES,
      experiencia: EXPERIENCIA_OPCIONES,
      silueta: SILUETA_OPCIONES,
      tipo_operador: TIPO_OPERADOR_OPCIONES,
      tipo_operador_info: TIPO_OPERADOR_INFO,
    });
  });

  function validateAnswers(body) {
    const { nombre, peso, estatura, objetivo, experiencia, silueta, tipo_operador } = body || {};
    if (!nombre || !nombre.trim()) return "El nombre es obligatorio";
    if (!peso || !estatura) return "Peso y estatura son obligatorios";
    if (!OBJETIVO_OPCIONES.includes(objetivo)) return "Objetivo inválido";
    if (!EXPERIENCIA_OPCIONES.includes(experiencia)) return "Experiencia inválida";
    if (silueta && !SILUETA_OPCIONES.includes(silueta)) return "Silueta inválida";
    if (!TIPO_OPERADOR_OPCIONES.includes(tipo_operador)) return "Clasificación de operador inválida";
    return null;
  }

  /**
   * US-28 — Test anónimo para visitantes que llegan desde publicidad
   * (TikTok/IG/Facebook). No requiere cuenta: responde el test y recibe su
   * recomendación antes de ver el precio. Sus respuestas quedan como "lead"
   * para poder recontactarlo si no compra.
   */
  router.post("/lead-test", (req, res) => {
    const error = validateAnswers(req.body);
    if (error) return res.status(400).json({ error });

    const { nombre, peso, estatura, edad, peso_objetivo, objetivo, experiencia, silueta, tipo_operador, utm_source } = req.body;
    const recommendation = recomendar({ objetivo, experiencia });

    const db = readDb();
    const leadId = uuid();
    db.leads[leadId] = {
      id: leadId,
      answers: { nombre, peso, estatura, edad, peso_objetivo, objetivo, experiencia, silueta, tipo_operador },
      utm_source: utm_source || null,
      recommendation,
      createdAt: new Date().toISOString(),
      converted: false,
    };
    writeDb(db);

    res.status(201).json({ leadId, recommendation });
  });

  /**
   * US-02 a US-06 — Perfil físico + objetivo + experiencia para un usuario
   * ya registrado (compró sin pasar por el test de anuncio, o quiere
   * corregir sus datos).
   */
  router.post("/profile", authMiddleware, (req, res) => {
    const error = validateAnswers(req.body);
    if (error) return res.status(400).json({ error });

    const { nombre, peso, estatura, edad, peso_objetivo, objetivo, experiencia, silueta, tipo_operador } = req.body;
    const recommendation = recomendar({ objetivo, experiencia });

    const db = readDb();
    db.profiles[req.userId] = {
      nombre, peso, estatura, edad, peso_objetivo, objetivo, experiencia, silueta, tipo_operador,
      recommendation,
      createdAt: new Date().toISOString(),
    };
    writeDb(db);

    res.json({ profile: db.profiles[req.userId] });
  });

  router.get("/profile", authMiddleware, (req, res) => {
    const db = readDb();
    const profile = db.profiles[req.userId] || null;
    res.json({ profile });
  });

  return router;
}

module.exports = buildRouter;
