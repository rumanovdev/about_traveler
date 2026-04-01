
-- Fix profiles_public view: recreate with security_invoker (already set, but enable RLS)
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- Fix chat_messages: restrict recipients to only updating is_read
-- Revoke general UPDATE, grant column-level
REVOKE UPDATE ON public.chat_messages FROM authenticated;
GRANT UPDATE (is_read) ON public.chat_messages TO authenticated;

-- Drop and recreate the recipients policy to only allow is_read changes
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.chat_messages;
CREATE POLICY "Recipients can mark messages read"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms r
      WHERE r.id = chat_messages.room_id
      AND chat_messages.sender_id != auth.uid()
      AND (
        r.visitor_id = auth.uid()
        OR EXISTS (SELECT 1 FROM listings l WHERE l.id = r.listing_id AND l.user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms r
      WHERE r.id = chat_messages.room_id
      AND chat_messages.sender_id != auth.uid()
      AND (
        r.visitor_id = auth.uid()
        OR EXISTS (SELECT 1 FROM listings l WHERE l.id = r.listing_id AND l.user_id = auth.uid())
      )
    )
  );

-- Re-grant full UPDATE for senders (they need to edit message content)
DROP POLICY IF EXISTS "Senders can update own messages" ON public.chat_messages;
GRANT UPDATE ON public.chat_messages TO authenticated;
CREATE POLICY "Senders can update own messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
