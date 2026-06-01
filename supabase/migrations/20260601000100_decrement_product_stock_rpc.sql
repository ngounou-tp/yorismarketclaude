-- ═══════════════════════════════════════════════════════════════════════════
-- RPC : decrement_product_stock
-- Décrémente atomiquement le stock d'un produit lors d'une commande confirmée.
-- Appelée par la Edge Function confirm_checkout après chaque order_item créé.
--
-- Comportement :
--   • Vérifie que le produit existe et que stock >= p_qty (évite le négatif).
--   • Décrémente stock de p_qty via UPDATE avec FOR UPDATE (verrou de ligne).
--   • Le trigger fn_products_sync_stock_lifecycle se charge automatiquement
--     de mettre à jour stock_status / out_of_stock_since / auto_removal_date.
--   • Retourne le stock restant après décrémentation.
--   • Lève une exception si le produit est introuvable ou si le stock est
--     insuffisant (overselling bloqué).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id uuid,
  p_qty        integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock integer;
  v_new_stock     integer;
BEGIN
  -- Validation des paramètres
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'decrement_product_stock: p_qty doit être > 0 (reçu: %)', p_qty;
  END IF;

  -- Lecture du stock avec verrou de ligne pour éviter les race conditions
  SELECT stock
    INTO v_current_stock
    FROM public.products
   WHERE id = p_product_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'decrement_product_stock: produit % introuvable', p_product_id;
  END IF;

  -- Stock NULL traité comme 0
  v_current_stock := COALESCE(v_current_stock, 0);

  -- Blocage de la survente
  IF v_current_stock < p_qty THEN
    RAISE EXCEPTION
      'decrement_product_stock: stock insuffisant pour le produit % (disponible: %, demandé: %)',
      p_product_id, v_current_stock, p_qty;
  END IF;

  v_new_stock := v_current_stock - p_qty;

  -- Décrémentation — le trigger fn_products_sync_stock_lifecycle prend le relais
  -- pour mettre à jour stock_status, out_of_stock_since, etc.
  UPDATE public.products
     SET stock      = v_new_stock,
         updated_at = NOW()
   WHERE id = p_product_id;

  RETURN v_new_stock;
END;
$$;

-- Seul le service role (Edge Functions) peut appeler cette fonction
REVOKE ALL ON FUNCTION public.decrement_product_stock(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_product_stock(uuid, integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.decrement_product_stock(uuid, integer) FROM anon;
GRANT  EXECUTE ON FUNCTION public.decrement_product_stock(uuid, integer) TO service_role;

COMMENT ON FUNCTION public.decrement_product_stock(uuid, integer) IS
  'Décrémente atomiquement le stock produit lors d''une commande. '
  'Appellée par confirm_checkout Edge Function. '
  'Lève une exception si stock insuffisant (protection anti-survente).';
