// Lógica de recomendación (US-06). Reglas simples, sin IA: fácil de auditar
// y de ajustar a mano según lo que veas en tus primeras pruebas.
//
// Decisión de diseño importante: la silueta corporal (US-05) y el peso/estatura
// NO se usan para decidir qué tan difícil es la rutina. Usar el cuerpo de
// alguien para "colocarlo" en un nivel más fácil o más difícil es justamente
// el tipo de suposición que puede sentirse ofensiva o desmotivante, y además
// no es un buen indicador de capacidad real. Lo que sí decide el nivel de
// partida es la experiencia previa, que es un dato objetivo y neutral.
// Peso/estatura/silueta se guardan igual (para reportes futuros, o para que
// más adelante ajustes textos de la app), pero no cambian el contenido.

// La experiencia previa decide el NIVEL del programa (cada nivel es un
// programa completo de 21 días que arranca en el día 1). El objetivo decide
// el énfasis dentro de ese nivel (ver generate-data.js, applyObjective).
// Antes, "entrené antes" solo prometía "saltar al día 8" pero nunca se aplicaba
// y todos recibían la misma rutina; eso se reemplazó por programas distintos.
const EXPERIENCIA_A_NIVEL = {
  nunca_entrene: "base",
  entrene_antes: "intermedio",
  entreno_actualmente: "avanzado",
};

const NIVEL_INFO = {
  base: {
    label: "Base",
    mensaje:
      "Como es tu primera vez entrenando, tu programa es el Nivel Base: aprendes la técnica y construyes la base sin lesionarte.",
  },
  intermedio: {
    label: "Intermedio",
    mensaje:
      "Como ya entrenaste antes, tu programa es el Nivel Intermedio: remo y dominadas negativas (con barra o alternativa sin equipo), sentadillas asistidas a una pierna y progresiones de flexiones desde el día 1.",
  },
  avanzado: {
    label: "Avanzado",
    mensaje:
      "Como entrenas actualmente, tu programa es el Nivel Avanzado: dominadas, pistol squat, flexiones arquero y circuitos de alta intensidad desde el día 1.",
  },
};

const OBJETIVO_MENSAJE = {
  fuerza:
    "Priorizamos fuerza: cada día cierra con trabajo de empuje, tracción o pierna a una pierna, y descansas más entre series.",
  resistencia:
    "Priorizamos resistencia: cada día cierra con cardio y los descansos entre series son más cortos.",
  perdida_peso:
    "Priorizamos gasto calórico: sumamos un bloque de cardio extra al final de cada día y descansas menos entre series.",
};

const SILUETA_OPCIONES = ["delgado", "promedio", "atletico", "contextura_mayor"];
const OBJETIVO_OPCIONES = ["fuerza", "resistencia", "perdida_peso"];
const EXPERIENCIA_OPCIONES = ["nunca_entrene", "entrene_antes", "entreno_actualmente"];

// "Clasificación de operador": igual que la silueta, es una etiqueta que el
// usuario elige para su propia identidad/motivación dentro de la app, pero
// NO decide el contenido de la rutina — el punto de partida sigue
// dependiendo únicamente de la experiencia previa (ver comentario arriba).
const TIPO_OPERADOR_OPCIONES = ["muscular", "atletico", "potencia", "agil"];
const TIPO_OPERADOR_INFO = {
  muscular: { label: "Muscular", desc: "Alto enfoque en hipertrofia" },
  atletico: { label: "Atlético", desc: "Resistencia y fuerza equilibrada" },
  potencia: { label: "Potencia", desc: "Salida de fuerza máxima" },
  agil: { label: "Ágil", desc: "Alta movilidad y definición" },
};

function nivelPara(experiencia) {
  return EXPERIENCIA_A_NIVEL[experiencia] || "base";
}

// Clave del programa en programs.json. Se calcula siempre desde las respuestas
// del perfil (no desde la recomendación guardada) para que sea robusta si el
// perfil se guardó con una versión anterior de las reglas.
function programKey({ experiencia, objetivo }) {
  const obj = OBJETIVO_OPCIONES.includes(objetivo) ? objetivo : "fuerza";
  return `${nivelPara(experiencia)}__${obj}`;
}

function recomendar({ objetivo, experiencia }) {
  const nivel = nivelPara(experiencia);
  const info = NIVEL_INFO[nivel];
  const objetivoTexto = OBJETIVO_MENSAJE[objetivo] || "";

  return {
    nivel,
    nivelLabel: info.label,
    programKey: programKey({ experiencia, objetivo }),
    startDay: 1,
    message: `${info.mensaje} ${objetivoTexto}`.trim(),
  };
}

module.exports = {
  recomendar,
  programKey,
  nivelPara,
  NIVEL_INFO,
  SILUETA_OPCIONES,
  OBJETIVO_OPCIONES,
  EXPERIENCIA_OPCIONES,
  TIPO_OPERADOR_OPCIONES,
  TIPO_OPERADOR_INFO,
};
