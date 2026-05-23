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
    >
      <span aria-hidden="true">💬</span>
    </a>
  );
}
