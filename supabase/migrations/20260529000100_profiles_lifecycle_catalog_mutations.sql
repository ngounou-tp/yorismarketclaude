-- Profiles lifecycle (soft ban / hard delete) + catalog delete RPC
-- Migration 100 % vers profiles (legacy public.users → backfill puis révocation)

-- ─── Colonnes lifecycle + champs profil (si absents en prod) ───────────────
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS email_original text NULL,
  ADD COLUMN IF NOT EXISTS ban_reason text NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ville text NULL,
  ADD COLUMN IF NOT EXISTS adresse text NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_actif
  ON public.profiles (actif)
  WHERE coalesce(actif, true) = false;

-- ─── Backfill legacy public.users → profiles (colonnes dynamiques) ───────────
DO $$
DECLARE
  v_sql text;
  v_ins_cols text := 'id';
  v_sel_cols text := 'u.uid::uuid';
  v_upd_sets text := '';
  v_map record;
  v_users_has boolean;
  v_prof_has boolean;
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'uid'
  ) THEN
    RAISE NOTICE 'public.users sans colonne uid — backfill ignoré';
    REVOKE ALL ON public.users FROM authenticated;
    REVOKE ALL ON public.users FROM anon;
    REVOKE ALL ON public.users FROM public;
    RETURN;
  END IF;

  -- prof_col, users_col, select expression when users col exists
  FOR v_map IN
    SELECT * FROM (VALUES
      ('nom',       'nom',       'u.nom'),
      ('email',     'email',     'u.email'),
      ('telephone', 'telephone', 'u.telephone'),
      ('role',      'role',      'coalesce(u.role, ''buyer'')'),
      ('actif',     'actif',     'coalesce(u.actif, true)'),
      ('verifie',   'verifie',   'coalesce(u.verifie, false)'),
      ('ville',     'ville',     'u.ville'),
      ('created_at','created_at','coalesce(u.created_at, now())')
    ) AS m(prof_col, users_col, sel_expr)
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = v_map.prof_col
    ) INTO v_prof_has;

    IF NOT v_prof_has THEN
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = v_map.users_col
    ) INTO v_users_has;

    v_ins_cols := v_ins_cols || ', ' || quote_ident(v_map.prof_col);

    IF v_users_has THEN
      v_sel_cols := v_sel_cols || ', ' || v_map.sel_expr;
    ELSIF v_map.prof_col = 'created_at' THEN
      v_sel_cols := v_sel_cols || ', now()';
    ELSIF v_map.prof_col = 'role' THEN
      v_sel_cols := v_sel_cols || ', ''buyer''::text';
    ELSIF v_map.prof_col = 'actif' THEN
      v_sel_cols := v_sel_cols || ', true';
    ELSIF v_map.prof_col = 'verifie' THEN
      v_sel_cols := v_sel_cols || ', false';
    ELSE
      v_sel_cols := v_sel_cols || ', NULL';
    END IF;

    v_upd_sets := v_upd_sets || format(
      ', %I = coalesce(excluded.%I, public.profiles.%I)',
      v_map.prof_col, v_map.prof_col, v_map.prof_col
    );
  END LOOP;

  v_sql := format(
    'INSERT INTO public.profiles (%s) SELECT %s FROM public.users u WHERE u.uid IS NOT NULL ON CONFLICT (id) DO UPDATE SET %s',
    v_ins_cols,
    v_sel_cols,
    ltrim(v_upd_sets, ', ')
  );

  EXECUTE v_sql;

  REVOKE ALL ON public.users FROM authenticated;
  REVOKE ALL ON public.users FROM anon;
  REVOKE ALL ON public.users FROM public;

  RAISE NOTICE 'Backfill users → profiles terminé';
END $$;

-- ─── Produit : détection commandes liées ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_product_has_orders(p_product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o WHERE o.product_id = p_product_id
  ) OR EXISTS (
    SELECT 1 FROM public.order_items oi WHERE oi.product_id = p_product_id
  );
$$;

REVOKE ALL ON FUNCTION public.fn_product_has_orders(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_product_has_orders(uuid) TO authenticated;

-- ─── Produit : suppression (soft si commandes, hard sinon) ─────────────────
CREATE OR REPLACE FUNCTION public.fn_delete_product(
  p_product_id uuid,
  p_hard_delete boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_has_orders boolean;
  v_is_admin boolean;
BEGIN
  SELECT * INTO v_product FROM public.products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produit introuvable';
  END IF;

  v_is_admin := public.is_platform_admin();

  IF NOT v_is_admin AND v_product.vendeur_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  v_has_orders := public.fn_product_has_orders(p_product_id);

  -- Commandes existantes → soft delete obligatoire
  IF v_has_orders THEN
    UPDATE public.products SET
      actif = false,
      is_archived = true,
      hidden_from_marketplace = true,
      updated_at = now()
    WHERE id = p_product_id;
    RETURN jsonb_build_object('ok', true, 'mode', 'soft', 'has_orders', true);
  END IF;

  -- Sans commande : vendeur → hard delete ; admin → soft par défaut, hard si demandé
  IF v_is_admin AND NOT p_hard_delete THEN
    UPDATE public.products SET
      actif = false,
      is_archived = true,
      hidden_from_marketplace = true,
      updated_at = now()
    WHERE id = p_product_id;
    RETURN jsonb_build_object('ok', true, 'mode', 'soft', 'has_orders', false);
  END IF;

  DELETE FROM public.products WHERE id = p_product_id;
  RETURN jsonb_build_object('ok', true, 'mode', 'hard', 'has_orders', false);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_delete_product(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_delete_product(uuid, boolean) TO authenticated;

-- ─── Utilisateur : soft ban (réversible) ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_admin_soft_ban_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de suspendre votre propre compte';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  UPDATE public.profiles SET
    actif = false,
    deactivated_at = now(),
    ban_reason = nullif(trim(p_reason), ''),
    updated_at = now()
  WHERE id = p_user_id
    AND deleted_at IS NULL;

  RETURN jsonb_build_object('ok', true, 'mode', 'soft_ban');
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_soft_ban_user(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_admin_soft_ban_user(uuid, text) TO authenticated;

-- ─── Utilisateur : réactivation ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_admin_reactivate_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  UPDATE public.profiles SET
    actif = true,
    deactivated_at = NULL,
    ban_reason = NULL,
    updated_at = now()
  WHERE id = p_user_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur introuvable ou supprimé définitivement';
  END IF;

  RETURN jsonb_build_object('ok', true, 'mode', 'reactivated');
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_reactivate_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_admin_reactivate_user(uuid) TO authenticated;

-- ─── Utilisateur : hard delete (anonymisation profil) ──────────────────────
CREATE OR REPLACE FUNCTION public.fn_admin_hard_delete_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de supprimer votre propre compte';
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  IF v_role IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Impossible de supprimer un administrateur';
  END IF;

  UPDATE public.profiles SET
    actif = false,
    deleted_at = now(),
    deactivated_at = coalesce(deactivated_at, now()),
    email_original = coalesce(email_original, email),
    email = 'deleted+' || p_user_id::text || '@yorix.local',
    nom = 'Utilisateur supprimé',
    telephone = NULL,
    adresse = NULL,
    ban_reason = coalesce(ban_reason, 'Suppression définitive admin'),
    updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'mode', 'hard_delete', 'user_id', p_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_hard_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_admin_hard_delete_user(uuid) TO authenticated;

-- ─── Mise à jour rôle (admin, profiles uniquement) ─────────────────────────
CREATE OR REPLACE FUNCTION public.fn_admin_update_user_role(
  p_user_id uuid,
  p_new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_new_role NOT IN ('buyer', 'seller', 'delivery', 'provider', 'admin', 'admin_partner', 'superadmin') THEN
    RAISE EXCEPTION 'Rôle invalide';
  END IF;

  UPDATE public.profiles SET role = p_new_role, updated_at = now()
  WHERE id = p_user_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  RETURN jsonb_build_object('ok', true, 'role', p_new_role);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_update_user_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_admin_update_user_role(uuid, text) TO authenticated;
