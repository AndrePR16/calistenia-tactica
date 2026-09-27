import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, ChevronRight, Flame } from "lucide-react";
import { Shell, C, stencil, mono } from "../theme.jsx";
import { api, setToken } from "../lib/api.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [days, setDays] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDays()
      .then((resp) => setDays(resp.days))
      .catch((err) => {
        if (err.message.includes("autenticación") || err.message.includes("inválido")) {
          setToken(null);
          navigate("/login");
        } else {
          setError(err.message);
        }
      });
  }, [navigate]);

  const completedCount = days ? days.filter((d) => d.status === "completado").length : 0;

  return (
    <Shell>
      <div
        style={{
          padding: "24px 24px 16px",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ ...stencil, fontSize: 20, margin: 0 }}>Tu programa</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.amber }}>
          <Flame size={18} />
          <span style={{ ...mono, fontSize: 14 }}>{completedCount}</span>
        </div>
      </div>

      <div style={{ padding: "16px 16px 24px" }}>
        {error && <p style={{ color: C.danger, fontSize: 13 }}>{error}</p>}
        {!days && !error && <p style={{ color: C.muted, fontSize: 13 }}>Cargando...</p>}

        {days &&
          days.map((d) => {
            const locked = d.status === "bloqueado";
            const done = d.status === "completado";
            return (
              <button
                key={d.day}
                disabled={locked}
                onClick={() => navigate(`/routine/${d.day}`)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: done ? "rgba(143,163,91,0.08)" : "transparent",
                  border: `1px solid ${C.line}`,
                  borderRadius: 4,
                  padding: "12px 14px",
                  marginBottom: 8,
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.45 : 1,
                  textAlign: "left",
                }}
              >
                <span style={{ ...mono, fontSize: 12, color: C.muted, width: 40 }}>
                  DÍA {String(d.day).padStart(2, "0")}
                </span>
                <span style={{ flex: 1, fontSize: 14 }}>
                  {d.is_recovery_day ? "Recuperación activa" : d.title}
                </span>
                {done ? (
                  <CheckCircle2 size={18} color={C.moss} />
                ) : locked ? (
                  <Lock size={16} color={C.muted} />
                ) : (
                  <ChevronRight size={18} color={C.amber} />
                )}
              </button>
            );
          })}
      </div>
    </Shell>
  );
}
