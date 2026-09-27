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
  `}</style>
);

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
