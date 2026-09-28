import React from "react";

export const C = {
  ink: "#14170F",
  panel: "#1E2318",
  panel2: "#262C1E",
  line: "#3A4130",
  sand: "#ECE8D9",
  moss: "#8FA35B",
  mossDark: "#5E7038",
  amber: "#D9A441",
  muted: "#8D9280",
  danger: "#C0664A",
};

export const stencil = {
  fontFamily: "'Big Shoulders Stencil', sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

export const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export const inputStyle = {
  width: "100%",
  background: C.panel2,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  padding: "10px 12px",
  color: C.sand,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'IBM Plex Sans', sans-serif",
};

export const buttonPrimary = {
  width: "100%",
  background: C.moss,
  color: "#14170F",
  border: "none",
  borderRadius: 4,
  padding: "13px 0",
  fontFamily: "'IBM Plex Mono', monospace",
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: "0.05em",
  cursor: "pointer",
};

export const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Stencil:wght@700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; background: ${C.ink}; }

    .ct-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: ${C.line};
      outline: none;
    }
    .ct-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${C.moss};
      border: 3px solid ${C.ink};
      box-shadow: 0 0 0 1px ${C.moss};
      cursor: pointer;
    }
    .ct-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${C.moss};
      border: 3px solid ${C.ink};
      box-shadow: 0 0 0 1px ${C.moss};
      cursor: pointer;
    }
    @keyframes ct-spin { to { transform: rotate(360deg); } }
    @keyframes ct-pulse-dot { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
  `}</style>
);

/** Círculo de ícono usado en el encabezado de cada tarjeta de paso. */
export function StepIcon({ children }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `1px solid ${C.moss}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 14px",
        color: C.moss,
      }}
    >
      {children}
    </div>
  );
}

/** Barra fina de progreso arriba de cada paso del wizard, + "PASO X // Y". */
export function WizardProgress({ step, total }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ height: 3, borderRadius: 2, background: C.line, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(step / total) * 100}%`,
            background: C.moss,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <p style={{ textAlign: "right", fontSize: 10, color: C.muted, margin: "6px 0 0", ...mono, letterSpacing: "0.05em" }}>
        PASO {String(step).padStart(2, "0")} // {String(total).padStart(2, "0")}
      </p>
    </div>
  );
}

/**
 * Envoltorio de cada paso del wizard de onboarding: barra de progreso,
 * ícono + título + subtítulo centrados, contenido libre, y footer con
 * "volver" / botón principal.
 */
export function WizardStep({ step, total, icon, title, subtitle, children, onBack, footer }) {
  return (
    <div style={{ padding: "24px 24px 28px" }}>
      <WizardProgress step={step} total={total} />
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <StepIcon>{icon}</StepIcon>
        <h2 style={{ ...stencil, fontSize: 20, margin: "0 0 4px" }}>{title}</h2>
        {subtitle && (
          <p style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: "0.06em", margin: 0 }}>
            {subtitle.toUpperCase()}
          </p>
        )}
      </div>

      {children}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "10px 4px" }}
          >
            ‹
          </button>
        ) : (
          <div style={{ width: 20 }} />
        )}
        <div style={{ flex: 1 }}>{footer}</div>
      </div>
    </div>
  );
}

/** Slider grande estilo "biometría": número gigante + rango con min/max. */
export function BigSlider({ value, unit, min, max, onChange }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <span style={{ ...stencil, fontSize: 52, lineHeight: 1 }}>{value}</span>
        <span style={{ ...mono, fontSize: 14, color: C.muted, marginLeft: 6 }}>{unit}</span>
      </div>
      <input
        className="ct-slider"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: C.muted }}>{min} {unit}</span>
        <span style={{ ...mono, fontSize: 11, color: C.muted }}>{max} {unit}</span>
      </div>
    </div>
  );
}

/** Tarjeta seleccionable de una lista (clasificación, objetivo, experiencia). */
export function ChoiceCard({ title, desc, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        marginBottom: 10,
        borderRadius: 6,
        cursor: "pointer",
        border: `1px solid ${selected ? C.moss : C.line}`,
        background: selected ? "rgba(143,163,91,0.12)" : "transparent",
        borderLeft: `3px solid ${selected ? C.moss : C.line}`,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? C.sand : C.sand }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{desc}</div>}
      </div>
      {selected && <span style={{ color: C.moss, fontSize: 16 }}>✓</span>}
    </button>
  );
}

/**
 * Pantalla de "procesando" entre el wizard y el resultado: anillo animado,
 * mensajes que rotan, y una barra de progreso INICIO DE SISTEMA -> OPTIMIZACIÓN.
 * Puramente cosmético (no hay cálculo pesado detrás), pero refuerza la
 * identidad "táctica" de la app en el momento de más expectativa.
 */
export function ProcessingScreen({ icon, messages, durationMs = 2600, onDone }) {
  const [pct, setPct] = React.useState(0);
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    const stepMs = 60;
    const totalSteps = durationMs / stepMs;
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setPct(Math.min(100, Math.round((count / totalSteps) * 100)));
      setMsgIndex(Math.min(messages.length - 1, Math.floor((count / totalSteps) * messages.length)));
      if (count >= totalSteps) {
        clearInterval(interval);
        onDone && onDone();
      }
    }, stepMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs]);

  const angle = (pct / 100) * 360;

  return (
    <div style={{ padding: "56px 28px", textAlign: "center" }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          margin: "0 auto 20px",
          position: "relative",
          background: `conic-gradient(${C.moss} ${angle}deg, ${C.line} ${angle}deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: C.ink,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            color: C.moss,
          }}
        >
          {icon}
          <span style={{ ...mono, fontSize: 11, color: C.muted }}>{pct}%</span>
        </div>
      </div>

      <h2 style={{ ...stencil, fontSize: 19, margin: "0 0 10px", minHeight: 48 }}>
        {messages[msgIndex]}
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 22 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.moss,
              display: "inline-block",
              animation: "ct-pulse-dot 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, ...mono, marginBottom: 4 }}>
        <span>INICIO DE SISTEMA</span>
        <span>OPTIMIZACIÓN</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.panel2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.moss}, ${C.amber})` }} />
      </div>

      <div
        style={{
          marginTop: 24,
          border: `1px solid ${C.amber}`,
          background: "rgba(217,164,65,0.08)",
          borderRadius: 6,
          padding: "10px 12px",
          fontSize: 11,
          color: C.amber,
          ...mono,
        }}
      >
        ⚠ NO SALGAS DE ESTA PANTALLA — ESPERA A QUE TERMINE
      </div>
    </div>
  );
}

export function Shell({ children }) {
  return (
    <div style={{ background: "#0A0B08", minHeight: "100vh", padding: 24 }}>
      <FontImport />
      <div
        style={{
          maxWidth: 460,
          margin: "0 auto",
          background: C.ink,
          color: C.sand,
          fontFamily: "'IBM Plex Sans', sans-serif",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${C.line}`,
          minHeight: 500,
        }}
      >
        {children}
      </div>
    </div>
  );
}
