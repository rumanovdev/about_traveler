CREATE OR REPLACE FUNCTION public.assign_partner_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot assign role to another user';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'partner')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;