-- Messagerie + notifications : colonnes manquantes, trigger chat, recherche membres
-- Idempotent — safe à rejouer en prod.

-- ─── 1) Schéma notifications enrichi (si 20260510000300 non appliqué) ───────
ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'standard';

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'system';

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, lu)
  WHERE lu IS NOT TRUE;

-- ─── 2) Trigger chat : sender_id uniquement + miniature notification ─────────
CREATE OR REPLACE FUNCTION public.fn_notify_peer_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv public.conversations%rowtype;
  v_recipient uuid;
  v_preview text;
  v_sender_name text;
  v_sender uuid;
BEGIN
  IF to_regclass('public.conversations') IS NULL
     OR to_regclass('public.notifications') IS NULL THEN
    RETURN NEW;
  END IF;

  v_sender := NEW.sender_id;
  IF v_sender IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_conv
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF v_conv.user1_id = v_sender THEN
    v_recipient := v_conv.user2_id;
  ELSIF v_conv.user2_id = v_sender THEN
    v_recipient := v_conv.user1_id;
  ELSE
    RETURN NEW;
  END IF;

  IF v_recipient IS NULL OR v_recipient = v_sender THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(nullif(trim(p.nom), ''), 'Un membre Yorix') INTO v_sender_name
  FROM public.profiles p
  WHERE p.id = v_sender;

  v_preview := left(
    coalesce(
      nullif(trim(NEW.content), ''),
      CASE WHEN NEW.image_url IS NOT NULL THEN '📷 Photo' ELSE 'Nouveau message' END
    ),
    180
  );

  INSERT INTO public.notifications (
    user_id, type, title, message, link, lu, category, priority, payload, image_url
  )
  VALUES (
    v_recipient,
    'new_message',
    '💬 ' || v_sender_name,
    v_preview,
    '/dashboard?tab=messages',
    false,
    'messages',
    'important',
    jsonb_build_object(
      'conversation_id', v_conv.id,
      'sender_id', v_sender,
      'image_url', NEW.image_url
    ),
    NEW.image_url
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_peer_chat_message ON public.messages;
CREATE TRIGGER trg_notify_peer_chat_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_peer_chat_message();

-- ─── 3) Recherche membres pour « Nouveau message » (RLS profiles restreint) ─
CREATE OR REPLACE FUNCTION public.search_profiles_for_chat(
  p_query text,
  p_limit int DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  nom text,
  role text,
  ville text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF p_query IS NULL OR length(trim(p_query)) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    coalesce(nullif(trim(p.nom), ''), 'Membre Yorix') AS nom,
    coalesce(p.role, 'buyer')::text AS role,
    p.ville
  FROM public.profiles p
  WHERE p.id <> auth.uid()
    AND coalesce(p.actif, true) = true
    AND p.deleted_at IS NULL
    AND (
      p.nom ILIKE '%' || trim(p_query) || '%'
      OR p.email ILIKE trim(p_query) || '%'
    )
  ORDER BY
    CASE WHEN p.nom ILIKE trim(p_query) || '%' THEN 0 ELSE 1 END,
    p.nom
  LIMIT greatest(1, least(coalesce(p_limit, 8), 20));
END;
$$;

REVOKE ALL ON FUNCTION public.search_profiles_for_chat(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_chat(text, int) TO authenticated;

-- ─── 4) Éviter conversations dupliquées ──────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_users_no_product
  ON public.conversations (user1_id, user2_id)
  WHERE product_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_users_with_product
  ON public.conversations (user1_id, user2_id, product_id)
  WHERE product_id IS NOT NULL;
