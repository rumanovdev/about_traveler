
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous contact form)
CREATE POLICY "Anyone can send a message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Partner can read messages for their own listings
CREATE POLICY "Partners can read messages for own listings"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = contact_messages.listing_id
    AND listings.user_id = auth.uid()
  )
);

-- Partner can update (mark as read) messages for their own listings
CREATE POLICY "Partners can update own messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = contact_messages.listing_id
    AND listings.user_id = auth.uid()
  )
);

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
