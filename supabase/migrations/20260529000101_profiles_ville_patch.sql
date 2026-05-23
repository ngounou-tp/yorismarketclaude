-- Patch idempotent : colonnes profiles manquantes en prod (ville, adresse, created_at).
-- À exécuter si 20260529000100 a échoué sur le backfill users → profiles.
-- Ensuite relancer le bloc DO $$ backfill + les RPC depuis 20260529000100 (ligne ~23 à la fin).

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS ville text NULL,
  ADD COLUMN IF NOT EXISTS adresse text NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS email_original text NULL,
  ADD COLUMN IF NOT EXISTS ban_reason text NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_actif
  ON public.profiles (actif)
  WHERE coalesce(actif, true) = false;
