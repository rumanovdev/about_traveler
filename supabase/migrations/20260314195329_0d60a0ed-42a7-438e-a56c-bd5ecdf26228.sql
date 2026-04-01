
-- Chat rooms: one per visitor-listing pair
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, visitor_id)
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Visitor can see own rooms
CREATE POLICY "Visitors can see own chat rooms" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (auth.uid() = visitor_id);

-- Partners can see rooms for their listings
CREATE POLICY "Partners can see rooms for own listings" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.listings WHERE listings.id = chat_rooms.listing_id AND listings.user_id = auth.uid()
  ));

-- Visitors can create rooms
CREATE POLICY "Visitors can create chat rooms" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = visitor_id);

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Participants can read messages in their rooms
CREATE POLICY "Participants can read chat messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.chat_rooms r
    WHERE r.id = chat_messages.room_id
      AND (r.visitor_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.listings l WHERE l.id = r.listing_id AND l.user_id = auth.uid()
      ))
  ));

-- Participants can send messages
CREATE POLICY "Participants can send chat messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id = chat_messages.room_id
        AND (r.visitor_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.listings l WHERE l.id = r.listing_id AND l.user_id = auth.uid()
        ))
    )
  );

-- Participants can update (mark as read)
CREATE POLICY "Participants can update chat messages" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.chat_rooms r
    WHERE r.id = chat_messages.room_id
      AND (r.visitor_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.listings l WHERE l.id = r.listing_id AND l.user_id = auth.uid()
      ))
  ));

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
