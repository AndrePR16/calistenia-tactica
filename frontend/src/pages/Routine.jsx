import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Play, ArrowRight, Award } from "lucide-react";
import { Shell, C, stencil, mono } from "../theme.jsx";
import { api } from "../lib/api.js";

// Hoy el catálogo usa GIFs de referencia; cuando se reemplacen por clips
// reales (ver lista_ejercicios.md) alcanza con cambiar video_url en
// exercises.json a un .mp4/.webm/.mov — esto detecta el formato y usa
// <video> en loop en vez de <img>, sin tocar nada más.
function isVideoFile(url) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

// "segundos", "por_lado", "segundos_por_lado" (ver generate-data.js)
function formatReps(item) {
  const unit = item.reps_unit || "";
  return item.reps + (unit.includes("segundos") ? "s" : "") + (unit.includes("lado") ? " c/lado" : "");
}

function equipmentLabel(ex) {
  return (ex.equipment_needed[0] || "").replace(/_/g, " ").toUpperCase();
}

export default function Routine() {
  const { day } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [exIndex, setExIndex] = useState(0);
  const [tabState, setTabState] = useState({});
  const [showStamp, setShowStamp] = useState(false);

  useEffect(() => {
    setExIndex(0);
    api
      .getDay(day)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [day]);

  if (error) {
    return (
      <Shell>
        <div style={{ padding: 28 }}>
          <p style={{ color: C.danger }}>{error}</p>
          <button onClick={() => navigate("/dashboard")} style={{ color: C.moss, background: "none", border: "none", cursor: "pointer" }}>
            Volver al dashboard
          </button>
        </div>
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell>
        <p style={{ padding: 28, color: C.muted }}>Cargando...</p>
      </Shell>
    );
  }

  const currentItem = data.exercises[exIndex];
  const activeTab = tabState[currentItem.exercise_id] || "con";
  const shownEx = currentItem.variation && activeTab === "sin" ? currentItem.variation : currentItem.exercise;

  async function nextExercise() {
    if (exIndex < data.exercises.length - 1) {
      setExIndex(exIndex + 1);
      return;
    }
    await api.completeDay(day);
    setShowStamp(true);
    setTimeout(() => navigate("/dashboard"), 1400);
  }

  return (
    <Shell>
      <div style={{ padding: "20px 20px 0", position: "relative" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: 0, marginBottom: 12 }}
        >
          <ChevronLeft size={14} /> Volver
        </button>

        <p style={{ fontSize: 11, color: C.amber, letterSpacing: "0.05em", margin: 0, ...mono }}>
          DÍA {String(data.day).padStart(2, "0")}
        </p>
        <h2 style={{ ...stencil, fontSize: 22, margin: "2px 0 12px" }}>{data.title}</h2>

        <div style={{ borderLeft: `2px solid ${C.moss}`, paddingLeft: 12, marginBottom: data.needs_bar ? 12 : 20, fontSize: 13, fontStyle: "italic" }}>
          "{data.motivational_message}"
        </div>

        {data.needs_bar && (
          <div style={{ border: `1px solid ${C.amber}`, borderRadius: 4, padding: "8px 10px", marginBottom: 20, fontSize: 12, color: C.amber, lineHeight: 1.4, ...mono }}>
            DÍA DE BARRA · Lleva este entrenamiento al parque. Si no tienes barra, toca “SIN EQUIPO” en cada ejercicio y haz la alternativa.
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {data.exercises.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < exIndex ? C.moss : i === exIndex ? C.amber : C.line }} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 16, ...mono }}>
          EJERCICIO {exIndex + 1} DE {data.exercises.length}
        </p>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        {currentItem.variation && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setTabState({ ...tabState, [currentItem.exercise_id]: "con" })}
              style={{ flex: 1, padding: "8px 0", borderRadius: 4, border: `1px solid ${activeTab === "con" ? C.moss : C.line}`, background: activeTab === "con" ? C.mossDark : "transparent", color: C.sand, fontSize: 12, cursor: "pointer", ...mono }}
            >
              CON {equipmentLabel(currentItem.exercise)}
            </button>
            <button
              onClick={() => setTabState({ ...tabState, [currentItem.exercise_id]: "sin" })}
              style={{ flex: 1, padding: "8px 0", borderRadius: 4, border: `1px solid ${activeTab === "sin" ? C.moss : C.line}`, background: activeTab === "sin" ? C.mossDark : "transparent", color: C.sand, fontSize: 12, cursor: "pointer", ...mono }}
            >
              SIN EQUIPO
            </button>
          </div>
        )}

        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ position: "relative", paddingBottom: "56%", background: C.panel2, borderBottom: `1px solid ${C.line}` }}>
            {shownEx.video_url && isVideoFile(shownEx.video_url) ? (
              <video
                key={shownEx.video_url}
                src={shownEx.video_url}
                autoPlay
                loop
                muted
                playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
              />
            ) : shownEx.video_url ? (
              <img
                key={shownEx.video_url}
                src={shownEx.video_url}
                alt={shownEx.name}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${C.moss}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={18} color={C.moss} fill={C.moss} />
                </div>
                <span style={{ fontSize: 11, ...mono }}>VIDEO: {shownEx.name.toUpperCase()}</span>
              </div>
            )}
            {shownEx.video_is_approximate && (
              <span
                style={{
                  position: "absolute", bottom: 6, left: 6, background: "rgba(10,11,8,0.85)",
                  color: C.amber, fontSize: 9, padding: "3px 6px", borderRadius: 3, ...mono,
                }}
              >
                {shownEx.video_url && isVideoFile(shownEx.video_url) ? "VIDEO DE REFERENCIA" : "GIF DE REFERENCIA"}
              </span>
            )}
          </div>

          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 17, margin: "0 0 8px" }}>{shownEx.name}</h3>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: "0 0 16px" }}>{shownEx.instructions}</p>

            <div style={{ display: "flex", gap: 8, ...mono }}>
              {[
                ["SERIES", currentItem.sets],
                ["REPS", formatReps(currentItem)],
                ["DESCANSO", `${currentItem.rest_seconds}s`],
              ].map(([label, val]) => (
                <div key={label} style={{ flex: 1, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, textAlign: "center", padding: "8px 4px" }}>
                  <div style={{ fontSize: 10, color: C.muted }}>{label}</div>
                  <div style={{ fontSize: 16, color: C.amber, fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={nextExercise}
          style={{ width: "100%", marginTop: 16, background: C.moss, color: "#14170F", border: "none", borderRadius: 4, padding: "13px 0", fontWeight: 500, fontSize: 14, letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...mono }}
        >
          {exIndex < data.exercises.length - 1 ? (
            <>SERIE COMPLETA · SIGUIENTE <ArrowRight size={16} /></>
          ) : (
            <>FINALIZAR RUTINA <Award size={16} /></>
          )}
        </button>
      </div>

      {showStamp && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,8,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ border: `3px solid ${C.amber}`, borderRadius: 8, padding: "20px 32px", transform: "rotate(-6deg)", textAlign: "center" }}>
            <div style={{ ...stencil, fontSize: 22, color: C.amber }}>Misión cumplida</div>
          </div>
        </div>
      )}
    </Shell>
  );
}
