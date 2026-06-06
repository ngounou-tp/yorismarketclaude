import { useEffect } from "react";

export function PointsAnimation({ show, points, onDone }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => onDone?.(), 2500);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`+${points} points de fidélité ajoutés`}
      style={{
        position: "fixed",
        top: "clamp(80px, 20%, 200px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        background: "linear-gradient(135deg,#fcd116,#f59e0b)",
        color: "#0d1f14",
        padding: "20px 36px",
        borderRadius: 18,
        fontFamily: "'Syne',sans-serif",
        fontWeight: 800,
        fontSize: "clamp(1.4rem, 5vw, 2rem)",
        boxShadow: "0 20px 60px rgba(245,158,11,.5), 0 0 0 4px rgba(252,209,22,.25)",
        animation: "pointsBurst 2.5s ease-out forwards",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        backdropFilter: "blur(4px)",
      }}
    >
      +{points} pts 🎉
      <style>{`
        @keyframes pointsBurst {
          0%   { transform: translateX(-50%) scale(0) rotate(-8deg); opacity: 0; }
          14%  { transform: translateX(-50%) scale(1.18) rotate(4deg); opacity: 1; }
          24%  { transform: translateX(-50%) scale(1) rotate(0deg); }
          75%  { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) scale(.85) translateY(-70px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pointsBurst { 0%,100% { opacity: 0; } 10%,80% { opacity: 1; transform: translateX(-50%); } }
        }
      `}</style>
    </div>
  );
}
