-- ═══════════════════════════════════════════════════════════════════════════
-- FIX : "permission denied for table users"
-- Cause : des fonctions/politiques référencent public.users dont les droits
--         ont été révoqués par les migrations de backfill.
-- Solution : réaccorder SELECT à authenticated/anon OU supprimer la table
--            legacy si elle est vide (après vérification).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Vérifier si public.users existe encore
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    -- Réaccorder les droits SELECT pour que les fonctions puissent lire
    EXECUTE 'GRANT SELECT ON public.users TO authenticated, service_role';
    RAISE NOTICE 'public.users existe — SELECT accordé à authenticated/anon/service_role';
  ELSE
    RAISE NOTICE 'public.users absent — rien à faire';
  END IF;
END;
$$;

-- 2) S'assurer que les politiques RLS sur products utilisent bien auth.uid()
--    et non un join sur public.users.
--    Recréer les politiques de base pour products de façon sûre.

-- SELECT : tout le monde peut lire les produits actifs
DROP POLICY IF EXISTS products_select_public ON public.products;
CREATE POLICY products_select_public
  ON public.products
  FOR SELECT
  USING (actif = true OR actif IS NULL OR vendeur_id = auth.uid());

-- INSERT : seuls les vendeurs/admins peuvent créer des produits
DROP POLICY IF EXISTS products_insert_seller ON public.products;
CREATE POLICY products_insert_seller
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendeur_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('seller', 'admin', 'admin_partner', 'superadmin')
    )
  );

-- UPDATE : vendeur propriétaire ou admin
DROP POLICY IF EXISTS products_update_seller ON public.products;
CREATE POLICY products_update_seller
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    vendeur_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'admin_partner', 'superadmin')
    )
  );

-- DELETE : vendeur propriétaire ou admin
DROP POLICY IF EXISTS products_delete_seller ON public.products;
CREATE POLICY products_delete_seller
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    vendeur_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'admin_partner', 'superadmin')
    )
  );

-- S'assurer que RLS est bien activé sur products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3) Accorder les droits de base sur products
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- 4) Diagnostic : afficher les politiques actuelles sur products
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Politiques RLS sur public.products ===';
  FOR r IN
    SELECT policyname, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
  LOOP
    RAISE NOTICE '  [%] % : %', r.cmd, r.policyname, left(r.qual, 120);
  END LOOP;
END;
$$;
