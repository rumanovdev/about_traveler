ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS type text DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS recommended_for text[] DEFAULT '{}'::text[];