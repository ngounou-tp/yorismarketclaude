-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY FIXES — from audit 2026-06-02
-- 1. Replace to_jsonb() in conversations/messages RLS policies
-- 2. Restrict deliveries INSERT to client_id = auth.uid() only
-- 3. Add RLS on tables missing protection
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Fix conversations RLS policies (remove to_jsonb) ──────────────────
DO $$
BEGIN
  IF to_regclass('public.conversations') IS NOT NULL THEN
    DROP POLICY IF EXISTS conversations_select_participant_or_admin ON public.conversations;
    DROP POLICY IF EXISTS conversations_insert_participant ON public.conversations;
    DROP POLICY IF EXISTS conversations_update_participant_or_admin ON public.conversations;

    CREATE POLICY conversations_select_participant_or_admin
      ON public.conversations FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR user1_id = auth.uid()
        OR user2_id = auth.uid()
      );

    CREATE POLICY conversations_insert_participant
      ON public.conversations FOR INSERT TO authenticated
      WITH CHECK (
        user1_id = auth.uid()
        OR user2_id = auth.uid()
      );

    CREATE POLICY conversations_update_participant_or_admin
      ON public.conversations FOR UPDATE TO authenticated
      USING (
        public.is_platform_admin()
        OR user1_id = auth.uid()
        OR user2_id = auth.uid()
      )
      WITH CHECK (
        public.is_platform_admin()
        OR user1_id = auth.uid()
        OR user2_id = auth.uid()
      );
  END IF;
END $$;

-- ── 2. Fix messages RLS policies (remove to_jsonb) ───────────────────────
DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS messages_select_participant_or_admin ON public.messages;
    DROP POLICY IF EXISTS messages_insert_sender ON public.messages;
    DROP POLICY IF EXISTS messages_update_sender_or_admin ON public.messages;

    CREATE POLICY messages_select_participant_or_admin
      ON public.messages FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR sender_id = auth.uid()
        OR expediteur_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = messages.conversation_id
            AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        )
      );

    CREATE POLICY messages_insert_sender
      ON public.messages FOR INSERT TO authenticated
      WITH CHECK (
        sender_id = auth.uid()
        OR expediteur_id = auth.uid()
      );

    CREATE POLICY messages_update_sender_or_admin
      ON public.messages FOR UPDATE TO authenticated
      USING (
        public.is_platform_admin()
        OR sender_id = auth.uid()
        OR expediteur_id = auth.uid()
      )
      WITH CHECK (
        public.is_platform_admin()
        OR sender_id = auth.uid()
        OR expediteur_id = auth.uid()
      );
  END IF;
END $$;

-- ── 3. Fix deliveries INSERT — livreur_id should not allow self-assignment ─
DO $$
BEGIN
  IF to_regclass('public.deliveries') IS NOT NULL THEN
    DROP POLICY IF EXISTS deliveries_insert_authenticated_owner_or_admin ON public.deliveries;

    CREATE POLICY deliveries_insert_authenticated_owner_or_admin
      ON public.deliveries FOR INSERT TO authenticated
      WITH CHECK (
        public.is_platform_admin()
        OR client_id = auth.uid()
      );
  END IF;
END $$;

-- ── 4. Add RLS on tables missing protection ───────────────────────────────

-- academy_requests
DO $$
BEGIN
  IF to_regclass('public.academy_requests') IS NOT NULL THEN
    ALTER TABLE public.academy_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.academy_requests FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS academy_requests_select_own_or_admin ON public.academy_requests;
    DROP POLICY IF EXISTS academy_requests_insert_authenticated ON public.academy_requests;

    CREATE POLICY academy_requests_insert_authenticated
      ON public.academy_requests FOR INSERT TO authenticated
      WITH CHECK (true);

    CREATE POLICY academy_requests_select_own_or_admin
      ON public.academy_requests FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR (user_id IS NOT NULL AND user_id = auth.uid())
      );

    GRANT SELECT, INSERT ON public.academy_requests TO authenticated;
  END IF;
END $$;

-- business_requests
DO $$
BEGIN
  IF to_regclass('public.business_requests') IS NOT NULL THEN
    ALTER TABLE public.business_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.business_requests FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS business_requests_select_own_or_admin ON public.business_requests;
    DROP POLICY IF EXISTS business_requests_insert_authenticated ON public.business_requests;

    CREATE POLICY business_requests_insert_authenticated
      ON public.business_requests FOR INSERT TO authenticated
      WITH CHECK (true);

    CREATE POLICY business_requests_select_own_or_admin
      ON public.business_requests FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR (user_id IS NOT NULL AND user_id = auth.uid())
      );

    GRANT SELECT, INSERT ON public.business_requests TO authenticated;
  END IF;
END $$;

-- loyalty_packs — public read (anyone can see available packs), admin write
DO $$
BEGIN
  IF to_regclass('public.loyalty_packs') IS NOT NULL THEN
    ALTER TABLE public.loyalty_packs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS loyalty_packs_select_public ON public.loyalty_packs;
    DROP POLICY IF EXISTS loyalty_packs_admin_all ON public.loyalty_packs;

    CREATE POLICY loyalty_packs_select_public
      ON public.loyalty_packs FOR SELECT
      USING (true);

    CREATE POLICY loyalty_packs_admin_all
      ON public.loyalty_packs FOR ALL TO authenticated
      USING (public.is_platform_admin())
      WITH CHECK (public.is_platform_admin());

    GRANT SELECT ON public.loyalty_packs TO anon, authenticated;
    GRANT INSERT, UPDATE, DELETE ON public.loyalty_packs TO authenticated;
  END IF;
END $$;

-- loyalty_redemptions — user sees their own, admin sees all
DO $$
BEGIN
  IF to_regclass('public.loyalty_redemptions') IS NOT NULL THEN
    ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.loyalty_redemptions FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS loyalty_redemptions_select_own_or_admin ON public.loyalty_redemptions;
    DROP POLICY IF EXISTS loyalty_redemptions_insert_own ON public.loyalty_redemptions;

    CREATE POLICY loyalty_redemptions_select_own_or_admin
      ON public.loyalty_redemptions FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR user_id = auth.uid()
      );

    CREATE POLICY loyalty_redemptions_insert_own
      ON public.loyalty_redemptions FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    GRANT SELECT, INSERT ON public.loyalty_redemptions TO authenticated;
  END IF;
END $$;

-- reviews — public read, authenticated write own
DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS reviews_select_public ON public.reviews;
    DROP POLICY IF EXISTS reviews_insert_own ON public.reviews;
    DROP POLICY IF EXISTS reviews_update_own_or_admin ON public.reviews;
    DROP POLICY IF EXISTS reviews_delete_own_or_admin ON public.reviews;

    CREATE POLICY reviews_select_public
      ON public.reviews FOR SELECT
      USING (true);

    CREATE POLICY reviews_insert_own
      ON public.reviews FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY reviews_update_own_or_admin
      ON public.reviews FOR UPDATE TO authenticated
      USING (public.is_platform_admin() OR user_id = auth.uid())
      WITH CHECK (public.is_platform_admin() OR user_id = auth.uid());

    CREATE POLICY reviews_delete_own_or_admin
      ON public.reviews FOR DELETE TO authenticated
      USING (public.is_platform_admin() OR user_id = auth.uid());

    GRANT SELECT ON public.reviews TO anon, authenticated;
    GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
  END IF;
END $$;

-- ── 5. Fix notifications constraint : update existing rows with bad priority
DO $$
BEGIN
  UPDATE public.notifications
  SET priority = 'high'
  WHERE priority IN ('important', 'promo')
     OR priority NOT IN ('low', 'standard', 'normal', 'high', 'urgent', 'business', 'critical');
EXCEPTION WHEN check_violation THEN
  -- If constraint blocks UPDATE, disable it first
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_priority_check;
  UPDATE public.notifications
  SET priority = 'high'
  WHERE priority IN ('important', 'promo')
     OR priority IS NULL
     OR priority NOT IN ('low', 'standard', 'normal', 'high', 'urgent', 'business', 'critical');
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_priority_check
    CHECK (priority IN ('low', 'standard', 'normal', 'high', 'urgent', 'business', 'critical'));
  ALTER TABLE public.notifications ALTER COLUMN priority SET DEFAULT 'standard';
END;
$$;
