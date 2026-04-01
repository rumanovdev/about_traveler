
-- Allow authenticated users to read display_name of any profile (needed for chats, listing pages)
CREATE POLICY "Authenticated can read basic profile info"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
