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

const EXPERIENCIA_A_SEMANA = {
  nunca_entrene: 1,
  entrene_antes: 2,
  entreno_actualmente: 3,
};

const OBJETIVO_MENSAJE = {
  fuerza: "Vamos a priorizar tu progreso en dominadas, flexiones y fuerza de tren superior.",
  resistencia: "Vamos a priorizar los circuitos cardio y reducir el descanso entre series.",
  perdida_peso: "Vamos a mantenerte en movimiento constante con más ejercicios full-body.",
};

const SILUETA_OPCIONES = ["delgado", "promedio", "atletico", "contextura_mayor"];
const OBJETIVO_OPCIONES = ["fuerza", "resistencia", "perdida_peso"];
const EXPERIENCIA_OPCIONES = ["nunca_entrene", "entrene_antes", "entreno_actualmente"];

function recomendar({ objetivo, experiencia }) {
  const startWeek = EXPERIENCIA_A_SEMANA[experiencia] || 1;
  const startDay = (startWeek - 1) * 7 + 1;
  const objetivoTexto = OBJETIVO_MENSAJE[objetivo] || "";

  const experienciaTexto = {
    1: "Como es tu primera vez entrenando, arrancas en la Semana 1 para construir la base sin lesionarte.",
    2: "Como ya entrenaste antes, arrancas en la Semana 2 — saltamos lo más básico.",
    3: "Como entrenas actualmente, arrancas en la Semana 3 para que el reto esté a tu nivel real.",
  }[startWeek];

  return {
    startWeek,
    startDay,
    message: `${experienciaTexto} ${objetivoTexto}`.trim(),
  };
}

module.exports = {
  recomendar,
  SILUETA_OPCIONES,
  OBJETIVO_OPCIONES,
  EXPERIENCIA_OPCIONES,
};
