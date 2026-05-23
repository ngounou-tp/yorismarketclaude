// YORIX CM — Messagerie sécurisée (peer + annonces Yorix Équipe)
// ✅ VERSION CORRIGÉE - Fix: setFeedback undefined + améliorations UX

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { uploadSingleImage } from "../utils/helpers";
import {
  filtrerMsg,
  publicDisplayName,
  adminContactLines,
  CHAT_ESCROW_GUIDANCE,
  CHAT_ESCROW_HINT,
  CHAT_ESCROW_BLOCK_TITLE,
} from "../lib/chatSecurity";
import { insertChatMessage } from "../lib/chatMessages";
import { findOrCreateConversation } from "../lib/chatConversations";
import { canWriteAdmin } from "../lib/roles";
import { CHAT_CONVERSATIONS_LIMIT, CHAT_MESSAGES_LIMIT } from "../lib/queryLimits";
import { ChatMessageBody } from "./ChatMessageBody";
import { NewMessageModal } from "./chat/NewMessageModal";
import { YorixToast, useYorixToast } from "./ui/YorixToast";

export const YORIX_TEAM_CHANNEL = "__yorix_team__";

function safeHttpsUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol === "https:") return u.href;
  } catch {
    /* ignore */
  }
  return null;
}

function messagePreview(m) {
  if (m.image_url) return "📷 Photo";
  if (m.link_url) return "🔗 Lien";
  const t = (m.content || m.texte || "").trim();
  return t ? t.slice(0, 60) : "Message";
}

export function ChatUsers({
  user,
  userData,
  initialProduct = null,
  initialConversationId = null,
  onClose,
  isModal = false,
}) {
  const isAdmin = canWriteAdmin(userData);
  const revealPII = isAdmin;

  const [conversations, setConversations] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [products, setProducts] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [pendingImage, setPendingImage] = useState("");
  const [pendingLink, setPendingLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [search, setSearch] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [pendingConvId, setPendingConvId] = useState(initialConversationId);
  const { toast, showToast, clearToast } = useYorixToast();
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);
  const composeInputRef = useRef(null);
  const fileRef = useRef(null);

  const hapticTap = () => {
    try {
      navigator.vibrate?.(8);
    } catch {
      /* ignore */
    }
  };

  const hydrateProfilesAndProducts = useCallback(async (convs) => {
    if (!user?.id) return;
    
    const userIds = [
      ...new Set(
        convs.flatMap((c) => [c.user1_id, c.user2_id].filter((id) => id && id !== user.id)),
      ),
    ];
    const productIds = [...new Set(convs.map((c) => c.product_id).filter(Boolean))];

    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nom, email, telephone, ville, role")
        .in("id", userIds);
      setProfiles((prev) => {
        const next = { ...prev };
        (profs || []).forEach((p) => {
          next[p.id] = p;
        });
        return next;
      });
    }

    if (productIds.length) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name_fr, prix, image, image_urls")
        .in("id", productIds);
      setProducts((prev) => {
        const next = { ...prev };
        (prods || []).forEach((p) => {
          next[p.id] = p;
        });
        return next;
      });
    }
  }, [user?.id]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(CHAT_CONVERSATIONS_LIMIT);
      if (error) throw error;
      setConversations(data || []);

      if ((data || []).length) await hydrateProfilesAndProducts(data || []);
    } catch (err) {
      console.warn("Chargement conversations:", err.message);
      // ✅ Ne pas faire planter la page - juste log
    } finally {
      setLoading(false);
    }
  }, [user?.id, hydrateProfilesAndProducts]);

  const loadBroadcasts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("yorix_broadcasts")
        .select("id, title, content, image_url, link_url, created_at")
        .order("created_at", { ascending: true })
        .limit(80);
      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) return;
        throw error;
      }
      setBroadcasts(data || []);
    } catch (err) {
      console.warn("broadcasts:", err.message);
    }
  }, []);

  const startConversation = useCallback(
    async (targetUserId, productId = null) => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return;

      try {
        const conv = await findOrCreateConversation(supabase, user.id, targetUserId, productId);
        setShowNewMessage(false);
        setActiveId(conv.id);
        setMobileShowThread(true);
        await loadConversations();
        setTimeout(() => composeInputRef.current?.focus(), 120);
      } catch (err) {
        console.error("startConversation:", err);
        showToast(err.message || "Impossible d'ouvrir la conversation", "error");
      }
    },
    [user?.id, showToast, loadConversations],
  );

  useEffect(() => {
    if (initialProduct?.vendeur_id && user?.id && initialProduct.vendeur_id !== user.id) {
      startConversation(initialProduct.vendeur_id, initialProduct.id);
    }
  }, [initialProduct?.id, initialProduct?.vendeur_id, user?.id, startConversation]);

  const loadMessages = useCallback(async (convId) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(CHAT_MESSAGES_LIMIT);
      if (error) throw error;
      setMessages((data || []).slice().reverse());
    } catch (err) {
      console.warn("Chargement messages:", err.message);
    }
  }, []);

  useEffect(() => {
    setPendingConvId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    if (!pendingConvId || !user?.id) return;

    const openConv = (conv) => {
      if (!conv?.id) return;
      setActiveId(conv.id);
      setMobileShowThread(true);
      setPendingConvId(null);
    };

    const hit = conversations.find((c) => c.id === pendingConvId);
    if (hit) {
      openConv(hit);
      return;
    }

    if (loading) return;

    supabase
      .from("conversations")
      .select("*")
      .eq("id", pendingConvId)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setPendingConvId(null);
          return;
        }
        setConversations((prev) => (prev.some((c) => c.id === data.id) ? prev : [data, ...prev]));
        await hydrateProfilesAndProducts([data]);
        openConv(data);
      });
  }, [pendingConvId, conversations, loading, user?.id, hydrateProfilesAndProducts]);

  const markPeerMessagesRead = useCallback(async (convId) => {
    if (!user?.id || !convId) return;
    try {
      const { error } = await supabase.rpc("mark_conversation_messages_read", {
        p_conversation_id: convId,
      });
      if (error) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", convId)
          .neq("sender_id", user.id)
          .eq("is_read", false);
      }
    } catch (err) {
      console.warn("mark read:", err.message);
    }
  }, [user?.id]);

  const markBroadcastsRead = useCallback(async () => {
    if (!user?.id || !broadcasts.length) return;
    const rows = broadcasts.map((b) => ({ broadcast_id: b.id, user_id: user.id }));
    try {
      await supabase
        .from("yorix_broadcast_reads")
        .upsert(rows, { onConflict: "broadcast_id,user_id" });
    } catch {
      /* ignore - table optionnelle */
    }
  }, [user?.id, broadcasts]);

  useEffect(() => {
    if (!user?.id) return;
    loadConversations();
    loadBroadcasts();
  }, [user?.id, loadConversations, loadBroadcasts]);

  useEffect(() => {
    if (!activeId || activeId === YORIX_TEAM_CHANNEL) {
      if (activeId !== YORIX_TEAM_CHANNEL) setMessages([]);
      return;
    }
    loadMessages(activeId);
    markPeerMessagesRead(activeId);
  }, [activeId, user?.id, loadMessages, markPeerMessagesRead]);

  useEffect(() => {
    if (activeId === YORIX_TEAM_CHANNEL) markBroadcastsRead();
  }, [activeId, broadcasts.length, user?.id, markBroadcastsRead]);

  useEffect(() => {
    if (!activeId || activeId === YORIX_TEAM_CHANNEL) return;
    const channel = supabase
      .channel(`chat-${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          if (payload.new.sender_id !== user.id) {
            markPeerMessagesRead(activeId);
          }
          loadConversations();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, user?.id, loadConversations, markPeerMessagesRead]);

  useEffect(() => {
    const ch = supabase
      .channel("yorix-broadcasts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "yorix_broadcasts" },
        () => {
          loadBroadcasts();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [loadBroadcasts]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, activeId, broadcasts, scrollToBottom]);

  useEffect(() => {
    if (!activeId || activeId === YORIX_TEAM_CHANNEL) return;
    setTimeout(() => composeInputRef.current?.focus(), 150);
  }, [activeId]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return undefined;
    const vv = window.visualViewport;
    const syncKb = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--msg-kb-offset", `${offset}px`);
    };
    vv.addEventListener("resize", syncKb);
    vv.addEventListener("scroll", syncKb);
    syncKb();
    return () => {
      vv.removeEventListener("resize", syncKb);
      vv.removeEventListener("scroll", syncKb);
      document.documentElement.style.removeProperty("--msg-kb-offset");
    };
  }, []);

  const getOtherUserId = (conv) => (conv.user1_id === user.id ? conv.user2_id : conv.user1_id);

  const partnerLabel = useCallback((conv) => {
    const oid = getOtherUserId(conv);
    return publicDisplayName(profiles[oid], oid);
  }, [profiles, user?.id]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const label = partnerLabel(c).toLowerCase();
      const prod = products[c.product_id];
      const prodName = (prod?.name_fr || "").toLowerCase();
      return label.includes(q) || prodName.includes(q);
    });
  }, [conversations, search, products, partnerLabel]);

  const yorixThreadMessages = useMemo(
    () =>
      broadcasts.map((b) => ({
        id: b.id,
        sender_id: "yorix",
        content: b.title ? `${b.title}\n\n${b.content}` : b.content,
        image_url: b.image_url,
        link_url: b.link_url,
        created_at: b.created_at,
        is_system: true,
      })),
    [broadcasts],
  );

  const displayMessages = activeId === YORIX_TEAM_CHANNEL ? yorixThreadMessages : messages;

  const activeConv = conversations.find((c) => c.id === activeId);
  const activePartnerId = activeConv ? getOtherUserId(activeConv) : null;
  const activePartner = activePartnerId ? profiles[activePartnerId] : null;

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image max 5 Mo", "error");
      return;
    }
    setUploading(true);
    try {
      setPendingImage(await uploadSingleImage(file));
    } catch (err) {
      showToast(err.message || "Échec upload", "error");
    }
    setUploading(false);
    e.target.value = "";
  };

  const sendMessage = async () => {
    const text = messageInput.trim();
    const hasImage = Boolean(pendingImage);
    const link = safeHttpsUrl(pendingLink);
    
    if ((!text && !hasImage && !link) || !activeId || activeId === YORIX_TEAM_CHANNEL || sending) {
      return;
    }

    if (!user?.id) {
      showToast("Session expirée — reconnectez-vous.", "error");
      return;
    }

    if (text) {
      const filtre = filtrerMsg(text);
      if (filtre.bloque) {
        setBlocked(true);
        setBlockReason(filtre.raison || "Partage de contact interdit");
        showToast(
          `${filtre.raison} Restez sur Yorix et payez via la plateforme (escrow) pour une transaction sécurisée.`,
          "error",
          7000,
        );
        setTimeout(() => setBlocked(false), 8000);
        if (user) {
          supabase
            .from("fraud_logs")
            .insert({
              type: "tentative_contournement_chat",
              user_id: user.id,
              message: text,
            })
            .then(({ error }) => {
              if (error) console.warn(error.message);
            });
        }
        return;
      }
    }

    const linkText = pendingLink.trim();
    if (linkText) {
      const linkFilter = filtrerMsg(linkText);
      if (linkFilter.bloque) {
        setBlocked(true);
        setBlockReason(linkFilter.raison || "Lien de contact interdit");
        showToast(
          `${linkFilter.raison} Restez sur Yorix et payez via la plateforme (escrow) pour une transaction sécurisée.`,
          "error",
          7000,
        );
        setTimeout(() => setBlocked(false), 8000);
        return;
      }
    }

    if (linkText && !link) {
      setBlockReason("Seuls les liens https:// sont acceptés.");
      setBlocked(true);
      setTimeout(() => setBlocked(false), 4000);
      return;
    }

    setSending(true);
    // ❌ AVANT (BUG) : setFeedback(null);  <-- Cette ligne faisait planter la page !
    // ✅ APRÈS : supprimé car setFeedback n'était jamais déclaré
    
    try {
      const data = await insertChatMessage(supabase, {
        conversationId: activeId,
        senderId: user.id,
        content: text,
        imageUrl: pendingImage || null,
        linkUrl: link,
      });
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      setMessageInput("");
      setPendingImage("");
      setPendingLink("");
      hapticTap();
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeId);
      loadConversations();
      scrollToBottom(true);
    } catch (err) {
      console.warn("sendMessage:", err.message);
      const msg = err.message || "erreur réseau";
      if (/expediteur_id|category.*notifications/i.test(msg)) {
        showToast(
          "Erreur serveur — exécutez la migration SQL notifications sur Supabase.",
          "error",
          6000,
        );
      } else {
        showToast(`Message non envoyé : ${msg}`, "error");
      }
    } finally {
      setSending(false);
    }
  };

  const selectChannel = (id) => {
    setActiveId(id);
    setMobileShowThread(true);
  };

  if (!user) {
    return (
      <div className="msg-hub-empty">
        <div className="msg-hub-empty-icon">🔐</div>
        <p>Connectez-vous pour accéder à la messagerie Yorix.</p>
      </div>
    );
  }

  const hubClass = `msg-hub${isModal ? " msg-hub--modal" : ""}${mobileShowThread ? " msg-hub--thread-open" : ""}`;

  const handleNewMessagePick = (profile) => {
    if (!profile?.id) return;
    setProfiles((prev) => ({
      ...prev,
      [profile.id]: {
        id: profile.id,
        nom: profile.full_name || profile.nom,
        role: profile.role,
        ville: profile.ville,
      },
    }));
    startConversation(profile.id, null);
  };

  return (
    <div className={hubClass}>
      <YorixToast toast={toast} onClose={clearToast} />
      <aside
        className={`msg-hub-sidebar${mobileShowThread ? " msg-hub-sidebar--hidden-mobile" : ""}`}
      >
        <div className="msg-hub-toolbar">
          <div className="msg-hub-title-row">
            <h2 className="msg-hub-title">Messages</h2>
            <button
              type="button"
              className="msg-hub-new-btn"
              onClick={() => {
                setShowNewMessage(true);
                hapticTap();
              }}
              aria-label="Nouveau message"
            >
              + Nouveau
            </button>
          </div>
          <input
            type="search"
            className="msg-hub-search"
            placeholder="Rechercher une conversation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher"
          />
        </div>

        <div className="msg-hub-conv-list">
          <button
            type="button"
            className={`msg-conv-item msg-conv-item--yorix${activeId === YORIX_TEAM_CHANNEL ? " msg-conv-item--active" : ""}`}
            onClick={() => selectChannel(YORIX_TEAM_CHANNEL)}
          >
            <div className="msg-conv-av msg-conv-av--brand">🇨🇲</div>
            <div className="msg-conv-copy">
              <div className="msg-conv-name">Yorix Équipe</div>
              <div className="msg-conv-preview">
                {broadcasts.length
                  ? messagePreview(broadcasts[broadcasts.length - 1])
                  : "Annonces et infos officielles"}
              </div>
            </div>
            {broadcasts.length > 0 && <span className="msg-conv-badge">●</span>}
          </button>

          {loading ? (
            <div className="msg-hub-loading">Chargement…</div>
          ) : filteredConversations.length === 0 ? (
            <div className="msg-hub-empty-inline">
              <p>Aucune conversation privée.</p>
              <p className="msg-hub-hint">
                Utilisez « + Nouveau » ou contactez un vendeur depuis une fiche produit.
              </p>
              <button
                type="button"
                className="msg-hub-new-btn msg-hub-new-btn--inline"
                onClick={() => setShowNewMessage(true)}
              >
                + Nouveau message
              </button>
            </div>
          ) : (
            filteredConversations.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`msg-conv-item${activeId === c.id ? " msg-conv-item--active" : ""}`}
                onClick={() => selectChannel(c.id)}
              >
                <div className="msg-conv-av">{(partnerLabel(c)[0] || "M").toUpperCase()}</div>
                <div className="msg-conv-copy">
                  <div className="msg-conv-name">{partnerLabel(c)}</div>
                  <div className="msg-conv-preview">
                    {c.product_id && products[c.product_id]
                      ? `🛍️ ${products[c.product_id].name_fr?.slice(0, 40) || "Produit"}`
                      : c.last_message_at
                        ? new Date(c.last_message_at).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Nouvelle conversation"}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section
        className={`msg-hub-main${!mobileShowThread && !activeId ? " msg-hub-main--placeholder" : ""}`}
      >
        <header className="msg-hub-header">
          <button
            type="button"
            className="msg-hub-back"
            onClick={() => {
              setMobileShowThread(false);
            }}
            aria-label="Retour"
          >
            ←
          </button>
          <div className="msg-hub-header-copy">
            <div className="msg-hub-header-title">
              {activeId === YORIX_TEAM_CHANNEL
                ? "Yorix Équipe"
                : activeConv
                  ? partnerLabel(activeConv)
                  : "Messagerie"}
            </div>
            <div className="msg-hub-header-sub">
              {activeId === YORIX_TEAM_CHANNEL
                ? "Annonces officielles · Communauté Yorix"
                : "🔒 Contacts masqués · Échanges sécurisés sur Yorix"}
            </div>
          </div>
          {onClose && (
            <button type="button" className="msg-hub-close" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          )}
        </header>

        {isAdmin && activePartner && activeId !== YORIX_TEAM_CHANNEL && (
          <div className="msg-admin-contact-panel">
            <span className="msg-admin-contact-label">Vue admin — coordonnées</span>
            {adminContactLines(activePartner).map((line) => (
              <span key={line.k} className="msg-admin-contact-line">
                <strong>{line.k}:</strong> {line.v}
              </span>
            ))}
          </div>
        )}

        <div className="msg-hub-scroll" ref={scrollRef}>
          {!activeId ? (
            <div className="msg-hub-empty">
              <div className="msg-hub-empty-icon">💬</div>
              <p>Sélectionnez une conversation ou Yorix Équipe</p>
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="msg-hub-empty">
              <div className="msg-hub-empty-icon">✨</div>
              <p>
                {activeId === YORIX_TEAM_CHANNEL
                  ? "Les annonces de l'équipe Yorix apparaîtront ici."
                  : "Aucun message. Envoyez le premier !"}
              </p>
            </div>
          ) : (
            displayMessages.map((m) => {
              const isMine = m.sender_id === user.id;
              const isSystem = m.is_system || m.sender_id === "yorix";
              return (
                <div
                  key={m.id}
                  className={`msg-bubble-row${isMine ? " msg-bubble-row--mine" : ""}${isSystem ? " msg-bubble-row--system" : ""}`}
                >
                  <div
                    className={`msg-bubble${isMine ? " msg-bubble--mine" : ""}${isSystem ? " msg-bubble--system" : ""}`}
                  >
                    {isSystem && m.content?.includes("\n\n") ? (
                      <>
                        <strong className="msg-system-title">{m.content.split("\n\n")[0]}</strong>
                        <ChatMessageBody
                          content={m.content.split("\n\n").slice(1).join("\n\n")}
                          imageUrl={m.image_url}
                          linkUrl={m.link_url}
                          revealPII={revealPII}
                        />
                      </>
                    ) : (
                      <ChatMessageBody
                        content={m.content}
                        imageUrl={m.image_url}
                        linkUrl={m.link_url}
                        revealPII={revealPII}
                      />
                    )}
                    <div className="msg-bubble-foot">
                      {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isMine && !isSystem && (m.is_read ? " · Lu" : "")}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {blocked && (
            <div className="msg-blocked-banner" role="alert">
              <strong>🛡️ {CHAT_ESCROW_BLOCK_TITLE}</strong>
              <p className="msg-blocked-reason">{blockReason}</p>
              <p className="msg-blocked-body">{CHAT_ESCROW_GUIDANCE}</p>
              <p className="msg-blocked-hint">{CHAT_ESCROW_HINT}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {activeId && activeId !== YORIX_TEAM_CHANNEL && (
          <footer className="msg-hub-composer">
            {(pendingImage || pendingLink) && (
              <div className="msg-composer-attachments">
                {pendingImage && (
                  <div className="msg-composer-preview">
                    <img src={pendingImage} alt="Aperçu" loading="lazy" />
                    <button
                      type="button"
                      className="msg-composer-preview-remove"
                      onClick={() => setPendingImage("")}
                      aria-label="Retirer l'image"
                    >
                      ×
                    </button>
                  </div>
                )}
                {pendingLink && (
                  <span className="msg-attach-chip">
                    🔗 {pendingLink.slice(0, 40)}
                    <button
                      type="button"
                      onClick={() => setPendingLink("")}
                      aria-label="Retirer le lien"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
            <div className="msg-composer-row">
              <button
                type="button"
                className="msg-composer-icon"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Photo"
              >
                {uploading ? "…" : "📷"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
              <input
                type="url"
                className="msg-composer-link"
                placeholder="Lien https (opt.)"
                value={pendingLink}
                onChange={(e) => setPendingLink(e.target.value)}
              />
              <input
                ref={composeInputRef}
                type="text"
                className="msg-composer-input"
                placeholder="Écrivez votre message…"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={sending}
                aria-label="Message"
                enterKeyHint="send"
              />
              <button
                type="button"
                className="msg-composer-send"
                onClick={sendMessage}
                disabled={
                  sending ||
                  uploading ||
                  (!messageInput.trim() && !pendingImage && !safeHttpsUrl(pendingLink))
                }
                aria-label={sending ? "Envoi en cours" : "Envoyer"}
              >
                {sending ? <span className="msg-composer-spinner" aria-hidden /> : "➤"}
              </button>
            </div>
          </footer>
        )}

        {activeId === YORIX_TEAM_CHANNEL && (
          <footer className="msg-hub-composer msg-hub-composer--readonly">
            <p>Canal officiel en lecture seule. Répondez via le support si besoin.</p>
          </footer>
        )}
      </section>

      <NewMessageModal
        open={showNewMessage}
        supabase={supabase}
        userId={user.id}
        onSelect={handleNewMessagePick}
        onClose={() => setShowNewMessage(false)}
      />
    </div>
  );
}
