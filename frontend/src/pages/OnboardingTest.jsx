import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User } from "lucide-react";
import { Shell, C, stencil, mono, inputStyle, buttonPrimary } from "../theme.jsx";
import { api } from "../lib/api.js";

const OBJETIVO_LABELS = {
  fuerza: "Fuerza",
  resistencia: "Resistencia",
  perdida_peso: "Perder peso",
};
const EXPERIENCIA_LABELS = {
  nunca_entrene: "Nunca entrené",
  entrene_antes: "Entrené antes",
  entreno_actualmente: "Entreno actualmente",
};
// Siluetas neutrales a propósito: representan una contextura corporal de
// referencia sin usar etiquetas que puedan sonar despectivas o desmotivar
// a quien las lea. El emoji es solo un ícono provisional (mockup); en
// producción esto se reemplaza por una ilustración de silueta.
const SILUETA_LABELS = {
  delgado: "Delgado/a",
  promedio: "Promedio",
  atletico: "Atlético/a",
  contextura_mayor: "Contextura mayor",
};

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span
        style={{
          display: "block",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.muted,
          marginBottom: 6,
          ...mono,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function PillGroup({ options, labels, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            fontSize: 13,
            ...mono,
            border: `1px solid ${value === opt ? C.moss : C.line}`,
            background: value === opt ? C.mossDark : "transparent",
            color: value === opt ? C.sand : C.muted,
            cursor: "pointer",
          }}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

/**
 * US-02 a US-06 (perfil + recomendación) y US-28 (test previo a la compra
 * para visitantes de anuncios). El mismo formulario sirve para ambos casos:
 * - mode="lead": visitante anónimo -> POST /lead-test, termina mostrando el
 *   precio y el botón de compra.
 * - mode="profile": usuario ya logueado -> POST /profile, vuelve al dashboard.
 */
export default function OnboardingTest({ mode = "lead" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const utmSource = searchParams.get("utm_source") || sessionStorage.getItem("ct_utm_source");

  const [form, setForm] = useState({
    peso: "",
    estatura: "",
    edad: "",
    objetivo: "perdida_peso",
    experiencia: "nunca_entrene",
    silueta: "promedio",
  });
  const [step, setStep] = useState("form"); // form | result | purchase | done
  const [recommendation, setRecommendation] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.peso || !form.estatura) {
      setError("Ingresa al menos peso y estatura");
      return;
    }
    setLoading(true);
    try {
      if (mode === "lead") {
        const resp = await api.leadTest({ ...form, utm_source: utmSource });
        setRecommendation(resp.recommendation);
        setLeadId(resp.leadId);
        setStep("result");
      } else {
        const resp = await api.saveProfile(form);
        setRecommendation(resp.profile.recommendation);
        setStep("result");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await api.purchase(email, leadId);
      setPurchaseResult(resp);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div style={{ padding: "40px 28px" }}>
        {step === "form" && (
          <>
            <h2 style={{ ...stencil, fontSize: 22, margin: "0 0 4px" }}>
              {mode === "lead" ? "Antes de ver tu plan" : "Actualizar mi perfil"}
            </h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              Con estos datos armamos tu recomendación. Nada de esto decide qué
              tan "difícil" mereces empezar por tu cuerpo — el punto de partida
              depende de tu experiencia previa, no de tu contextura.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Peso (kg)">
                    <input
                      style={inputStyle}
                      type="number"
                      value={form.peso}
                      onChange={(e) => setForm({ ...form, peso: e.target.value })}
                    />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Estatura (cm)">
                    <input
                      style={inputStyle}
                      type="number"
                      value={form.estatura}
                      onChange={(e) => setForm({ ...form, estatura: e.target.value })}
                    />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Edad">
                    <input
                      style={inputStyle}
                      type="number"
                      value={form.edad}
                      onChange={(e) => setForm({ ...form, edad: e.target.value })}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Objetivo principal">
                <PillGroup
                  options={Object.keys(OBJETIVO_LABELS)}
                  labels={OBJETIVO_LABELS}
                  value={form.objetivo}
                  onChange={(v) => setForm({ ...form, objetivo: v })}
                />
              </Field>

              <Field label="Experiencia previa">
                <PillGroup
                  options={Object.keys(EXPERIENCIA_LABELS)}
                  labels={EXPERIENCIA_LABELS}
                  value={form.experiencia}
                  onChange={(v) => setForm({ ...form, experiencia: v })}
                />
              </Field>

              <Field label="Silueta con la que te identificas hoy">
                <PillGroup
                  options={Object.keys(SILUETA_LABELS)}
                  labels={SILUETA_LABELS}
                  value={form.silueta}
                  onChange={(v) => setForm({ ...form, silueta: v })}
                />
              </Field>

              {error && (
                <p style={{ color: C.danger, fontSize: 12, marginBottom: 12 }}>{error}</p>
              )}

              <button style={buttonPrimary} disabled={loading}>
                {loading ? "CALCULANDO..." : "VER MI RECOMENDACIÓN"}
              </button>
            </form>
          </>
        )}

        {step === "result" && recommendation && (
          <>
            <h2 style={{ ...stencil, fontSize: 22, margin: "0 0 16px" }}>
              Tu plan recomendado
            </h2>
            <div
              style={{
                background: C.panel2,
                border: `1px solid ${C.moss}`,
                borderRadius: 6,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: 11, color: C.amber, margin: 0, ...mono }}>
                SEMANA {recommendation.startWeek} · DÍA {recommendation.startDay}
              </p>
              <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
                {recommendation.message}
              </p>
            </div>

            {mode === "lead" ? (
              <>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                  Programa completo de 30 días — pago único, acceso inmediato.
                </p>
                <button style={buttonPrimary} onClick={() => setStep("purchase")}>
                  QUIERO ESTE PLAN — S/39
                </button>
              </>
            ) : (
              <button style={buttonPrimary} onClick={() => navigate("/dashboard")}>
                IR A MI RUTINA
              </button>
            )}
          </>
        )}

        {step === "purchase" && (
          <>
            <h2 style={{ ...stencil, fontSize: 22, margin: "0 0 16px" }}>
              Un último paso
            </h2>
            <form onSubmit={handlePurchase}>
              <Field label="Tu correo (ahí llegan tus accesos)">
                <input
                  style={inputStyle}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                />
              </Field>
              {error && (
                <p style={{ color: C.danger, fontSize: 12, marginBottom: 12 }}>{error}</p>
              )}
              <button style={buttonPrimary} disabled={loading}>
                {loading ? "PROCESANDO..." : "PAGAR Y RECIBIR ACCESOS"}
              </button>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
                (Demo local: aquí en producción se abre el Checkout de Culqi
                antes de crear la cuenta.)
              </p>
            </form>
          </>
        )}

        {step === "done" && purchaseResult && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: C.panel2,
                border: `2px solid ${C.moss}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <User size={26} color={C.moss} />
            </div>
            <h2 style={{ ...stencil, fontSize: 20, margin: "0 0 8px" }}>
              ¡Listo, {email}!
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              Te acabamos de enviar tu usuario y contraseña por correo.
            </p>

            {purchaseResult.devPassword && (
              <div
                style={{
                  background: C.panel2,
                  border: `1px solid ${C.amber}`,
                  borderRadius: 6,
                  padding: 14,
                  marginBottom: 20,
                  textAlign: "left",
                  fontSize: 13,
                }}
              >
                <p style={{ margin: "0 0 6px", color: C.amber, ...mono, fontSize: 11 }}>
                  MODO DESARROLLO — así se vería el correo
                </p>
                <p style={{ margin: 0 }}>Usuario: {email}</p>
                <p style={{ margin: 0 }}>Contraseña: {purchaseResult.devPassword}</p>
              </div>
            )}

            <button style={buttonPrimary} onClick={() => navigate("/login")}>
              IR A INICIAR SESIÓN
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}
