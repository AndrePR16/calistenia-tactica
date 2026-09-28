import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Ruler, Weight, Target, Dumbbell, TrendingUp, Shield, Brain } from "lucide-react";
import {
  Shell, C, stencil, mono, inputStyle, buttonPrimary,
  WizardStep, BigSlider, ChoiceCard, ProcessingScreen,
} from "../theme.jsx";
import { api } from "../lib/api.js";

const OBJETIVO_CHOICES = [
  { value: "fuerza", label: "Fuerza", desc: "Priorizar dominadas, flexiones y fuerza de tren superior" },
  { value: "resistencia", label: "Resistencia", desc: "Circuitos cardio, menos descanso entre series" },
  { value: "perdida_peso", label: "Perder peso", desc: "Movimiento constante, más ejercicios full-body" },
];
const EXPERIENCIA_CHOICES = [
  { value: "nunca_entrene", label: "Nunca entrené", desc: "Empiezas desde la base, sin riesgo de lesión" },
  { value: "entrene_antes", label: "Entrené antes", desc: "Saltamos lo más básico" },
  { value: "entreno_actualmente", label: "Entreno actualmente", desc: "El reto arranca a tu nivel real" },
];
const TIPO_OPERADOR_CHOICES = [
  { value: "muscular", label: "Muscular", desc: "Alto enfoque en hipertrofia" },
  { value: "atletico", label: "Atlético", desc: "Resistencia y fuerza equilibrada" },
  { value: "potencia", label: "Potencia", desc: "Salida de fuerza máxima" },
  { value: "agil", label: "Ágil", desc: "Alta movilidad y definición" },
];

const TOTAL_STEPS = 7;

const PROCESSING_MESSAGES = [
  "Procesando datos biométricos...",
  "Calculando punto de partida...",
  "Montando rutina diaria de élite...",
];

/**
 * US-02 a US-06 (perfil + recomendación) y US-28 (test previo a la compra
 * para visitantes de anuncios). El mismo formulario sirve para ambos casos:
 * - mode="lead": visitante anónimo -> POST /lead-test, termina mostrando el
 *   precio y el botón de compra.
 * - mode="profile": usuario ya logueado -> POST /profile, vuelve al dashboard.
 *
 * Rediseñado como wizard paso a paso (una pregunta por pantalla) para que
 * se sienta como un "briefing" de reclutamiento en vez de un formulario largo.
 */
export default function OnboardingTest({ mode = "lead" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const utmSource = searchParams.get("utm_source") || sessionStorage.getItem("ct_utm_source");

  const [form, setForm] = useState({
    nombre: "",
    estatura: 173,
    peso: 85,
    peso_objetivo: 72,
    objetivo: "perdida_peso",
    experiencia: "nunca_entrene",
    tipo_operador: null,
    // La silueta se sigue guardando (no se usa para decidir dificultad, ver
    // recommendation.js), pero ya no se le pide al usuario que la elija: es
    // un dato neutral que no aporta a la experiencia y solo agregaba fricción.
    silueta: "promedio",
  });
  const [wizardStep, setWizardStep] = useState(0); // 0..6
  const [step, setStep] = useState("wizard"); // wizard | processing | result | purchase | done
  const [recommendation, setRecommendation] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function canAdvance() {
    if (wizardStep === 0) return form.nombre.trim().length > 0;
    if (wizardStep === 6) return Boolean(form.tipo_operador);
    return true;
  }

  function goNext() {
    if (!canAdvance()) {
      setError(wizardStep === 0 ? "Ingresa tu nombre para continuar" : "Elige una clasificación para continuar");
      return;
    }
    setError("");
    if (wizardStep === TOTAL_STEPS - 1) {
      setStep("processing");
    } else {
      setWizardStep((s) => s + 1);
    }
  }

  function goBack() {
    setError("");
    if (wizardStep === 0) return;
    setWizardStep((s) => s - 1);
  }

  async function submitAnswers() {
    setLoading(true);
    setError("");
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
      setStep("wizard");
      setWizardStep(TOTAL_STEPS - 1);
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

  const nextLabel = wizardStep === TOTAL_STEPS - 1 ? "INICIALIZAR" : "CONFIRMAR";
  const nextButton = (
    <button type="button" style={buttonPrimary} onClick={goNext}>
      {nextLabel} →
    </button>
  );

  return (
    <Shell>
      {step === "wizard" && (
        <>
          {wizardStep === 0 && (
            <WizardStep step={1} total={TOTAL_STEPS} icon={<User size={20} />} title="Identificación" subtitle="¿Cómo podemos llamarte, recluta?" footer={nextButton}>
              <input
                style={{ ...inputStyle, textAlign: "center", ...stencil, fontSize: 20, padding: "14px 12px" }}
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="TU NOMBRE"
                autoFocus
              />
            </WizardStep>
          )}

          {wizardStep === 1 && (
            <WizardStep step={2} total={TOTAL_STEPS} icon={<Ruler size={20} />} title="Biometría: altura" subtitle="Calibrar parámetros verticales" onBack={goBack} footer={nextButton}>
              <BigSlider value={form.estatura} unit="CM" min={140} max={220} onChange={(v) => set("estatura", v)} />
            </WizardStep>
          )}

          {wizardStep === 2 && (
            <WizardStep step={3} total={TOTAL_STEPS} icon={<Weight size={20} />} title="Biometría: carga actual" subtitle="Ingresa tu masa corporal actual" onBack={goBack} footer={nextButton}>
              <BigSlider value={form.peso} unit="KG" min={40} max={150} onChange={(v) => set("peso", v)} />
            </WizardStep>
          )}

          {wizardStep === 3 && (
            <WizardStep step={4} total={TOTAL_STEPS} icon={<Target size={20} />} title="Objetivo: carga meta" subtitle="Establecer meta operativa" onBack={goBack} footer={nextButton}>
              <BigSlider value={form.peso_objetivo} unit="KG" min={40} max={150} onChange={(v) => set("peso_objetivo", v)} />
            </WizardStep>
          )}

          {wizardStep === 4 && (
            <WizardStep step={5} total={TOTAL_STEPS} icon={<Dumbbell size={20} />} title="Objetivo principal" subtitle="¿En qué enfocamos tu entrenamiento?" onBack={goBack} footer={nextButton}>
              {OBJETIVO_CHOICES.map((o) => (
                <ChoiceCard key={o.value} title={o.label} desc={o.desc} selected={form.objetivo === o.value} onClick={() => set("objetivo", o.value)} />
              ))}
            </WizardStep>
          )}

          {wizardStep === 5 && (
            <WizardStep step={6} total={TOTAL_STEPS} icon={<TrendingUp size={20} />} title="Experiencia previa" subtitle="Esto decide tu punto de partida" onBack={goBack} footer={nextButton}>
              {EXPERIENCIA_CHOICES.map((o) => (
                <ChoiceCard key={o.value} title={o.label} desc={o.desc} selected={form.experiencia === o.value} onClick={() => set("experiencia", o.value)} />
              ))}
            </WizardStep>
          )}

          {wizardStep === 6 && (
            <WizardStep step={7} total={TOTAL_STEPS} icon={<Shield size={20} />} title="Clasificación" subtitle="Selecciona tipo de operador" onBack={goBack} footer={nextButton}>
              {TIPO_OPERADOR_CHOICES.map((o) => (
                <ChoiceCard key={o.value} title={o.label} desc={o.desc} selected={form.tipo_operador === o.value} onClick={() => set("tipo_operador", o.value)} />
              ))}
              <p style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
                Esto es solo para tu identidad dentro de la app — tu rutina se
                calibra por tu experiencia previa, no por esta clasificación.
              </p>
            </WizardStep>
          )}

          {error && (
            <p style={{ color: C.danger, fontSize: 12, textAlign: "center", margin: "0 24px 20px" }}>{error}</p>
          )}
        </>
      )}

      {step === "processing" && (
        <ProcessingScreen icon={<Brain size={22} />} messages={PROCESSING_MESSAGES} onDone={submitAnswers} />
      )}

      {step === "result" && recommendation && (
        <div style={{ padding: "40px 28px" }}>
          <h2 style={{ ...stencil, fontSize: 22, margin: "0 0 16px" }}>
            Tu plan recomendado, {form.nombre}
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
        </div>
      )}

      {step === "purchase" && (
        <div style={{ padding: "40px 28px" }}>
          <h2 style={{ ...stencil, fontSize: 22, margin: "0 0 16px" }}>
            Un último paso
          </h2>
          <form onSubmit={handlePurchase}>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ display: "block", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 6, ...mono }}>
                Tu correo (ahí llegan tus accesos)
              </span>
              <input
                style={inputStyle}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
            </label>
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
        </div>
      )}

      {step === "done" && purchaseResult && (
        <div style={{ padding: "40px 28px", textAlign: "center" }}>
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
    </Shell>
  );
}
