import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Shell, C, stencil, mono, inputStyle, buttonPrimary } from "../theme.jsx";
import { api, setToken } from "../lib/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await api.login(email, password);
      setToken(resp.token);
      navigate(resp.hasProfile ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div style={{ padding: "56px 28px" }}>
        <h1 style={{ ...stencil, fontSize: 24, textAlign: "center", marginBottom: 32 }}>
          Iniciar sesión
        </h1>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, ...mono }}>
              CORREO
            </span>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, ...mono }}>
              CONTRASEÑA
            </span>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p style={{ color: C.danger, fontSize: 12, marginBottom: 16 }}>{error}</p>}
          <button style={{ ...buttonPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={loading}>
            <LogIn size={16} /> {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
          </button>
        </form>
      </div>
    </Shell>
  );
}
