-- Fix RPC « Nouveau message » : search_profiles_for_chat
-- Corrige PGRST202 / schema cache + signature PostgREST (p_query, p_limit integer)

-- Supprimer anciennes signatures éventuelles
DROP FUNCTION IF EXISTS public.search_profiles_for_chat(text, int);
DROP FUNCTION IF EXISTS public.search_profiles_for_chat(text, integer);

CREATE OR REPLACE FUNCTION public.search_profiles_for_chat(
  p_query text,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  role text,
  ville text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_q text := trim(coalesce(p_query, ''));
  v_lim integer := greatest(1, least(coalesce(p_limit, 10), 25));
  v_sql text;
  v_has_deleted boolean := false;
  v_has_actif boolean := false;
  v_has_avatar boolean := false;
BEGIN
  IF auth.uid() IS NULL OR length(v_q) < 2 THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'deleted_at'
  ) INTO v_has_deleted;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'actif'
  ) INTO v_has_actif;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) INTO v_has_avatar;

  v_sql := format(
    $q$
    SELECT
      p.id,
      coalesce(
        nullif(
          lower(regexp_replace(
            coalesce(nullif(trim(p.nom), ''), split_part(coalesce(p.email, ''), '@', 1), 'membre'),
            '[^a-zA-Z0-9]+', '', 'g'
          )),
          ''
        ),
        'membre'
      ) AS username,
      coalesce(nullif(trim(p.nom), ''), 'Membre Yorix') AS full_name,
      %s AS avatar_url,
      coalesce(p.role, 'buyer')::text AS role,
      p.ville
    FROM public.profiles p
    WHERE p.id <> $1
      %s
      %s
      AND (
        coalesce(p.nom, '') ILIKE '%%' || $2 || '%%'
        OR coalesce(p.email, '') ILIKE $2 || '%%'
        OR coalesce(split_part(p.email, '@', 1), '') ILIKE '%%' || $2 || '%%'
      )
    ORDER BY
      CASE
        WHEN coalesce(p.nom, '') ILIKE $2 || '%%' THEN 0
        WHEN coalesce(split_part(p.email, '@', 1), '') ILIKE $2 || '%%' THEN 1
        ELSE 2
      END,
      p.nom NULLS LAST
    LIMIT $3
    $q$,
    CASE WHEN v_has_avatar THEN 'p.avatar_url' ELSE 'NULL::text' END,
    CASE WHEN v_has_actif THEN 'AND coalesce(p.actif, true) = true' ELSE '' END,
    CASE WHEN v_has_deleted THEN 'AND p.deleted_at IS NULL' ELSE '' END
  );

  RETURN QUERY EXECUTE v_sql USING auth.uid(), v_q, v_lim;
END;
$$;

COMMENT ON FUNCTION public.search_profiles_for_chat(text, integer) IS
  'Recherche membres pour démarrer une conversation (nom, e-mail, pseudo e-mail).';

REVOKE ALL ON FUNCTION public.search_profiles_for_chat(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_chat(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_chat(text, integer) TO service_role;

-- Rafraîchir le cache PostgREST / Supabase API
NOTIFY pgrst, 'reload schema';
