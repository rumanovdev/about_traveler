
-- Remove the overly broad policy
DROP POLICY IF EXISTS "Authenticated can read basic profile info" ON public.profiles;
