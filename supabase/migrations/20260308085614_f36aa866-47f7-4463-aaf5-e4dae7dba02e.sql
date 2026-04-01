-- Performance indexes for 5000+ listings
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings (category_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings (slug);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings (user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_status ON public.listings (category_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_analytics_listing_date ON public.listing_analytics (listing_id, date);
CREATE INDEX IF NOT EXISTS idx_contact_messages_listing_id ON public.contact_messages (listing_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);