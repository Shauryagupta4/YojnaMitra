-- ==============================================================================
-- YojanaMitra Live Schemes & Scholarships Cache with Auto-Expiry
-- Table: public.live_schemes
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.live_schemes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  persona TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  benefit_text TEXT,
  benefit_type TEXT,
  approx_amount NUMERIC,
  eligibility_criteria TEXT[] DEFAULT '{}',
  application_url TEXT,
  official_portal TEXT,
  source_url TEXT,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  verification_status TEXT DEFAULT 'verified',
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_live_schemes_lookup 
  ON public.live_schemes (state, persona, is_active);

CREATE INDEX IF NOT EXISTS idx_live_schemes_deadline 
  ON public.live_schemes (deadline);

CREATE INDEX IF NOT EXISTS idx_live_schemes_category 
  ON public.live_schemes (category);

-- Auto-Expiry View: Returns ONLY currently valid, open, and strictly verified schemes
CREATE OR REPLACE VIEW public.active_valid_schemes AS
SELECT * 
FROM public.live_schemes
WHERE is_active = TRUE
  AND verification_status = 'verified'
  AND (deadline IS NULL OR deadline >= NOW());

-- Row Level Security (RLS)
ALTER TABLE public.live_schemes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active, non-expired, verified schemes only
DROP POLICY IF EXISTS "Allow public read active schemes" ON public.live_schemes;
CREATE POLICY "Allow public read active schemes" 
ON public.live_schemes 
FOR SELECT 
USING (
  is_active = TRUE 
  AND verification_status = 'verified'
  AND (deadline IS NULL OR deadline >= NOW())
);

-- Allow service role full management access
DROP POLICY IF EXISTS "Allow service role full access" ON public.live_schemes;
CREATE POLICY "Allow service role full access" 
ON public.live_schemes 
FOR ALL 
USING (auth.role() = 'service_role');

-- Cleanup Helper: Marks expired schemes as inactive
CREATE OR REPLACE FUNCTION public.archive_expired_schemes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE public.live_schemes
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE is_active = TRUE
    AND deadline IS NOT NULL
    AND deadline < NOW();
    
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$;
