CREATE POLICY "Partners can delete own listings"
ON public.listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND has_role(auth.uid(), 'partner'::app_role));