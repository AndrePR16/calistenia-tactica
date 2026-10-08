// Genera exercises.json y programs.json.
// Ejecutar cuando cambies el contenido: node src/data/generate-data.js
//
// Estructura del contenido
// ------------------------
// - 3 NIVELES, elegidos por la experiencia que declara la persona en el test:
//     base        (nunca entrenó)
//     intermedio  (entrenó antes)
//     avanzado    (entrena actualmente)
//   Cada nivel es un programa COMPLETO de 21 días que arranca en el día 1.
//   (Antes, "entrené antes" solo prometía saltar al día 8 y nunca se aplicaba;
//   además todos recibían exactamente la misma rutina.)
//
// - 3 OBJETIVOS (fuerza / resistencia / perdida_peso) que modifican cada nivel
//   con reglas simples y visibles (ver applyObjective): qué ejercicio cierra
//   el día, cuánto se descansa y, en pérdida de peso, un bloque cardio extra.
//   Resultado: 3 niveles x 3 objetivos = 9 programas, que salen de solo 3
//   programas escritos a mano + las reglas. Todo queda en programs.json.
//
// - Por qué 21 días: el cuerpo necesita descanso real entre bloques, así que
//   hay 6 días de entrenamiento y 1 de recuperación activa por semana (7/14/21).
//   La Fase 2 (28 días, más intensa) se construirá sobre este catálogo.
//
// - Barra: los ejercicios que piden barra (dominadas, colgarse, remo en barra
//   baja...) tienen siempre una alternativa "sin equipo" (no_equipment_variation_id)
//   y la app avisa al usuario cuándo le toca un día de barra (parque).
//
// Convención de repeticiones en las plantillas:
//   "12"   -> 12 repeticiones
//   "30s"  -> 30 segundos
//   "8L"   -> 8 repeticiones por lado/pierna
//   "20sL" -> 20 segundos por lado
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------
const PLACEHOLDER = null; // sin clip todavía: la app muestra el recuadro "VIDEO: NOMBRE"

function ex(id, name, muscle_groups, equipment_needed, difficulty, instructions, no_equipment_variation_id = null) {
  return { id, name, muscle_groups, equipment_needed, difficulty, instructions, video_url: PLACEHOLDER, no_equipment_variation_id };
}

const exercises = [
  // --- Empuje ---
  ex("flexiones_pared", "Flexiones en pared", ["pecho", "triceps"], [], "principiante", "De pie frente a una pared, manos a la altura del pecho. Flexiona los codos acercando el pecho a la pared y empuja."),
  ex("flexiones_rodillas", "Flexiones con rodillas apoyadas", ["pecho", "triceps"], [], "principiante", "Igual que la flexión estándar pero con las rodillas en el suelo, para reducir la carga mientras ganas fuerza."),
  ex("flexiones", "Flexiones de pecho", ["pecho", "triceps", "hombro"], [], "principiante", "Manos a la altura de los hombros, cuerpo recto de cabeza a talones. Baja el pecho casi hasta el suelo y empuja fuerte para volver."),
  ex("flexiones_diamante", "Flexiones diamante", ["triceps", "pecho"], [], "intermedio", "Junta las manos bajo el pecho formando un diamante con índices y pulgares. Baja con los codos cerca del cuerpo."),
  ex("flexiones_pica", "Flexiones pica (pike push-up)", ["hombro", "triceps"], [], "intermedio", "Cadera elevada en V invertida. Baja la cabeza hacia el suelo entre las manos y empuja."),
  ex("flexiones_pies_elevados", "Flexiones con pies elevados", ["pecho", "hombro", "triceps"], ["silla_o_banco"], "intermedio", "Pies sobre una silla o banco firme, cuerpo en línea recta. Baja el pecho al suelo y empuja. Cuanto más altos los pies, más carga en hombros y pecho alto.", "flexiones"),
  ex("flexiones_arquero", "Flexiones arquero", ["pecho", "triceps", "hombro"], [], "avanzado", "Manos más separadas que los hombros. Baja el pecho hacia una mano mientras el otro brazo se mantiene casi recto, sube y alterna lados."),
  ex("fondos_banco", "Fondos de tríceps en banco/silla", ["triceps", "hombro"], ["silla_o_banco"], "intermedio", "Manos en el borde de una silla firme, piernas extendidas. Baja el cuerpo doblando los codos y empuja.", "flexiones_diamante"),

  // --- Tracción (barra opcional) ---
  ex("remo_invertido_mesa", "Remo invertido bajo mesa (sin barra)", ["espalda", "biceps"], ["mesa_resistente"], "principiante", "Acostado bajo una mesa firme, sujeta el borde y tira del pecho hacia la mesa manteniendo el cuerpo recto."),
  ex("remo_invertido", "Remo invertido en barra baja", ["espalda", "biceps"], ["barra"], "intermedio", "Bajo una barra baja y firme, agarre al ancho de hombros y cuerpo recto de talones a cabeza. Tira del pecho hacia la barra juntando los omóplatos y baja controlado. Cuanto más horizontal el cuerpo, más difícil.", "remo_invertido_mesa"),
  ex("dead_hang", "Colgado en barra (dead hang)", ["espalda", "antebrazo", "hombro"], ["barra"], "principiante", "Cuelga de la barra con agarre firme y brazos extendidos, hombros activos (sin encogerlos hacia las orejas) y cuerpo estable. Mantén el tiempo indicado.", "superman"),
  ex("dominada_negativa", "Dominada negativa", ["espalda", "biceps"], ["barra"], "intermedio", "Sube a la posición con la barbilla sobre la barra (con salto o ayudándote de un banco) y baja lo más lento posible, 3 a 5 segundos, hasta extender los brazos.", "remo_invertido_mesa"),
  ex("dominadas", "Dominadas (pull-ups)", ["espalda", "biceps"], ["barra"], "avanzado", "Cuelga de la barra con agarre prono, sube hasta que la barbilla pase la barra y baja controlado, sin balanceo.", "remo_invertido_mesa"),
  ex("dominada_supina", "Dominada supina (chin-up)", ["espalda", "biceps"], ["barra"], "avanzado", "Agarre con las palmas hacia ti, manos al ancho de hombros. Sube hasta pasar la barbilla de la barra sin balanceo y baja controlado hasta extender los brazos.", "remo_invertido_mesa"),

  // --- Piernas ---
  ex("sentadillas", "Sentadillas (squat)", ["cuadriceps", "gluteos"], [], "principiante", "Pies al ancho de hombros, baja como si te sentaras con el pecho arriba y el peso en los talones; las rodillas siguen la línea de los pies."),
  ex("sentadilla_sumo", "Sentadilla sumo", ["cuadriceps", "gluteos", "aductores"], [], "principiante", "Pies bien separados con las puntas hacia afuera. Baja en sentadilla manteniendo la espalda recta."),
  ex("sentadilla_salto", "Sentadilla con salto", ["cuadriceps", "gluteos", "cardio"], [], "intermedio", "Baja en sentadilla y explota hacia arriba en un salto; aterriza suave y baja de nuevo."),
  ex("zancadas", "Zancadas (lunges)", ["cuadriceps", "gluteos"], [], "principiante", "Da un paso largo al frente, baja la rodilla trasera casi al suelo y vuelve. Alterna piernas."),
  ex("zancada_reversa", "Zancada reversa alternada", ["cuadriceps", "gluteos"], [], "principiante", "De pie, da un paso largo hacia atrás y baja la rodilla trasera casi al suelo con el torso erguido y el peso en el talón de adelante. Empuja con la pierna delantera para volver y alterna."),
  ex("zancada_lateral", "Zancada lateral", ["cuadriceps", "gluteos", "aductores"], [], "principiante", "Da un paso amplio hacia el lado, flexiona esa rodilla manteniendo la otra pierna recta y vuelve al centro."),
  ex("sentadilla_bulgara_asistida", "Sentadilla búlgara asistida", ["cuadriceps", "gluteos"], ["silla_o_banco"], "principiante", "Apoya el empeine del pie trasero en una silla o banco firme. Baja controlando la rodilla delantera y sube empujando con el talón. Si necesitas equilibrio, apoya una mano en una pared o poste.", "zancada_reversa"),
  ex("sentadilla_bulgara", "Sentadilla búlgara", ["cuadriceps", "gluteos"], ["silla_o_banco"], "intermedio", "Pie trasero apoyado en una silla o banco, sin ayuda de las manos. Baja con la pierna delantera hasta que el muslo quede paralelo al suelo y sube.", "zancadas"),
  ex("sentadilla_pistol_asistida", "Sentadilla a una pierna asistida", ["cuadriceps", "gluteos"], [], "intermedio", "Sujeta una superficie estable (marco de puerta, poste o barra) con una mano. Baja en sentadilla sobre una sola pierna con la otra extendida al frente y sube controlando; usa la mano solo lo necesario."),
  ex("pistol_squat", "Sentadilla pistol", ["cuadriceps", "gluteos", "core"], [], "avanzado", "Sobre una pierna y con la otra extendida al frente, baja en sentadilla profunda con el torso erguido y sube sin impulso. Si pierdes el equilibrio, vuelve a la versión asistida."),
  ex("sentadilla_pared", "Sentadilla isométrica en pared (wall sit)", ["cuadriceps", "gluteos"], [], "principiante", "Apoya la espalda en una pared con rodillas y cadera a 90°, como sentado en una silla invisible. Mantén la posición sin apoyar las manos en los muslos."),
  ex("puente_gluteo", "Puente de glúteos", ["gluteos", "isquiotibiales"], [], "principiante", "Acostado, rodillas flexionadas. Eleva la cadera apretando glúteos y baja sin apoyar del todo."),

  // --- Core ---
  ex("plancha", "Plancha abdominal (plank)", ["core"], [], "principiante", "Antebrazos y puntas de los pies en el suelo, cuerpo en línea recta y abdomen firme."),
  ex("plancha_lateral", "Plancha lateral", ["core", "oblicuos"], [], "intermedio", "Apoyo en un antebrazo y el borde del pie, cuerpo de lado en línea recta, cadera arriba sin caer."),
  ex("plancha_toques_hombro", "Plancha con toques de hombro", ["core", "hombro"], [], "intermedio", "En plancha alta, toca el hombro contrario con cada mano alternando, sin mover la cadera."),
  ex("plancha_alcance", "Plancha con alcance de brazo", ["core", "hombro"], [], "intermedio", "En plancha alta, extiende un brazo al frente alternando lados, sin que la cadera se balancee. Separa un poco los pies para ganar estabilidad."),
  ex("plancha_subidas", "Plancha arriba-abajo (plank up-downs)", ["core", "triceps", "hombro"], [], "intermedio", "Desde plancha sobre antebrazos, sube a plancha alta apoyando una mano y luego la otra; baja de la misma forma. Alterna el brazo que inicia y mantén la cadera estable."),
  ex("inchworm", "Caminata a plancha (inchworm)", ["core", "hombro", "isquiotibiales"], [], "intermedio", "De pie, baja las manos al suelo y camina con ellas hacia delante hasta plancha alta. Pausa un segundo y regresa caminando con las manos, con las piernas lo más rectas posible."),
  ex("hollow_body", "Hollow body hold", ["core"], [], "intermedio", "Boca arriba, eleva hombros y piernas del suelo con la zona lumbar pegada al piso y el cuerpo en forma de banana. Si es muy difícil, flexiona las rodillas. Mantén la posición."),
  ex("dead_bug", "Dead bug", ["core"], [], "principiante", "Boca arriba, brazos al techo y rodillas a 90°. Extiende brazo y pierna contrarios hacia el suelo sin despegar la zona lumbar, vuelve y alterna."),
  ex("bird_dog", "Bird dog", ["core", "espalda_baja", "gluteos"], [], "principiante", "En cuatro apoyos con la espalda neutra, extiende brazo y pierna contrarios a la vez sin rotar la cadera. Vuelve y alterna."),
  ex("superman", "Superman", ["espalda_baja", "gluteos"], [], "principiante", "Boca abajo, eleva brazos y piernas al mismo tiempo, sostén un segundo y baja controlado."),
  ex("abdominal_crunch", "Crunch abdominal", ["core"], [], "principiante", "Boca arriba con las rodillas flexionadas, eleva la parte alta de la espalda acercando el pecho a las rodillas sin tirar del cuello. Baja controlado."),
  ex("abdominales_bicicleta", "Abdominales bicicleta", ["core", "oblicuos"], [], "principiante", "Boca arriba, lleva el codo hacia la rodilla contraria en un pedaleo controlado."),
  ex("elevacion_piernas_acostado", "Elevación de piernas acostado", ["core", "abdomen_bajo"], [], "intermedio", "Boca arriba con las piernas rectas, sube y baja sin despegar la zona lumbar del suelo."),
  ex("elevacion_rodillas_colgado", "Elevación de rodillas colgado", ["core", "abdomen_bajo"], ["barra"], "intermedio", "Colgado de la barra, sube las rodillas hacia el pecho curvando ligeramente la pelvis, sin balancearte. Baja controlado.", "elevacion_piernas_acostado"),
  ex("elevacion_piernas_colgado", "Elevación de piernas colgado de la barra", ["core", "abdomen_bajo"], ["barra"], "avanzado", "Colgado de la barra, sube las piernas rectas (o ligeramente flexionadas) hasta la altura de la cadera o más, sin balancear.", "elevacion_piernas_acostado"),

  // --- Cardio / full body ---
  ex("burpees", "Burpees", ["full_body", "cardio"], [], "intermedio", "De pie, baja a sentadilla, apoya las manos, salta con los pies atrás a plancha, haz una flexión si puedes, vuelve y salta arriba."),
  ex("escaladores", "Escaladores (mountain climbers)", ["core", "cardio"], [], "principiante", "En plancha alta, lleva las rodillas al pecho alternando rápido."),
  ex("rodillas_altas", "Rodillas altas (high knees)", ["cardio", "piernas"], [], "principiante", "Trota en el sitio llevando las rodillas a la altura de la cadera, con los brazos activos."),
  ex("salto_tijera", "Salto de tijera (jumping jacks)", ["cardio", "full_body"], [], "principiante", "Salta separando piernas y brazos hacia afuera y vuelve a la posición inicial en el mismo salto."),
  ex("paso_lateral", "Pasos laterales (side steps)", ["cardio", "piernas"], [], "principiante", "Da pasos laterales amplios a derecha e izquierda con las rodillas ligeramente flexionadas y los brazos activos, a ritmo constante."),
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

// ---------------------------------------------------------------------------
// Programas base (6 días de entrenamiento por semana; el día 7 es recuperación)
// Cada item: [exercise_id, series, repeticiones, descanso_en_segundos]
// Orden de los días de la semana: 1 empuje+pierna, 2 tracción/barra, 3 HIIT,
// 4 empuje+core, 5 tracción/barra+pierna, 6 circuito. (Base no usa barra.)
// ---------------------------------------------------------------------------
const BASE = {
  1: [
    [["flexiones_pared", 3, "10", 30], ["sentadillas", 3, "12", 45], ["plancha", 3, "20s", 30], ["puente_gluteo", 3, "12", 30], ["rodillas_altas", 3, "20s", 30]],
    [["zancada_reversa", 3, "8L", 45], ["bird_dog", 3, "8L", 30], ["flexiones_rodillas", 3, "6", 45], ["sentadilla_pared", 3, "20s", 30], ["salto_tijera", 3, "20", 30]],
    [["sentadilla_sumo", 3, "12", 45], ["dead_bug", 3, "8L", 30], ["puente_gluteo", 3, "15", 30], ["abdominales_bicicleta", 3, "12", 30], ["paso_lateral", 3, "30s", 30]],
    [["flexiones_rodillas", 3, "8", 45], ["sentadillas", 3, "15", 45], ["superman", 3, "10", 30], ["plancha_lateral", 2, "15sL", 30], ["rodillas_altas", 3, "20s", 30]],
    [["zancadas", 3, "8L", 45], ["plancha", 3, "25s", 30], ["dead_bug", 3, "10L", 30], ["flexiones_pared", 3, "12", 30], ["salto_tijera", 3, "25", 30]],
    [["zancada_lateral", 3, "10L", 45], ["bird_dog", 3, "10L", 30], ["superman", 3, "10", 30], ["abdominal_crunch", 3, "12", 30], ["escaladores", 3, "15", 30]],
  ],
  2: [
    [["flexiones", 3, "6", 45], ["sentadillas", 3, "15", 45], ["plancha", 3, "30s", 30], ["puente_gluteo", 3, "15", 30], ["rodillas_altas", 3, "25s", 30]],
    [["zancada_reversa", 3, "10L", 45], ["remo_invertido_mesa", 3, "6", 45], ["plancha_alcance", 3, "6L", 30], ["sentadilla_pared", 3, "30s", 30], ["salto_tijera", 3, "25", 30]],
    [["sentadilla_salto", 3, "8", 45], ["zancada_lateral", 3, "10L", 45], ["escaladores", 3, "16", 30], ["dead_bug", 3, "10L", 30], ["paso_lateral", 3, "40s", 30]],
    [["flexiones", 3, "8", 45], ["plancha_lateral", 3, "15sL", 30], ["bird_dog", 3, "10L", 30], ["superman", 3, "12", 30], ["abdominales_bicicleta", 3, "15", 30]],
    [["sentadilla_bulgara_asistida", 3, "6L", 45], ["remo_invertido_mesa", 3, "8", 45], ["hollow_body", 3, "15s", 30], ["puente_gluteo", 3, "18", 30], ["rodillas_altas", 3, "25s", 30]],
    [["zancada_reversa", 3, "10L", 45], ["flexiones", 3, "8", 45], ["plancha_toques_hombro", 3, "10", 30], ["escaladores", 3, "18", 30], ["salto_tijera", 3, "25", 30]],
  ],
  3: [
    [["flexiones", 3, "10", 45], ["sentadilla_bulgara_asistida", 3, "8L", 45], ["plancha", 3, "40s", 30], ["hollow_body", 3, "20s", 30], ["escaladores", 3, "20", 30]],
    [["remo_invertido_mesa", 3, "10", 45], ["zancada_reversa", 3, "12L", 45], ["plancha_alcance", 3, "8L", 30], ["superman", 3, "15", 30], ["burpees", 3, "6", 45]],
    [["sentadilla_salto", 3, "10", 45], ["zancada_lateral", 3, "12L", 45], ["inchworm", 3, "6", 45], ["escaladores", 3, "20", 30], ["rodillas_altas", 3, "30s", 30]],
    [["flexiones_diamante", 3, "6", 45], ["plancha_lateral", 3, "20sL", 30], ["dead_bug", 3, "12L", 30], ["puente_gluteo", 3, "20", 30], ["elevacion_piernas_acostado", 3, "10", 30]],
    [["sentadilla_pared", 3, "40s", 30], ["remo_invertido_mesa", 3, "10", 45], ["flexiones", 3, "10", 45], ["plancha_subidas", 3, "6", 30], ["salto_tijera", 3, "30", 30]],
    [["burpees", 3, "8", 45], ["sentadilla_bulgara_asistida", 3, "10L", 45], ["flexiones", 3, "10", 45], ["escaladores", 3, "20", 30], ["plancha", 3, "40s", 30]],
  ],
};

const INTERMEDIO = {
  1: [
    [["flexiones", 4, "8", 45], ["zancada_reversa", 3, "10L", 45], ["plancha", 3, "30s", 30], ["puente_gluteo", 3, "15", 30], ["dead_bug", 3, "10L", 30]],
    [["dead_hang", 3, "20s", 45], ["remo_invertido", 4, "6", 45], ["dominada_negativa", 3, "3", 60], ["elevacion_rodillas_colgado", 3, "6", 45], ["sentadillas", 3, "15", 45]],
    [["rodillas_altas", 4, "30s", 30], ["sentadilla_salto", 4, "8", 45], ["escaladores", 4, "16", 30], ["salto_tijera", 4, "25", 30], ["abdominal_crunch", 3, "15", 30]],
    [["flexiones_diamante", 3, "6", 45], ["sentadilla_bulgara_asistida", 3, "8L", 45], ["plancha_alcance", 3, "8L", 30], ["hollow_body", 3, "20s", 30], ["superman", 3, "12", 30]],
    [["remo_invertido", 4, "8", 45], ["dead_hang", 3, "25s", 45], ["flexiones", 4, "10", 45], ["zancada_reversa", 3, "10L", 45], ["plancha_lateral", 3, "20sL", 30]],
    [["burpees", 3, "8", 45], ["sentadilla_salto", 3, "10", 45], ["flexiones", 3, "10", 45], ["escaladores", 3, "20", 30], ["plancha_subidas", 3, "8", 30]],
  ],
  2: [
    [["flexiones", 4, "10", 45], ["sentadilla_bulgara_asistida", 4, "8L", 45], ["plancha_subidas", 3, "8", 30], ["hollow_body", 3, "25s", 30], ["puente_gluteo", 3, "18", 30]],
    [["dead_hang", 3, "30s", 45], ["remo_invertido", 4, "8", 45], ["dominada_negativa", 4, "4", 60], ["elevacion_rodillas_colgado", 3, "8", 45], ["sentadilla_pared", 3, "40s", 30]],
    [["burpees", 4, "8", 45], ["sentadilla_salto", 4, "10", 45], ["escaladores", 4, "20", 30], ["rodillas_altas", 4, "35s", 30], ["plancha_toques_hombro", 3, "12", 30]],
    [["flexiones_diamante", 4, "8", 45], ["inchworm", 3, "6", 45], ["flexiones_pica", 3, "8", 45], ["dead_bug", 3, "12L", 30], ["plancha", 3, "40s", 30]],
    [["remo_invertido", 4, "10", 45], ["dominada_negativa", 4, "4", 60], ["sentadilla_pistol_asistida", 3, "5L", 45], ["flexiones", 4, "12", 45], ["elevacion_rodillas_colgado", 3, "8", 45]],
    [["sentadilla_bulgara_asistida", 4, "10L", 45], ["zancada_reversa", 4, "10L", 45], ["flexiones", 4, "10", 45], ["hollow_body", 3, "25s", 30], ["escaladores", 4, "22", 30]],
  ],
  3: [
    [["sentadilla_pistol_asistida", 4, "6L", 45], ["flexiones_pies_elevados", 4, "8", 45], ["plancha_alcance", 3, "10L", 30], ["hollow_body", 3, "30s", 30], ["puente_gluteo", 3, "20", 30]],
    [["dead_hang", 3, "35s", 45], ["remo_invertido", 4, "10", 45], ["dominada_negativa", 4, "5", 60], ["elevacion_rodillas_colgado", 4, "10", 45], ["sentadilla_bulgara_asistida", 3, "10L", 45]],
    [["burpees", 4, "10", 45], ["sentadilla_salto", 4, "12", 45], ["escaladores", 4, "25", 30], ["rodillas_altas", 4, "40s", 30], ["plancha_subidas", 4, "10", 30]],
    [["flexiones_diamante", 4, "10", 45], ["flexiones_pica", 4, "8", 45], ["fondos_banco", 3, "10", 45], ["plancha", 3, "45s", 30], ["superman", 3, "15", 30]],
    [["remo_invertido", 4, "10", 45], ["dominada_negativa", 4, "5", 60], ["flexiones", 4, "15", 45], ["sentadilla_pistol_asistida", 3, "6L", 45], ["elevacion_rodillas_colgado", 3, "10", 45]],
    [["burpees", 4, "10", 45], ["sentadilla_salto", 4, "12", 45], ["flexiones", 4, "12", 45], ["zancada_reversa", 4, "10L", 45], ["plancha_toques_hombro", 3, "14", 30]],
  ],
};

const AVANZADO = {
  1: [
    [["flexiones_pies_elevados", 4, "10", 45], ["sentadilla_pistol_asistida", 4, "6L", 45], ["flexiones_diamante", 4, "10", 45], ["hollow_body", 4, "30s", 30], ["plancha_subidas", 3, "10", 30]],
    [["dominadas", 4, "5", 60], ["remo_invertido", 4, "10", 45], ["dominada_negativa", 3, "5", 60], ["elevacion_piernas_colgado", 3, "8", 45], ["dead_hang", 3, "40s", 45]],
    [["burpees", 4, "10", 45], ["sentadilla_salto", 4, "12", 45], ["escaladores", 4, "25", 30], ["rodillas_altas", 4, "40s", 30], ["flexiones", 3, "12", 45]],
    [["flexiones_pica", 4, "10", 45], ["fondos_banco", 4, "12", 45], ["flexiones_arquero", 3, "5L", 60], ["plancha_toques_hombro", 3, "16", 30], ["hollow_body", 3, "30s", 30]],
    [["dominada_supina", 4, "4", 60], ["remo_invertido", 4, "12", 45], ["sentadilla_bulgara", 4, "10L", 45], ["elevacion_piernas_colgado", 3, "8", 45], ["plancha_lateral", 3, "30sL", 30]],
    [["burpees", 4, "12", 45], ["zancada_reversa", 4, "12L", 45], ["flexiones", 4, "15", 45], ["escaladores", 4, "25", 30], ["plancha", 4, "45s", 30]],
  ],
  2: [
    [["flexiones_arquero", 4, "6L", 60], ["pistol_squat", 3, "3L", 60], ["flexiones_pies_elevados", 4, "12", 45], ["hollow_body", 4, "35s", 30], ["plancha_alcance", 3, "10L", 30]],
    [["dominadas", 4, "6", 60], ["remo_invertido", 4, "12", 45], ["dominada_negativa", 3, "6", 60], ["elevacion_piernas_colgado", 4, "8", 45], ["dead_hang", 3, "45s", 45]],
    [["burpees", 5, "10", 45], ["sentadilla_salto", 4, "15", 45], ["escaladores", 4, "30", 30], ["rodillas_altas", 5, "40s", 30], ["flexiones_diamante", 3, "12", 45]],
    [["flexiones_pica", 4, "12", 45], ["fondos_banco", 4, "15", 45], ["flexiones_diamante", 4, "12", 45], ["plancha_toques_hombro", 3, "18", 30], ["hollow_body", 4, "35s", 30]],
    [["dominada_supina", 4, "5", 60], ["remo_invertido", 4, "12", 45], ["sentadilla_bulgara", 4, "10L", 45], ["elevacion_piernas_colgado", 4, "10", 45], ["plancha_lateral", 3, "35sL", 30]],
    [["burpees", 4, "12", 45], ["zancada_reversa", 4, "12L", 45], ["flexiones", 4, "18", 45], ["escaladores", 4, "30", 30], ["plancha_subidas", 4, "12", 30]],
  ],
  3: [
    [["flexiones_arquero", 4, "6L", 60], ["pistol_squat", 4, "4L", 60], ["flexiones_pies_elevados", 4, "15", 45], ["hollow_body", 4, "40s", 30], ["plancha_alcance", 4, "10L", 30]],
    [["dominadas", 5, "6", 75], ["remo_invertido", 4, "12", 45], ["dominada_negativa", 3, "8", 60], ["elevacion_piernas_colgado", 4, "10", 45], ["dead_hang", 3, "50s", 45]],
    [["burpees", 5, "12", 45], ["sentadilla_salto", 5, "15", 45], ["escaladores", 5, "30", 30], ["rodillas_altas", 5, "45s", 30], ["plancha_subidas", 4, "12", 30]],
    [["flexiones_pica", 5, "12", 45], ["fondos_banco", 4, "15", 45], ["flexiones_diamante", 4, "15", 45], ["plancha_toques_hombro", 4, "18", 30], ["hollow_body", 4, "45s", 30]],
    [["dominada_supina", 5, "5", 75], ["remo_invertido", 4, "15", 45], ["sentadilla_bulgara", 4, "12L", 45], ["elevacion_piernas_colgado", 4, "12", 45], ["plancha_lateral", 3, "40sL", 30]],
    [["burpees", 5, "12", 45], ["pistol_squat", 3, "4L", 60], ["flexiones_arquero", 4, "6L", 60], ["zancada_reversa", 4, "12L", 45], ["plancha", 4, "60s", 30]],
  ],
};

// Recuperación activa (días 7, 14, 21): suave, sin barra.
const RECOVERY = {
  base: [["bird_dog", 2, "8L", 30], ["puente_gluteo", 2, "15", 30], ["superman", 2, "10", 30]],
  intermedio: [["bird_dog", 2, "10L", 30], ["dead_bug", 2, "10L", 30], ["puente_gluteo", 2, "15", 30], ["paso_lateral", 2, "40s", 30]],
  avanzado: [["bird_dog", 2, "10L", 30], ["dead_bug", 2, "10L", 30], ["puente_gluteo", 2, "20", 30], ["paso_lateral", 2, "40s", 30]],
};

const NIVELES = { base: BASE, intermedio: INTERMEDIO, avanzado: AVANZADO };

// ---------------------------------------------------------------------------
// Modificadores por objetivo. Una por semana (índice 0..2), con 3 opciones que
// rotan según el día para que no sea siempre lo mismo.
// ---------------------------------------------------------------------------
const POOLS = {
  base: {
    fuerza: [
      [["flexiones_rodillas", 3, "8", 60], ["zancada_reversa", 3, "8L", 60], ["sentadilla_pared", 3, "30s", 60], ["superman", 3, "12", 45]],
      [["flexiones", 3, "6", 60], ["remo_invertido_mesa", 3, "8", 60], ["sentadilla_bulgara_asistida", 3, "6L", 60], ["zancada_reversa", 3, "10L", 60]],
      [["flexiones", 3, "10", 60], ["remo_invertido_mesa", 3, "10", 60], ["sentadilla_bulgara_asistida", 3, "8L", 60], ["flexiones_diamante", 3, "6", 60], ["zancada_reversa", 3, "12L", 60]],
    ],
    cardio: [
      [["rodillas_altas", 3, "25s", 30], ["salto_tijera", 3, "25", 30], ["escaladores", 3, "15", 30], ["paso_lateral", 3, "40s", 30]],
      [["rodillas_altas", 3, "30s", 30], ["escaladores", 3, "18", 30], ["sentadilla_salto", 3, "8", 45], ["salto_tijera", 3, "30", 30], ["paso_lateral", 3, "45s", 30]],
      [["burpees", 3, "6", 45], ["escaladores", 3, "22", 30], ["rodillas_altas", 3, "35s", 30], ["sentadilla_salto", 3, "10", 45], ["salto_tijera", 3, "30", 30]],
    ],
  },
  intermedio: {
    fuerza: [
      [["flexiones_diamante", 3, "6", 60], ["remo_invertido", 3, "6", 60], ["dominada_negativa", 3, "3", 60], ["sentadilla_bulgara_asistida", 3, "8L", 60], ["flexiones", 3, "10", 60]],
      [["flexiones_pica", 3, "8", 60], ["dominada_negativa", 3, "4", 60], ["sentadilla_pistol_asistida", 3, "5L", 60], ["remo_invertido", 3, "10", 60], ["flexiones_diamante", 3, "8", 60], ["sentadilla_bulgara_asistida", 3, "10L", 60]],
      [["flexiones_pies_elevados", 4, "8", 60], ["dominada_negativa", 4, "5", 75], ["sentadilla_pistol_asistida", 3, "6L", 60], ["flexiones_pica", 4, "8", 60], ["remo_invertido", 4, "10", 60], ["fondos_banco", 3, "10", 60]],
    ],
    cardio: [
      [["burpees", 3, "6", 45], ["escaladores", 4, "20", 30], ["rodillas_altas", 4, "35s", 30], ["salto_tijera", 4, "30", 30], ["sentadilla_salto", 3, "8", 45]],
      [["burpees", 4, "8", 45], ["sentadilla_salto", 4, "10", 45], ["escaladores", 4, "22", 30], ["rodillas_altas", 4, "40s", 30], ["plancha_subidas", 3, "8", 30], ["salto_tijera", 4, "35", 30]],
      [["burpees", 4, "10", 45], ["sentadilla_salto", 4, "12", 45], ["plancha_subidas", 4, "10", 30], ["escaladores", 4, "25", 30], ["rodillas_altas", 4, "45s", 30], ["inchworm", 3, "8", 45]],
    ],
  },
  avanzado: {
    fuerza: [
      [["flexiones_arquero", 3, "5L", 60], ["dominadas", 4, "5", 75], ["pistol_squat", 3, "3L", 60], ["flexiones_pica", 4, "10", 60], ["dominada_supina", 4, "4", 75], ["sentadilla_bulgara", 4, "10L", 60]],
      [["flexiones_arquero", 4, "6L", 60], ["dominada_supina", 4, "5", 75], ["pistol_squat", 3, "4L", 60], ["dominadas", 4, "6", 75], ["fondos_banco", 4, "15", 60], ["flexiones_pies_elevados", 4, "12", 60]],
      [["flexiones_arquero", 4, "8L", 75], ["dominadas", 5, "6", 75], ["pistol_squat", 4, "4L", 75], ["dominada_supina", 5, "5", 75], ["flexiones_pica", 5, "12", 60], ["sentadilla_bulgara", 4, "12L", 60]],
    ],
    cardio: [
      [["burpees", 4, "10", 45], ["sentadilla_salto", 4, "12", 45], ["escaladores", 4, "25", 30], ["rodillas_altas", 4, "40s", 30], ["salto_tijera", 4, "40", 30], ["plancha_subidas", 4, "12", 30]],
      [["burpees", 5, "10", 45], ["sentadilla_salto", 5, "12", 45], ["escaladores", 5, "28", 30], ["rodillas_altas", 5, "45s", 30], ["plancha_subidas", 4, "12", 30], ["salto_tijera", 4, "40", 30]],
      [["burpees", 5, "12", 45], ["sentadilla_salto", 5, "15", 45], ["rodillas_altas", 5, "45s", 30], ["escaladores", 5, "30", 30], ["plancha_subidas", 4, "14", 30], ["inchworm", 4, "8", 45]],
    ],
  },
};

const MIN_REST = 20;

// Reglas (simples y a propósito fáciles de leer / ajustar):
//  fuerza       -> el último ejercicio del día pasa a ser trabajo de fuerza del
//                  nivel (empuje, tracción o pierna a una pierna) y los dos
//                  primeros ejercicios descansan 15 s más.
//  resistencia  -> el último ejercicio pasa a ser cardio y todos los descansos
//                  se acortan 10 s.
//  perdida_peso -> el último ejercicio pasa a ser cardio y se AGREGA un bloque
//                  cardio extra al final (6 ejercicios), con descansos 10 s
//                  más cortos: más gasto calórico por sesión.
function applyObjective(items, nivel, week, dayIndex, objetivo) {
  const out = items.map((i) => [...i]);
  const w = week - 1;

  function pick(pool, offset) {
    for (let k = 0; k < pool.length; k++) {
      const cand = pool[(dayIndex + w * 2 + offset + k) % pool.length];
      if (!out.some((i) => i[0] === cand[0])) return [...cand];
    }
    return null;
  }

  if (objetivo === "fuerza") {
    out.pop();
    const extra = pick(POOLS[nivel].fuerza[w], 0);
    out.push(extra || items[items.length - 1]);
    out[0][3] += 15;
    out[1][3] += 15;
  } else if (objetivo === "resistencia") {
    out.pop();
    const extra = pick(POOLS[nivel].cardio[w], 0);
    out.push(extra || items[items.length - 1]);
    out.forEach((i) => (i[3] = Math.max(MIN_REST, i[3] - 10)));
  } else if (objetivo === "perdida_peso") {
    out.pop();
    const a = pick(POOLS[nivel].cardio[w], 0);
    out.push(a || items[items.length - 1]);
    const b = pick(POOLS[nivel].cardio[w], 3);
    if (b) out.push(b);
    out.forEach((i) => (i[3] = Math.max(MIN_REST, i[3] - 10)));
  }
  return out;
}

function toItem([exercise_id, sets, reps, rest]) {
  let r = String(reps);
  let perSide = false;
  let seconds = false;
  if (r.endsWith("L")) { perSide = true; r = r.slice(0, -1); }
  if (r.endsWith("s")) { seconds = true; r = r.slice(0, -1); }
  const item = { exercise_id, sets, reps: r, rest_seconds: rest };
  if (seconds && perSide) item.reps_unit = "segundos_por_lado";
  else if (seconds) item.reps_unit = "segundos";
  else if (perSide) item.reps_unit = "por_lado";
  return item;
}

const OBJETIVOS = ["fuerza", "resistencia", "perdida_peso"];
const WEEKS = 3;
const TOTAL_DAYS = WEEKS * 7; // 21

function buildProgram(nivel, objetivo) {
  const base = NIVELES[nivel];
  const days = [];
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const week = Math.floor((day - 1) / 7) + 1;
    const dayInWeek = ((day - 1) % 7) + 1;

    if (dayInWeek === 7) {
      days.push({
        id: `dia-${day}`, day, week,
        title: `Día ${day} - Recuperación activa`,
        is_recovery_day: true,
        motivational_message: "Recuperar también es entrenar. Estira, camina, hidrátate y vuelve más fuerte mañana.",
        exercises: RECOVERY[nivel].map(toItem),
      });
      continue;
    }

    const plantilla = applyObjective(base[week][dayInWeek - 1], nivel, week, dayInWeek - 1, objetivo);
    days.push({
      id: `dia-${day}`, day, week,
      title: `Día ${day} - Semana ${week}`,
      is_recovery_day: false,
      motivational_message: motivational_messages[(day - 1) % motivational_messages.length],
      exercises: plantilla.map(toItem),
    });
  }
  return days;
}

const programs = {};
for (const nivel of Object.keys(NIVELES)) {
  for (const objetivo of OBJETIVOS) {
    programs[`${nivel}__${objetivo}`] = { nivel, objetivo, routines: buildProgram(nivel, objetivo) };
  }
}

// ---------------------------------------------------------------------------
// Validaciones: mejor que el generador falle aquí a que falle un usuario.
// ---------------------------------------------------------------------------
const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
const errors = [];

for (const e of exercises) {
  if (e.no_equipment_variation_id && !byId[e.no_equipment_variation_id]) {
    errors.push(`${e.id}: la variación sin equipo "${e.no_equipment_variation_id}" no existe`);
  }
  const needsAlt = e.equipment_needed.some((q) => q === "barra" || q === "silla_o_banco");
  if (needsAlt && !e.no_equipment_variation_id) {
    errors.push(`${e.id}: pide ${e.equipment_needed.join(",")} pero no tiene alternativa sin equipo`);
  }
}

const used = new Set();
for (const [key, prog] of Object.entries(programs)) {
  for (const r of prog.routines) {
    const seen = new Set();
    for (const item of r.exercises) {
      const e = byId[item.exercise_id];
      if (!e) { errors.push(`${key} día ${r.day}: ejercicio inexistente "${item.exercise_id}"`); continue; }
      if (seen.has(item.exercise_id)) errors.push(`${key} día ${r.day}: "${item.exercise_id}" repetido en el mismo día`);
      seen.add(item.exercise_id);
      used.add(item.exercise_id);
      if (e.no_equipment_variation_id) used.add(e.no_equipment_variation_id);
    }
  }
}
if (errors.length) {
  console.error("ERRORES en el contenido:\n - " + errors.join("\n - "));
  process.exit(1);
}

// Solo se publica el catálogo que realmente se usa (menos clips que grabar).
const unused = exercises.filter((e) => !used.has(e.id)).map((e) => e.id);
const catalog = exercises.filter((e) => used.has(e.id));

// --- Videos ---
// Los 26 ejercicios originales conservan por ahora su GIF de referencia
// (gif-map.json, generado con build-gif-map.js). Esos GIFs son TEMPORALES: no
// muestran siempre la técnica correcta y su repo no tiene licencia, así que se
// van a reemplazar por clips propios (.mp4) — ver lista_ejercicios.md.
// Los ejercicios nuevos quedan con video_url null y la app muestra un recuadro
// "VIDEO: NOMBRE" hasta que exista el clip.
const gifMapPath = path.join(__dirname, "gif-map.json");
let gifMap = {};
if (fs.existsSync(gifMapPath)) {
  gifMap = JSON.parse(fs.readFileSync(gifMapPath, "utf-8"));
}
// Sin variante bodyweight en el dataset fuente: el GIF es de otro equipo y
// solo sirve como referencia visual del movimiento.
const APPROXIMATE_MATCH = new Set(["sentadilla_sumo", "zancada_lateral"]);

for (const e of catalog) {
  const match = gifMap[e.id];
  if (!match) continue;
  e.video_url = match.gifUrl;
  e.video_source = "JahelCuadrado/ExerciseGymGifsDB (temporal, ver lista_ejercicios.md)";
  if (APPROXIMATE_MATCH.has(e.id)) e.video_is_approximate = true;
}

// Clips propios: deja <id>.mp4 (o .webm/.mov) en frontend/public/videos/ y
// corre `npm run generate-data` — el clip reemplaza al GIF temporal y se sirve
// como /videos/<id>.mp4. Para alojarlos fuera (CDN), usa video-map.json:
// { "flexiones": "https://mi-cdn.com/flexiones.mp4" } (tiene prioridad).
const videosDir = path.join(__dirname, "..", "..", "..", "frontend", "public", "videos");
const videoMapPath = path.join(__dirname, "video-map.json");
const videoMap = fs.existsSync(videoMapPath) ? JSON.parse(fs.readFileSync(videoMapPath, "utf-8")) : {};
let ownClips = 0;
for (const e of catalog) {
  let url = videoMap[e.id] || null;
  if (!url) {
    const ext = ["mp4", "webm", "mov"].find((x) => fs.existsSync(path.join(videosDir, `${e.id}.${x}`)));
    if (ext) url = `/videos/${e.id}.${ext}`;
  }
  if (!url) continue;
  e.video_url = url;
  e.video_source = "propio";
  delete e.video_is_approximate;
  ownClips++;
}

fs.writeFileSync(path.join(__dirname, "exercises.json"), JSON.stringify(catalog, null, 2));
fs.writeFileSync(path.join(__dirname, "programs.json"), JSON.stringify(programs, null, 2));

const withGif = catalog.filter((e) => e.video_url).length;
console.log(`OK: ${catalog.length} ejercicios en catálogo, ${Object.keys(programs).length} programas de ${TOTAL_DAYS} días.`);
console.log(`   Clips propios: ${ownClips} · con GIF temporal: ${catalog.filter((e) => e.video_source && e.video_source !== "propio").length} · sin clip todavía: ${catalog.length - withGif}`);
if (unused.length) console.log(`   Definidos pero sin usar (no se publican): ${unused.join(", ")}`);
