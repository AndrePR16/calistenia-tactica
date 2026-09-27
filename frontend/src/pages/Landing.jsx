import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { Shell, C, stencil, buttonPrimary } from "../theme.jsx";

export default function Landing() {
  const navigate = useNavigate();
  const [fromAd, setFromAd] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    if (utmSource) {
      // US-28: visitante llega desde publicidad -> lo mandamos directo al
      // test, no a una landing genérica con el precio.
      sessionStorage.setItem("ct_utm_source", utmSource);
      navigate(`/test?utm_source=${encodeURIComponent(utmSource)}`);
    } else {
      setFromAd(false);
    }
  }, [navigate]);

  return (
    <Shell>
      <div style={{ padding: "56px 28px", textAlign: "center" }}>
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
          <Dumbbell size={26} color={C.moss} />
        </div>
        <h1 style={{ ...stencil, fontSize: 26, margin: 0 }}>Calistenia Táctica</h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 6, marginBottom: 32 }}>
          30 días. Sin gimnasio. Sin excusas.
        </p>

        <button style={buttonPrimary} onClick={() => navigate("/test")}>
          HACER EL TEST GRATIS
        </button>

        <p style={{ fontSize: 12, color: C.muted, marginTop: 20 }}>
          ¿Ya compraste?{" "}
          <a href="/login" style={{ color: C.amber }}>
            Inicia sesión
          </a>
        </p>
      </div>
    </Shell>
  );
}
