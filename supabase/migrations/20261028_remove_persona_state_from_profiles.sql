-- ==============================================================================
-- Migration: Remove persona and state columns from public.profiles table
-- ==============================================================================

ALTER TABLE IF EXISTS public.profiles
  DROP COLUMN IF EXISTS persona,
  DROP COLUMN IF EXISTS state;
