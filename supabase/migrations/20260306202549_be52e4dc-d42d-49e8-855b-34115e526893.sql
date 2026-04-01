
-- Drop the permissive analytics policies
DROP POLICY "Anyone can track analytics" ON public.listing_analytics;
DROP POLICY "Anyone can update analytics" ON public.listing_analytics;

-- Analytics tracking will be done via the security definer function track_listing_event
-- No direct INSERT/UPDATE needed from clients
