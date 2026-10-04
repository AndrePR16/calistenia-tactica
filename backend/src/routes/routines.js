const express = require("express");
const fs = require("fs");
const path = require("path");
const { readDb, writeDb } = require("../db");

const exercises = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "exercises.json"), "utf-8")
);
const routines = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "routines.json"), "utf-8")
);

const exercisesById = Object.fromEntries(exercises.map((e) => [e.id, e]));

// Etiqueta visual del "tipo" de día (Fuerza / Mixto / HIIT / Recuperación),
// calculada a partir de los grupos musculares reales del catálogo — no es un
// campo nuevo que haya que mantener a mano en routines.json. La mayoría de
// los días tienen 1 solo ejercicio "cardio" como cierre (no cambia el
// carácter del día, sigue siendo Fuerza); con 2 ya es Mixto; con 3 o más es
// un circuito de HIIT.
function computeDayType(routine) {
  if (routine.is_recovery_day) return "Recuperación";
  const cardioCount = routine.exercises.filter((item) => {
    const ex = exercisesById[item.exercise_id];
    return ex && ex.muscle_groups.includes("cardio");
  }).length;
  if (cardioCount >= 3) return "HIIT";
  if (cardioCount >= 2) return "Mixto";
  return "Fuerza";
}

function buildRouter(authMiddleware) {
  const router = express.Router();

  function getProgress(db, userId) {
    return db.progress[userId] || { completedDays: [] };
  }

  function unlockedMax(progress) {
    if (!progress.completedDays.length) return 1;
    // El tope es routines.length (no un número fijo) para que la duración
    // del programa se controle solo desde generate-data.js.
    return Math.min(Math.max(...progress.completedDays) + 1, routines.length);
  }

  // Lista de todos los días con su estado (bloqueado / disponible / completado),
  // para pintar el dashboard.
  router.get("/", authMiddleware, (req, res) => {
    const db = readDb();
    const progress = getProgress(db, req.userId);
    const max = unlockedMax(progress);

    const days = routines.map((r) => ({
      day: r.day,
      title: r.title,
      is_recovery_day: r.is_recovery_day,
      tipo: computeDayType(r),
      exercise_count: r.exercises.length,
      status: progress.completedDays.includes(r.day)
        ? "completado"
        : r.day <= max
        ? "disponible"
        : "bloqueado",
    }));

    res.json({ days });
  });

  // Detalle de un día: ejercicios con su información completa del catálogo
  // (incluida la variación sin equipo si aplica).
  router.get("/:day", authMiddleware, (req, res) => {
    const day = Number(req.params.day);
    const routine = routines.find((r) => r.day === day);
    if (!routine) return res.status(404).json({ error: "Día no encontrado" });

    const db = readDb();
    const progress = getProgress(db, req.userId);
    const max = unlockedMax(progress);
    if (day > max) {
      return res.status(403).json({ error: "Este día todavía está bloqueado" });
    }

    const exercisesResolved = routine.exercises.map((item) => {
      const ex = exercisesById[item.exercise_id];
      const variation = ex.no_equipment_variation_id
        ? exercisesById[ex.no_equipment_variation_id]
        : null;
      return { ...item, exercise: ex, variation };
    });

    res.json({
      ...routine,
      tipo: computeDayType(routine),
      exercises: exercisesResolved,
      already_completed: progress.completedDays.includes(day),
    });
  });

  // US-12 — Finalizar rutina del día, desbloquea el siguiente.
  router.post("/:day/complete", authMiddleware, (req, res) => {
    const day = Number(req.params.day);
    if (!routines.find((r) => r.day === day)) {
      return res.status(404).json({ error: "Día no encontrado" });
    }

    const db = readDb();
    const progress = getProgress(db, req.userId);
    if (!progress.completedDays.includes(day)) {
      progress.completedDays.push(day);
    }
    db.progress[req.userId] = progress;
    writeDb(db);

    res.json({
      ok: true,
      completedDays: progress.completedDays,
      unlockedMax: unlockedMax(progress),
    });
  });

  return router;
}

module.exports = buildRouter;
