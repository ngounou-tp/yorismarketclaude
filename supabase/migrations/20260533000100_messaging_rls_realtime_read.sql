-- Messagerie : lecture reçus (RLS + RPC), Realtime messages

-- ─── 1) Destinataire peut marquer les messages comme lus ───────────────────
DROP POLICY IF EXISTS messages_update_recipient_mark_read ON public.messages;

CREATE POLICY messages_update_recipient_mark_read
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
    AND messages.sender_id IS DISTINCT FROM auth.uid()
  )
  WITH CHECK (
    is_read IS TRUE
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- ─── 2) RPC sécurisée (fallback si policy bloquée) ───────────────────────────
CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR p_conversation_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = p_conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  ) THEN
    RETURN;
  END IF;

  UPDATE public.messages
  SET is_read = true
  WHERE conversation_id = p_conversation_id
    AND sender_id IS DISTINCT FROM auth.uid()
    AND coalesce(is_read, false) = false;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_messages_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(uuid) TO authenticated;

-- ─── 3) Realtime sur messages (live chat) ───────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
