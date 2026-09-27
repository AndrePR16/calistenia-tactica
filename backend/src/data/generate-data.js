// Genera exercises.json y routines.json (catálogo + plan de 30 días, Nivel 1 - Básico)
// Ejecutar una sola vez: node src/data/generate-data.js
const fs = require("fs");
const path = require("path");

const exercises = [
  { id: "flexiones_pared", name: "Flexiones en pared", muscle_groups: ["pecho", "triceps"], equipment_needed: [], difficulty: "principiante", instructions: "De pie frente a una pared, manos a la altura del pecho. Flexiona los codos acercando el pecho a la pared y empuja.", video_url: "https://example.com/videos/flexiones_pared.mp4", no_equipment_variation_id: null },
  { id: "flexiones_rodillas", name: "Flexiones con rodillas apoyadas", muscle_groups: ["pecho", "triceps"], equipment_needed: [], difficulty: "principiante", instructions: "Igual que la flexión estándar pero con rodillas en el suelo, para reducir la carga mientras se gana fuerza.", video_url: "https://example.com/videos/flexiones_rodillas.mp4", no_equipment_variation_id: null },
  { id: "flexiones", name: "Flexiones de pecho", muscle_groups: ["pecho", "triceps", "hombro"], equipment_needed: [], difficulty: "principiante", instructions: "Manos a la altura de los hombros, cuerpo recto de cabeza a talones, baja el pecho casi hasta el suelo y empuja.", video_url: "https://example.com/videos/flexiones.mp4", no_equipment_variation_id: null },
  { id: "flexiones_diamante", name: "Flexiones diamante", muscle_groups: ["triceps", "pecho"], equipment_needed: [], difficulty: "intermedio", instructions: "Manos juntas bajo el pecho formando un diamante. Baja controlado.", video_url: "https://example.com/videos/flexiones_diamante.mp4", no_equipment_variation_id: null },
  { id: "flexiones_pica", name: "Flexiones pica (pike push-up)", muscle_groups: ["hombro", "triceps"], equipment_needed: [], difficulty: "intermedio", instructions: "Cadera elevada en V invertida, baja la cabeza hacia el suelo y empuja.", video_url: "https://example.com/videos/flexiones_pica.mp4", no_equipment_variation_id: null },
  { id: "sentadillas", name: "Sentadillas (squat)", muscle_groups: ["cuadriceps", "gluteos"], equipment_needed: [], difficulty: "principiante", instructions: "Pies al ancho de hombros, baja como si te sentaras, pecho arriba, rodillas alineadas con los pies.", video_url: "https://example.com/videos/sentadillas.mp4", no_equipment_variation_id: null },
  { id: "sentadilla_sumo", name: "Sentadilla sumo", muscle_groups: ["cuadriceps", "gluteos", "aductores"], equipment_needed: [], difficulty: "principiante", instructions: "Pies bien separados, puntas hacia afuera, baja en sentadilla manteniendo la espalda recta.", video_url: "https://example.com/videos/sentadilla_sumo.mp4", no_equipment_variation_id: null },
  { id: "sentadilla_salto", name: "Sentadilla con salto", muscle_groups: ["cuadriceps", "gluteos", "cardio"], equipment_needed: [], difficulty: "intermedio", instructions: "Baja en sentadilla y explota hacia arriba en un salto, aterriza suave.", video_url: "https://example.com/videos/sentadilla_salto.mp4", no_equipment_variation_id: null },
  { id: "zancadas", name: "Zancadas (lunges)", muscle_groups: ["cuadriceps", "gluteos"], equipment_needed: [], difficulty: "principiante", instructions: "Da un paso largo al frente, baja la rodilla trasera casi al suelo y vuelve. Alterna piernas.", video_url: "https://example.com/videos/zancadas.mp4", no_equipment_variation_id: null },
  { id: "zancada_lateral", name: "Zancada lateral", muscle_groups: ["cuadriceps", "gluteos", "aductores"], equipment_needed: [], difficulty: "principiante", instructions: "Da un paso amplio hacia el lado, flexiona esa rodilla y vuelve al centro.", video_url: "https://example.com/videos/zancada_lateral.mp4", no_equipment_variation_id: null },
  { id: "sentadilla_bulgara", name: "Sentadilla búlgara", muscle_groups: ["cuadriceps", "gluteos"], equipment_needed: ["silla_o_banco"], difficulty: "intermedio", instructions: "Pie trasero apoyado en una silla o banco, baja en sentadilla con la pierna delantera.", video_url: "https://example.com/videos/sentadilla_bulgara.mp4", no_equipment_variation_id: "zancadas" },
  { id: "plancha", name: "Plancha abdominal (plank)", muscle_groups: ["core"], equipment_needed: [], difficulty: "principiante", instructions: "Antebrazos y puntas de los pies en el suelo, cuerpo en línea recta, aprieta el abdomen.", video_url: "https://example.com/videos/plancha.mp4", no_equipment_variation_id: null },
  { id: "plancha_lateral", name: "Plancha lateral", muscle_groups: ["core", "oblicuos"], equipment_needed: [], difficulty: "intermedio", instructions: "Apoyo en un antebrazo, cuerpo de lado en línea recta, cadera arriba sin caer.", video_url: "https://example.com/videos/plancha_lateral.mp4", no_equipment_variation_id: null },
  { id: "plancha_toques_hombro", name: "Plancha con toques de hombro", muscle_groups: ["core", "hombro"], equipment_needed: [], difficulty: "intermedio", instructions: "En plancha alta, toca el hombro contrario con cada mano alternando, sin mover la cadera.", video_url: "https://example.com/videos/plancha_toques_hombro.mp4", no_equipment_variation_id: null },
  { id: "abdominales_bicicleta", name: "Abdominales bicicleta", muscle_groups: ["core", "oblicuos"], equipment_needed: [], difficulty: "principiante", instructions: "Acostado boca arriba, lleva codo contrario a rodilla contraria en un pedaleo controlado.", video_url: "https://example.com/videos/abdominales_bicicleta.mp4", no_equipment_variation_id: null },
  { id: "elevacion_piernas_acostado", name: "Elevación de piernas acostado", muscle_groups: ["core", "abdomen_bajo"], equipment_needed: [], difficulty: "intermedio", instructions: "Acostado boca arriba, piernas rectas, sube y baja sin despegar la zona lumbar.", video_url: "https://example.com/videos/elevacion_piernas_acostado.mp4", no_equipment_variation_id: null },
  { id: "superman", name: "Superman", muscle_groups: ["espalda_baja", "gluteos"], equipment_needed: [], difficulty: "principiante", instructions: "Boca abajo, eleva brazos y piernas al mismo tiempo, sostén y baja controlado.", video_url: "https://example.com/videos/superman.mp4", no_equipment_variation_id: null },
  { id: "puente_gluteo", name: "Puente de glúteos", muscle_groups: ["gluteos", "isquiotibiales"], equipment_needed: [], difficulty: "principiante", instructions: "Acostado, rodillas flexionadas, eleva la cadera apretando glúteos y baja sin tocar el suelo.", video_url: "https://example.com/videos/puente_gluteo.mp4", no_equipment_variation_id: null },
  { id: "burpees", name: "Burpees", muscle_groups: ["full_body", "cardio"], equipment_needed: [], difficulty: "intermedio", instructions: "De pie, baja a sentadilla, apoya manos, salta pies atrás a plancha, flexión, vuelve y salta arriba.", video_url: "https://example.com/videos/burpees.mp4", no_equipment_variation_id: null },
  { id: "escaladores", name: "Escaladores (mountain climbers)", muscle_groups: ["core", "cardio"], equipment_needed: [], difficulty: "principiante", instructions: "En plancha alta, lleva rodillas al pecho alternando rápido.", video_url: "https://example.com/videos/escaladores.mp4", no_equipment_variation_id: null },
  { id: "rodillas_altas", name: "Rodillas altas (high knees)", muscle_groups: ["cardio", "piernas"], equipment_needed: [], difficulty: "principiante", instructions: "Trota en el sitio llevando las rodillas a la altura de la cadera lo más rápido posible.", video_url: "https://example.com/videos/rodillas_altas.mp4", no_equipment_variation_id: null },
  { id: "salto_tijera", name: "Salto de tijera (jumping jacks)", muscle_groups: ["cardio", "full_body"], equipment_needed: [], difficulty: "principiante", instructions: "Salta separando piernas y brazos hacia afuera, vuelve a la posición inicial en el mismo salto.", video_url: "https://example.com/videos/salto_tijera.mp4", no_equipment_variation_id: null },
  { id: "dominadas", name: "Dominadas (pull-ups)", muscle_groups: ["espalda", "biceps"], equipment_needed: ["barra"], difficulty: "avanzado", instructions: "Cuelga de la barra con agarre prono, sube hasta que la barbilla pase la barra, baja controlado.", video_url: "https://example.com/videos/dominadas.mp4", no_equipment_variation_id: "remo_invertido_mesa" },
  { id: "remo_invertido_mesa", name: "Remo invertido bajo mesa (sin barra)", muscle_groups: ["espalda", "biceps"], equipment_needed: ["mesa_resistente"], difficulty: "principiante", instructions: "Acostado bajo una mesa firme, sujeta el borde y tira del pecho hacia la mesa.", video_url: "https://example.com/videos/remo_invertido_mesa.mp4", no_equipment_variation_id: null },
  { id: "elevacion_piernas_colgado", name: "Elevación de piernas colgado de la barra", muscle_groups: ["core", "abdomen_bajo"], equipment_needed: ["barra"], difficulty: "avanzado", instructions: "Colgado de la barra, sube las piernas rectas o con rodillas flexionadas sin balancear.", video_url: "https://example.com/videos/elevacion_piernas_colgado.mp4", no_equipment_variation_id: "elevacion_piernas_acostado" },
  { id: "fondos_banco", name: "Fondos de tríceps en banco/silla", muscle_groups: ["triceps", "hombro"], equipment_needed: ["silla_o_banco"], difficulty: "intermedio", instructions: "Manos en el borde de una silla, piernas extendidas, baja el cuerpo doblando los codos y empuja.", video_url: "https://example.com/videos/fondos_banco.mp4", no_equipment_variation_id: "flexiones_diamante" },
];

const motivational_messages = [
  "El único entrenamiento malo es el que no hiciste. ¡Hoy suma!",
  "No necesitas gimnasio, necesitas disciplina. Vamos.",
  "Cada repetición te acerca a la versión más fuerte de ti.",
  "El cuerpo logra lo que la mente cree posible.",
  "Hoy no se trata de ser perfecto, se trata de no rendirte.",
  "La constancia vence al talento cuando el talento no entrena.",
  "Un día más, un paso más cerca de tu objetivo.",
  "Nadie dijo que sería fácil, dijeron que valdría la pena.",
  "Tu único rival es quien fuiste ayer.",
  "El dolor de hoy es la fuerza de mañana.",
];

const semanas = {
  1: [
    [["flexiones_pared", 3, "10", 30], ["sentadillas", 3, "12", 45], ["plancha", 3, "20s", 30], ["puente_gluteo", 3, "12", 30], ["rodillas_altas", 3, "20s", 30]],
    [["zancadas", 3, "10", 45], ["sentadilla_sumo", 3, "12", 45], ["plancha_lateral", 2, "15s", 30], ["abdominales_bicicleta", 3, "15", 30], ["salto_tijera", 3, "20", 30]],
    [["flexiones_rodillas", 3, "8", 45], ["sentadillas", 3, "12", 45], ["superman", 3, "12", 30], ["rodillas_altas", 3, "20s", 30], ["plancha", 3, "20s", 30]],
    [["flexiones_pared", 3, "12", 30], ["puente_gluteo", 3, "15", 30], ["zancada_lateral", 3, "10", 45], ["abdominales_bicicleta", 3, "15", 30], ["salto_tijera", 3, "20", 30]],
    [["sentadilla_sumo", 3, "12", 45], ["zancadas", 3, "10", 45], ["plancha", 3, "25s", 30], ["superman", 3, "12", 30], ["rodillas_altas", 3, "20s", 30]],
    [["flexiones_rodillas", 3, "10", 45], ["zancada_lateral", 3, "10", 45], ["plancha_lateral", 2, "15s", 30], ["puente_gluteo", 3, "15", 30], ["salto_tijera", 3, "25", 30]],
  ],
  2: [
    [["flexiones", 3, "10", 45], ["plancha", 3, "30s", 30], ["puente_gluteo", 3, "15", 30], ["abdominales_bicicleta", 3, "18", 30], ["rodillas_altas", 3, "25s", 30]],
    [["sentadilla_salto", 3, "10", 45], ["zancada_lateral", 3, "12", 45], ["escaladores", 3, "20", 30], ["plancha_lateral", 3, "20s", 30], ["salto_tijera", 3, "25", 30]],
    [["remo_invertido_mesa", 3, "8", 45], ["sentadilla_bulgara", 3, "10", 45], ["plancha_toques_hombro", 3, "12", 30], ["abdominales_bicicleta", 3, "18", 30], ["rodillas_altas", 3, "25s", 30]],
    [["flexiones_diamante", 3, "8", 45], ["sentadilla_bulgara", 3, "10", 45], ["plancha", 3, "30s", 30], ["puente_gluteo", 3, "15", 30], ["escaladores", 3, "20", 30]],
    [["sentadilla_salto", 3, "12", 45], ["remo_invertido_mesa", 3, "10", 45], ["plancha_lateral", 3, "20s", 30], ["salto_tijera", 3, "25", 30], ["rodillas_altas", 3, "25s", 30]],
    [["flexiones", 3, "12", 45], ["zancada_lateral", 3, "12", 45], ["plancha_toques_hombro", 3, "14", 30], ["puente_gluteo", 3, "15", 30], ["escaladores", 3, "22", 30]],
  ],
  3: [
    [["flexiones_diamante", 4, "10", 45], ["sentadilla_bulgara", 4, "10", 45], ["plancha", 3, "40s", 30], ["elevacion_piernas_acostado", 3, "12", 30], ["escaladores", 3, "25", 30]],
    [["dominadas", 4, "5", 60], ["remo_invertido_mesa", 3, "10", 45], ["plancha_toques_hombro", 3, "15", 30], ["abdominales_bicicleta", 3, "20", 30], ["rodillas_altas", 3, "25s", 30]],
    [["sentadilla_salto", 4, "12", 45], ["zancada_lateral", 3, "12", 45], ["burpees", 3, "10", 45], ["plancha_lateral", 3, "25s", 30], ["escaladores", 3, "25", 30]],
    [["flexiones_pica", 4, "10", 45], ["plancha", 3, "40s", 30], ["elevacion_piernas_acostado", 3, "12", 30], ["puente_gluteo", 3, "18", 30], ["salto_tijera", 3, "25", 30]],
    [["dominadas", 4, "6", 60], ["remo_invertido_mesa", 3, "12", 45], ["sentadilla_bulgara", 3, "10", 45], ["burpees", 3, "10", 45], ["plancha", 3, "40s", 30]],
    [["flexiones_diamante", 4, "10", 45], ["zancada_lateral", 3, "12", 45], ["plancha_toques_hombro", 3, "15", 30], ["escaladores", 3, "25", 30], ["elevacion_piernas_acostado", 3, "14", 30]],
  ],
  4: [
    [["flexiones_pica", 4, "10", 45], ["fondos_banco", 4, "10", 45], ["plancha", 4, "45s", 30], ["elevacion_piernas_colgado", 3, "8", 45], ["escaladores", 4, "25", 30]],
    [["dominadas", 4, "7", 60], ["remo_invertido_mesa", 4, "12", 45], ["sentadilla_bulgara", 4, "10", 45], ["burpees", 4, "10", 45], ["plancha_toques_hombro", 3, "16", 30]],
    [["sentadilla_salto", 4, "12", 45], ["zancada_lateral", 4, "12", 45], ["elevacion_piernas_colgado", 3, "8", 45], ["burpees", 4, "12", 45], ["escaladores", 4, "25", 30]],
    [["flexiones_pica", 4, "10", 45], ["fondos_banco", 4, "12", 45], ["dominadas", 4, "6", 60], ["plancha", 4, "45s", 30], ["sentadilla_bulgara", 4, "10", 45]],
    [["burpees", 4, "12", 45], ["escaladores", 4, "25", 30], ["remo_invertido_mesa", 4, "12", 45], ["plancha_toques_hombro", 3, "16", 30], ["elevacion_piernas_colgado", 3, "8", 45]],
    [["dominadas", 4, "8", 60], ["fondos_banco", 4, "12", 45], ["sentadilla_salto", 4, "12", 45], ["plancha", 4, "45s", 30], ["zancada_lateral", 4, "12", 45]],
  ],
};

function toItem([exercise_id, sets, reps, rest]) {
  const unit = typeof reps === "string" && reps.endsWith("s") ? "segundos" : undefined;
  const cleanReps = unit ? reps.slice(0, -1) : reps;
  const item = { exercise_id, sets, reps: cleanReps, rest_seconds: rest };
  if (unit) item.reps_unit = unit;
  return item;
}

const RECOVERY = [
  ["plancha", 2, "30s", 30],
  ["puente_gluteo", 2, "15", 30],
  ["rodillas_altas", 2, "20s", 30],
];

const routines = [];
for (let day = 1; day <= 30; day++) {
  const realWeek = Math.floor((day - 1) / 7) + 1;
  const templateWeek = Math.min(realWeek, 4);
  const dayInWeek = ((day - 1) % 7) + 1;

  if (dayInWeek === 7) {
    routines.push({
      id: `dia-${day}`, day, week: realWeek,
      title: `Día ${day} - Recuperación activa`,
      is_recovery_day: true,
      motivational_message: "Recuperar también es entrenar. Estira, camina, hidrátate y vuelve más fuerte mañana.",
      exercises: RECOVERY.map(toItem),
      unlocked_by_default: day === 1,
    });
    continue;
  }

  const plantilla = semanas[templateWeek][dayInWeek - 1];
  routines.push({
    id: `dia-${day}`, day, week: realWeek,
    title: `Día ${day} - Semana ${realWeek}`,
    is_recovery_day: false,
    motivational_message: motivational_messages[(day - 1) % motivational_messages.length],
    exercises: plantilla.map(toItem),
    unlocked_by_default: day === 1,
  });
}

// --- GIFs reales (US: "agregar videos según los ejercicios") ---
// gif-map.json se genera con build-gif-map.js a partir del dataset abierto
// JahelCuadrado/ExerciseGymGifsDB (GIFs en español, servidos por jsDelivr).
// Si no existe (primera vez, o si borraste el caché), se avisa y se deja el
// video_url de placeholder para no romper el resto del pipeline.
const gifMapPath = path.join(__dirname, "gif-map.json");
let gifMap = {};
if (fs.existsSync(gifMapPath)) {
  gifMap = JSON.parse(fs.readFileSync(gifMapPath, "utf-8"));
} else {
  console.warn(
    "⚠ No se encontró gif-map.json — los ejercicios quedarán con video_url de placeholder. Corre build-gif-map.js primero."
  );
}

// Estos dos no tienen variante bodyweight en el dataset fuente; el gif
// mostrado es de un equipo distinto (Smith / barra) solo como referencia
// visual del movimiento. Reemplazar por un video propio apenas se pueda.
const APPROXIMATE_MATCH = new Set(["sentadilla_sumo", "zancada_lateral"]);

for (const ex of exercises) {
  const match = gifMap[ex.id];
  if (!match) continue;
  ex.video_url = match.gifUrl;
  ex.video_source = "JahelCuadrado/ExerciseGymGifsDB (CC, vía jsDelivr)";
  if (APPROXIMATE_MATCH.has(ex.id)) {
    ex.video_is_approximate = true;
  }
}

fs.writeFileSync(path.join(__dirname, "exercises.json"), JSON.stringify(exercises, null, 2));
fs.writeFileSync(path.join(__dirname, "routines.json"), JSON.stringify(routines, null, 2));
console.log(`OK: ${exercises.length} ejercicios, ${routines.length} días generados.`);
console.log(`   GIFs reales aplicados: ${Object.keys(gifMap).length}/${exercises.length}`);
