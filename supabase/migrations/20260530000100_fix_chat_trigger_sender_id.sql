-- Fix: fn_notify_peer_chat_message référençait NEW.expediteur_id (colonne absente)
-- → erreur « record "new" has no field "expediteur_id" » à l'envoi d'un message.

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

  SELECT coalesce(p.nom, 'Un membre Yorix') INTO v_sender_name
  FROM public.profiles p
  WHERE p.id = v_sender;

  v_preview := left(
    coalesce(
      nullif(trim(NEW.content), ''),
      CASE WHEN NEW.image_url IS NOT NULL THEN '📷 Photo' ELSE 'Nouveau message' END
    ),
    180
  );

  INSERT INTO public.notifications (user_id, type, title, message, link, lu, category, priority, payload)
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_peer_chat_message ON public.messages;
CREATE TRIGGER trg_notify_peer_chat_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_peer_chat_message();
