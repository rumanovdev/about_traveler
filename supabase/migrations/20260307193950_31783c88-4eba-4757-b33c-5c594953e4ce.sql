
CREATE POLICY "Partners can delete own messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = contact_messages.listing_id
    AND listings.user_id = auth.uid()
  )
);
