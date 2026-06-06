import { useState, useEffect } from "react";

export function FlashCountdown() {
  const getSecondsLeft = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    return Math.floor((midnight - now) / 1000);
  };
  const [secs, setSecs] = useState(getSecondsLeft);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : getSecondsLeft())), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  const seg = {
    background: "var(--red)",
    color: "#fff",
    padding: "3px 9px",
    borderRadius: 7,
    fontFamily: "'Syne',sans-serif",
    fontWeight: 800,
    fontSize: ".85rem",
    minWidth: 32,
    textAlign: "center",
    boxShadow: "0 3px 10px rgba(206,17,38,.35)",
    display: "inline-block",
    transition: "transform .1s",
  };
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {[h, m, s].map((v, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={seg}>{v}</span>
          {i < 2 && (
            <span style={{ fontWeight: 800, color: "var(--red)", fontSize: ".9rem", lineHeight: 1 }}>:</span>
          )}
        </span>
      ))}
    </div>
  );
}
