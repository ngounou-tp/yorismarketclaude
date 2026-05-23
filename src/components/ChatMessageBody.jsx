import { maskPIIForDisplay } from "../lib/chatSecurity";
import { sanitizeChatDisplayText } from "../lib/chatMessages";

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"])/gi;

function safeHref(url) {
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Corps de message : texte masqué, liens cliquables, image.
 */
export function ChatMessageBody({ content, imageUrl, linkUrl, revealPII = false }) {
  let raw = content || "";
  if (imageUrl) raw = sanitizeChatDisplayText(raw);
  const text = maskPIIForDisplay(raw, { reveal: revealPII });

  const parts = [];
  if (text) {
    let last = 0;
    const re = new RegExp(URL_RE.source, URL_RE.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
      parts.push({ type: "link", value: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
    if (parts.length === 0) parts.push({ type: "text", value: text });
  }

  const officialLink = linkUrl ? safeHref(linkUrl) : null;

  return (
    <div className="msg-bubble-body">
      {imageUrl && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="msg-bubble-img-wrap"
        >
          <img src={imageUrl} alt="" className="msg-bubble-img" loading="lazy" />
        </a>
      )}
      {parts.length > 0 && (
        <p className="msg-bubble-text">
          {parts.map((p, i) => {
            if (p.type === "link") {
              const href = safeHref(p.value);
              if (!href) return <span key={i}>{p.value}</span>;
              return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="msg-inline-link">
                  {p.value}
                </a>
              );
            }
            return <span key={i}>{p.value}</span>;
          })}
        </p>
      )}
      {officialLink && (
        <a href={officialLink} target="_blank" rel="noopener noreferrer" className="msg-bubble-cta">
          Ouvrir le lien →
        </a>
      )}
    </div>
  );
}
