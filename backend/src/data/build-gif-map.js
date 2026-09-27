const data = require("/tmp/all_es.json").exercises;

const BASE = "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0";

// slug elegido para cada uno de nuestros 26 ejercicios, más el equipment
// para desambiguar cuando el mismo slug existe en variantes.
const picks = {
  flexiones_pared: { slug: "push-up-wall" },
  flexiones_rodillas: { slug: "kneeling-push-up-male" },
  flexiones: { slug: "push-up" },
  flexiones_diamante: { slug: "diamond-push-up" },
  flexiones_pica: { slug: "pike-to-cobra-push-up" },
  sentadillas: { slug: "potty-squat" },
  sentadilla_sumo: { slug: "smith-sumo-squat" }, // única variante disponible; no hay bodyweight en el dataset
  sentadilla_salto: { slug: "jump-squat", equipment: "bodyweight" },
  zancadas: { slug: "forward-lunge-male" },
  zancada_lateral: { slug: "barbell-lateral-lunge" }, // no hay variante bodyweight en el dataset
  sentadilla_bulgara: { slug: "split-squats" },
  plancha: { slug: "power-point-plank" },
  plancha_lateral: { slug: "side-plank-hip-adduction" },
  plancha_toques_hombro: { slug: "shoulder-tap" },
  abdominales_bicicleta: { slug: "air-bike" },
  elevacion_piernas_acostado: { slug: "lying-leg-raise-flat-bench" },
  superman: { slug: "superman-push-up" },
  puente_gluteo: { slug: "low-glute-bridge-on-floor" },
  burpees: { slug: "burpee" },
  escaladores: { slug: "mountain-climber" },
  rodillas_altas: { slug: "walking-high-knees-lunge" },
  salto_tijera: { slug: "star-jump-male" },
  dominadas: { slug: "pull-up" },
  remo_invertido_mesa: { slug: "inverted-row" },
  elevacion_piernas_colgado: { slug: "hanging-leg-raise" },
  fondos_banco: { slug: "bench-dip-on-floor" },
};

const result = {};
const missing = [];
for (const [ourId, pick] of Object.entries(picks)) {
  const found = data.find(
    (e) => e.slug === pick.slug && (!pick.equipment || e.equipment === pick.equipment)
  );
  if (!found) {
    missing.push(ourId);
    continue;
  }
  result[ourId] = {
    gifUrl: found.gifUrl,
    sourceSlug: found.slug,
    sourceName: found.name,
    equipmentInSource: found.equipment,
  };
}

if (missing.length) {
  console.error("FALTAN:", missing);
  process.exit(1);
}

require("fs").writeFileSync(
  __dirname + "/gif-map.json",
  JSON.stringify(result, null, 2)
);
console.log(`OK: ${Object.keys(result).length}/26 mapeados. Guardado en gif-map.json`);
