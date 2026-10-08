const express = require("express");
const fs = require("fs");
const path = require("path");
const { readDb, writeDb } = require("../db");
const { programKey, NIVEL_INFO } = require("../utils/recommendation");

const exercises = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "exercises.json"), "utf-8")
);
// programs.json trae un programa de 21 días por cada combinación nivel x
// objetivo (ver data/generate-data.js). Cada usuario recibe el que le
// corresponde según su perfil.
const programs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "programs.json"), "utf-8")
);
const DEFAULT_PROGRAM_KEY = "base__fuerza"; // usuario sin perfil guardado todavía

const exercisesById = Object.fromEntries(exercises.map((e) => [e.id, e]));

// Etiqueta visual del "tipo" de día (Fuerza / Mixto / HIIT / Recuperación),
// calculada a partir de los grupos musculares reales del catálogo — no es un
// campo nuevo que haya que mantener a mano en routines.json. La mayoría de
// los días tienen 1 solo ejercicio "cardio" como cierre (no cambia el
// carácter del día, sigue siendo Fuerza); con 2 ya es Mixto; con 3 o más es
// un circuito de HIIT.
// ¿El día incluye algún ejercicio de barra? Se le avisa al usuario para que
// sepa que le toca un día de barra (parque) — cada uno trae su alternativa
// sin equipo.
function dayNeedsBar(routine) {
  return routine.exercises.some((item) => {
    const ex = exercisesById[item.exercise_id];
    return ex && ex.equipment_needed.includes("barra");
  });
}

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

  // Programa del usuario: nivel (por experiencia) x objetivo, tomados de su
  // perfil. Si todavía no tiene perfil, arranca en el programa Base.
  function getProgram(db, userId) {
    const profile = db.profiles[userId];
    const key = profile ? programKey(profile) : DEFAULT_PROGRAM_KEY;
    const program = programs[key] || programs[DEFAULT_PROGRAM_KEY];
    return { key, nivel: program.nivel, objetivo: program.objetivo, routines: program.routines };
  }

  function unlockedMax(progress, routines) {
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
    const program = getProgram(db, req.userId);
    const routines = program.routines;
    const max = unlockedMax(progress, routines);

    const days = routines.map((r) => ({
      day: r.day,
      title: r.title,
      is_recovery_day: r.is_recovery_day,
      tipo: computeDayType(r),
      needs_bar: dayNeedsBar(r),
      exercise_count: r.exercises.length,
      status: progress.completedDays.includes(r.day)
        ? "completado"
        : r.day <= max
        ? "disponible"
        : "bloqueado",
    }));

    res.json({
      days,
      program: {
        nivel: program.nivel,
        nivel_label: NIVEL_INFO[program.nivel].label,
        objetivo: program.objetivo,
      },
    });
  });

  // Detalle de un día: ejercicios con su información completa del catálogo
  // (incluida la variación sin equipo si aplica).
  router.get("/:day", authMiddleware, (req, res) => {
    const day = Number(req.params.day);
    const db = readDb();
    const { routines } = getProgram(db, req.userId);
    const routine = routines.find((r) => r.day === day);
    if (!routine) return res.status(404).json({ error: "Día no encontrado" });

    const progress = getProgress(db, req.userId);
    const max = unlockedMax(progress, routines);
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
      needs_bar: dayNeedsBar(routine),
      exercises: exercisesResolved,
      already_completed: progress.completedDays.includes(day),
    });
  });

  // US-12 — Finalizar rutina del día, desbloquea el siguiente.
  router.post("/:day/complete", authMiddleware, (req, res) => {
    const day = Number(req.params.day);
    const db = readDb();
    const { routines } = getProgram(db, req.userId);
    if (!routines.find((r) => r.day === day)) {
      return res.status(404).json({ error: "Día no encontrado" });
    }

    const progress = getProgress(db, req.userId);
    if (!progress.completedDays.includes(day)) {
      progress.completedDays.push(day);
    }
    db.progress[req.userId] = progress;
    writeDb(db);

    res.json({
      ok: true,
      completedDays: progress.completedDays,
      unlockedMax: unlockedMax(progress, routines),
    });
  });

  return router;
}

module.exports = buildRouter;
