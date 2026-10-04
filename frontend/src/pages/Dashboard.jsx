import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Lock, ChevronRight, Flame, User, Pencil,
  Play, UtensilsCrossed, Moon, MessageCircle, Swords,
} from "lucide-react";
import { Shell, C, stencil, mono } from "../theme.jsx";
import { api, setToken } from "../lib/api.js";

const TIPO_COLOR = {
  Fuerza: C.moss,
  Mixto: C.amber,
  HIIT: C.danger,
  "Recuperación": C.muted,
};

const TIPO_OPERADOR_LABELS = {
  muscular: "Muscular",
  atletico: "Atlético",
  potencia: "Potencia",
  agil: "Ágil",
};

function DayTile({ d, onOpen }) {
  const locked = d.status === "bloqueado";
  const done = d.status === "completado";
  const color = TIPO_COLOR[d.tipo] || C.moss;
  return (
    <button
      disabled={locked}
      onClick={() => onOpen(d.day)}
      style={{
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: done ? "rgba(143,163,91,0.08)" : C.panel,
        border: `1px solid ${done ? C.moss : C.line}`,
        borderTop: `3px solid ${locked ? C.line : color}`,
        borderRadius: 6,
        padding: "8px 8px",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.4 : 1,
        textAlign: "left",
      }}
    >
      <span style={{ ...mono, fontSize: 10, color: C.muted }}>
        DÍA {String(d.day).padStart(2, "0")}
      </span>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, ...mono, color, letterSpacing: "0.03em" }}>
          {d.is_recovery_day ? "R.ACTIVA" : d.tipo?.toUpperCase()}
        </span>
        {done ? (
          <CheckCircle2 size={14} color={C.moss} />
        ) : locked ? (
          <Lock size={12} color={C.muted} />
        ) : (
          <ChevronRight size={14} color={C.amber} />
        )}
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [days, setDays] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([api.getDays(), api.getProfile().catch(() => ({ profile: null }))])
      .then(([daysResp, profileResp]) => {
        setDays(daysResp.days);
        setProfile(profileResp.profile);
      })
      .catch((err) => {
        if (err.message.includes("autenticación") || err.message.includes("inválido")) {
          setToken(null);
          navigate("/login");
        } else {
          setError(err.message);
        }
      });
  }, [navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  const completedCount = days ? days.filter((d) => d.status === "completado").length : 0;
  const totalDays = days ? days.length : 30;
  const nextDay = days ? days.find((d) => d.status === "disponible") : null;
  const allDone = days && !nextDay && completedCount === totalDays;

  return (
    <Shell wide>
    <div className="ct-dash">
      {/* Header de perfil */}
      <div
        className="ct-dash-header"
        style={{
          padding: "18px 20px",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: C.panel2, border: `1px solid ${C.moss}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <User size={18} color={C.moss} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ ...stencil, fontSize: 15, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile?.nombre || "Recluta"}
            </p>
            <p style={{ ...mono, fontSize: 10, color: C.muted, margin: 0 }}>
              {TIPO_OPERADOR_LABELS[profile?.tipo_operador] || "Sin clasificar"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {profile?.peso && (
            <div style={{ textAlign: "center", ...mono }}>
              <div style={{ fontSize: 13, color: C.sand }}>{profile.peso}k</div>
              <div style={{ fontSize: 8, color: C.muted }}>ACTUAL</div>
            </div>
          )}
          {profile?.peso_objetivo && (
            <div style={{ textAlign: "center", ...mono }}>
              <div style={{ fontSize: 13, color: C.amber }}>{profile.peso_objetivo}k</div>
              <div style={{ fontSize: 8, color: C.muted }}>META</div>
            </div>
          )}
          <button
            onClick={() => navigate("/onboarding")}
            title="Editar perfil"
            style={{
              width: 30, height: 30, borderRadius: 4, border: `1px solid ${C.line}`,
              background: "transparent", color: C.muted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      <div className="ct-dash-main">
      {/* Hero: desafío */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ ...mono, fontSize: 10, color: C.moss, letterSpacing: "0.08em", margin: "0 0 2px" }}>
          MISIÓN ACTIVA
        </p>
        <h1 style={{ ...stencil, fontSize: 30, margin: 0, lineHeight: 1 }}>DESAFÍO</h1>
        <h1 style={{ ...stencil, fontSize: 30, margin: 0, lineHeight: 1.1, color: C.moss }}>{totalDays} DÍAS</h1>
        <p style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", margin: "4px 0 14px" }}>
          — CALISTENIA MILITAR
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ ...mono, fontSize: 11, color: C.muted }}>PROGRESO</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.amber }}>
            <Flame size={14} />
            <span style={{ ...mono, fontSize: 12 }}>{completedCount}/{totalDays}</span>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: C.panel2, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${(completedCount / totalDays) * 100}%`, background: `linear-gradient(90deg, ${C.moss}, ${C.amber})` }} />
        </div>
      </div>

      {/* Protocolo activo */}
      <div style={{ padding: "0 20px 20px" }}>
        {error && <p style={{ color: C.danger, fontSize: 13 }}>{error}</p>}
        {!days && !error && <p style={{ color: C.muted, fontSize: 13 }}>Cargando...</p>}

        {nextDay && (
          <div
            style={{
              background: `linear-gradient(135deg, ${C.panel2}, ${C.panel})`,
              border: `1px solid ${TIPO_COLOR[nextDay.tipo] || C.moss}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <p style={{ ...mono, fontSize: 10, color: TIPO_COLOR[nextDay.tipo] || C.moss, letterSpacing: "0.06em", margin: 0 }}>
                  PROTOCOLO · DÍA {String(nextDay.day).padStart(2, "0")}
                </p>
                <h3 style={{ ...stencil, fontSize: 18, margin: "4px 0 0" }}>
                  {nextDay.is_recovery_day ? "Recuperación activa" : nextDay.title}
                </h3>
              </div>
              <span
                style={{
                  ...mono, fontSize: 10, padding: "4px 8px", borderRadius: 4,
                  border: `1px solid ${TIPO_COLOR[nextDay.tipo] || C.moss}`,
                  color: TIPO_COLOR[nextDay.tipo] || C.moss,
                }}
              >
                {nextDay.tipo?.toUpperCase()}
              </span>
            </div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, margin: "0 0 14px" }}>
              {nextDay.exercise_count} EJERCICIOS · ~30 MIN
            </p>
            <button
              onClick={() => navigate(`/routine/${nextDay.day}`)}
              style={{
                width: "100%", background: C.moss, color: "#14170F", border: "none",
                borderRadius: 4, padding: "12px 0", fontWeight: 600, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...mono,
              }}
            >
              <Play size={15} fill="#14170F" /> INICIAR DÍA
            </button>
          </div>
        )}

        {allDone && (
          <div style={{ background: C.panel2, border: `1px solid ${C.moss}`, borderRadius: 8, padding: 18, textAlign: "center" }}>
            <p style={{ ...stencil, fontSize: 16, margin: 0, color: C.moss }}>MISIÓN CUMPLIDA</p>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Completaste los {totalDays} días. Recluta de élite.</p>
          </div>
        )}
      </div>

      {/* Grid de días */}
      {days && (
        <div style={{ padding: "0 20px 16px" }}>
          <p style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: "0.06em", marginBottom: 10 }}>
            LÍNEA DE TIEMPO DE MISIÓN
          </p>
          <div className="ct-dash-days-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {days.map((d) => (
              <DayTile key={d.day} d={d} onOpen={(day) => navigate(`/routine/${day}`)} />
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Barra de navegación (inferior en móvil, lateral en escritorio) */}
      <div
        className="ct-dash-nav"
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          position: "relative",
        }}
      >
        {toast && (
          <div
            style={{
              position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
              marginBottom: 8, background: C.panel2, border: `1px solid ${C.line}`,
              borderRadius: 4, padding: "6px 12px", fontSize: 11, color: C.sand, ...mono, whiteSpace: "nowrap",
            }}
          >
            {toast}
          </div>
        )}
        <button className="ct-navbtn" onClick={() => navigate("/onboarding")} style={navBtn}>
          <User size={18} color={C.muted} />
          <span className="ct-navlabel" style={navLabel}>PERFIL</span>
        </button>
        <button
          className="ct-navbtn"
          onClick={() => (nextDay ? navigate(`/routine/${nextDay.day}`) : showToast("Ya completaste todos los días"))}
          style={navBtn}
        >
          <Swords size={18} color={C.moss} />
          <span className="ct-navlabel" style={{ ...navLabel, color: C.moss }}>
            {nextDay ? `DÍA ${nextDay.day}` : "HOY"}
          </span>
        </button>
        <button className="ct-navbtn" onClick={() => showToast("Nutrición táctica: próximamente")} style={navBtn}>
          <UtensilsCrossed size={18} color={C.muted} />
          <span className="ct-navlabel" style={navLabel}>NUTRICIÓN</span>
        </button>
        <button className="ct-navbtn" onClick={() => showToast("Protocolo de sueño: próximamente")} style={navBtn}>
          <Moon size={18} color={C.muted} />
          <span className="ct-navlabel" style={navLabel}>SUEÑO</span>
        </button>
        <button className="ct-navbtn" onClick={() => showToast("Asistente táctico: próximamente")} style={navBtn}>
          <MessageCircle size={18} color={C.muted} />
          <span className="ct-navlabel" style={navLabel}>CHAT</span>
        </button>
      </div>
    </div>
    </Shell>
  );
}

const navBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  padding: 4,
};

const navLabel = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 8,
  color: C.muted,
  letterSpacing: "0.04em",
};
