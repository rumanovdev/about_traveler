-- Booking tracker: single table for taxi/transfer, rent-a-car, activity records

CREATE TYPE public.booking_category AS ENUM ('taxi_transfer', 'rent_a_car', 'activity');

CREATE TABLE public.booking_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.booking_category NOT NULL,
  date date,
  first_name text,
  last_name text,
  time text,
  pickup_location text,       -- taxi/transfer + rent_a_car
  destination text,           -- taxi/transfer only
  final_price numeric,
  partner_name text,          -- taxi/transfer only
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_records ENABLE ROW LEVEL SECURITY;

-- Partner sees own records
CREATE POLICY "Users can view own booking records"
  ON public.booking_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own booking records"
  ON public.booking_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own booking records"
  ON public.booking_records FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own booking records"
  ON public.booking_records FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Admin sees all
CREATE POLICY "Admins can view all booking records"
  ON public.booking_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all booking records"
  ON public.booking_records FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all booking records"
  ON public.booking_records FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_booking_records_user_id ON public.booking_records(user_id);
CREATE INDEX idx_booking_records_category ON public.booking_records(category);
CREATE INDEX idx_booking_records_date ON public.booking_records(date DESC);

-- Reuse existing updated_at trigger
CREATE TRIGGER set_booking_records_updated_at
  BEFORE UPDATE ON public.booking_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
