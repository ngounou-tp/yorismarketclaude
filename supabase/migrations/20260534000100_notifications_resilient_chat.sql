-- Notifications messagerie : schéma complet + trigger résilient + RPC fallback
-- Le message DOIT toujours être enregistré même si la notification échoue.

-- ─── 1) Colonnes notifications (idempotent) ─────────────────────────────────
ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS type text;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS title text;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS message text;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS link text;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS lu boolean DEFAULT false;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'standard';

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'system';

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, lu)
  WHERE lu IS NOT TRUE;

-- ─── 2) Helper notification chat (ne lève jamais d'exception) ───────────────
CREATE OR REPLACE FUNCTION public.fn_create_chat_notification(
  p_message public.messages
)
RETURNS boolean
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
  v_has_category boolean := false;
  v_has_priority boolean := false;
  v_has_image_url boolean := false;
  v_has_payload boolean := false;
BEGIN
  IF p_message IS NULL OR p_message.conversation_id IS NULL THEN
    RETURN false;
  END IF;

  IF to_regclass('public.conversations') IS NULL
     OR to_regclass('public.notifications') IS NULL THEN
    RETURN false;
  END IF;

  v_sender := p_message.sender_id;
  IF v_sender IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_conv
  FROM public.conversations c
  WHERE c.id = p_message.conversation_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_conv.user1_id = v_sender THEN
    v_recipient := v_conv.user2_id;
  ELSIF v_conv.user2_id = v_sender THEN
    v_recipient := v_conv.user1_id;
  ELSE
    RETURN false;
  END IF;

  IF v_recipient IS NULL OR v_recipient = v_sender THEN
    RETURN false;
  END IF;

  SELECT coalesce(nullif(trim(p.nom), ''), 'Un membre Yorix') INTO v_sender_name
  FROM public.profiles p
  WHERE p.id = v_sender;

  v_preview := left(
    coalesce(
      nullif(trim(p_message.content), ''),
      CASE WHEN p_message.image_url IS NOT NULL THEN '📷 Photo' ELSE 'Nouveau message' END
    ),
    180
  );

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'category'
  ) INTO v_has_category;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'priority'
  ) INTO v_has_priority;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'image_url'
  ) INTO v_has_image_url;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'payload'
  ) INTO v_has_payload;

  IF v_has_category AND v_has_priority AND v_has_image_url AND v_has_payload THEN
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
        'image_url', p_message.image_url
      ),
      p_message.image_url
    );
  ELSIF v_has_category AND v_has_priority AND v_has_payload THEN
    INSERT INTO public.notifications (
      user_id, type, title, message, link, lu, category, priority, payload
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
      jsonb_build_object('conversation_id', v_conv.id, 'sender_id', v_sender)
    );
  ELSIF v_has_payload THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, lu, payload)
    VALUES (
      v_recipient,
      'new_message',
      '💬 ' || v_sender_name,
      v_preview,
      '/dashboard?tab=messages',
      false,
      jsonb_build_object('conversation_id', v_conv.id, 'sender_id', v_sender)
    );
  ELSE
    INSERT INTO public.notifications (user_id, type, title, message, link, lu)
    VALUES (
      v_recipient,
      'new_message',
      '💬 ' || v_sender_name,
      v_preview,
      '/dashboard?tab=messages',
      false
    );
  END IF;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'fn_create_chat_notification: %', SQLERRM;
    BEGIN
      INSERT INTO public.notifications (user_id, type, title, message, link, lu)
      VALUES (
        v_recipient,
        'new_message',
        '💬 ' || coalesce(v_sender_name, 'Un membre Yorix'),
        coalesce(v_preview, 'Nouveau message'),
        '/dashboard?tab=messages',
        false
      );
      RETURN true;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'fn_create_chat_notification minimal: %', SQLERRM;
        RETURN false;
    END;
END;
$$;

-- ─── 3) Trigger AFTER INSERT : ne bloque jamais le message ──────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_peer_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(current_setting('yorix.skip_chat_notif', true), '') = 'true' THEN
    RETURN NEW;
  END IF;

  PERFORM public.fn_create_chat_notification(NEW);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'fn_notify_peer_chat_message: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_peer_chat_message ON public.messages;
CREATE TRIGGER trg_notify_peer_chat_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_peer_chat_message();

-- ─── 4) RPC fallback : message garanti + notification best-effort ───────────
CREATE OR REPLACE FUNCTION public.insert_chat_message_safe(
  p_conversation_id uuid,
  p_content text DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_link_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.messages%rowtype;
  v_body text;
  v_notif_ok boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non connecté';
  END IF;

  IF p_conversation_id IS NULL THEN
    RAISE EXCEPTION 'Conversation introuvable';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = p_conversation_id
      AND (c.user1_id = v_uid OR c.user2_id = v_uid)
  ) THEN
    RAISE EXCEPTION 'Accès refusé à cette conversation';
  END IF;

  v_body := trim(coalesce(p_content, ''));
  IF v_body = '' AND p_image_url IS NULL AND p_link_url IS NULL THEN
    RAISE EXCEPTION 'Message vide';
  END IF;

  IF v_body = '' THEN
    v_body := CASE
      WHEN p_image_url IS NOT NULL THEN '📷 Photo'
      WHEN p_link_url IS NOT NULL THEN '🔗 Lien'
      ELSE ''
    END;
  END IF;

  PERFORM set_config('yorix.skip_chat_notif', 'true', true);

  INSERT INTO public.messages (
    conversation_id, sender_id, content, image_url, link_url
  )
  VALUES (
    p_conversation_id, v_uid, v_body, p_image_url, p_link_url
  )
  RETURNING * INTO v_row;

  PERFORM set_config('yorix.skip_chat_notif', 'false', true);

  v_notif_ok := public.fn_create_chat_notification(v_row);

  UPDATE public.conversations
  SET last_message_at = now()
  WHERE id = p_conversation_id;

  RETURN jsonb_build_object(
    'message', to_jsonb(v_row),
    'notification_ok', v_notif_ok
  );
EXCEPTION
  WHEN OTHERS THEN
    PERFORM set_config('yorix.skip_chat_notif', 'false', true);
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_chat_message_safe(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_chat_message_safe(uuid, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.fn_create_chat_notification(public.messages) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_create_chat_notification(public.messages) TO service_role;

NOTIFY pgrst, 'reload schema';
