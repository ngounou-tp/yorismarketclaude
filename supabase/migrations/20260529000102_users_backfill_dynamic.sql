-- Backfill users → profiles uniquement (schéma legacy variable).
-- Exécuter si le backfill statique a échoué (ex. users sans colonne ville).
-- Idempotent. Puis exécuter les RPC fn_* depuis 20260529000100 si pas encore fait.

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
    RAISE NOTICE 'public.users absent — rien à migrer';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'uid'
  ) THEN
    REVOKE ALL ON public.users FROM authenticated;
    REVOKE ALL ON public.users FROM anon;
    REVOKE ALL ON public.users FROM public;
    RETURN;
  END IF;

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
    IF NOT v_prof_has THEN CONTINUE; END IF;

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
    v_ins_cols, v_sel_cols, ltrim(v_upd_sets, ', ')
  );

  EXECUTE v_sql;

  REVOKE ALL ON public.users FROM authenticated;
  REVOKE ALL ON public.users FROM anon;
  REVOKE ALL ON public.users FROM public;

  RAISE NOTICE 'Backfill users → profiles OK';
END $$;
