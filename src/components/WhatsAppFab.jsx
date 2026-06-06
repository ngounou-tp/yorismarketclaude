import { YORIX_WA_NUMBER } from "../lib/supabase";

const DEFAULT_MSG = "Bonjour Yorix ! Je veux passer commande 🛍️";

export function WhatsAppFab({ message = DEFAULT_MSG }) {
  return (
    <a
      href={`https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Yorix sur WhatsApp"
      className="yorix-wa-fab"
      style={{ position: "relative" }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "2px solid rgba(37,211,102,.55)",
          animation: "waPulse 2.2s ease-out infinite",
          pointerEvents: "none",
        }}
      />
      <span aria-hidden="true">💬</span>
    </a>
  );
}
