-- Add DELETE policy for admins on listings
CREATE POLICY "Admins can delete listings"
ON public.listings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can read ALL listings (including non-active)
CREATE POLICY "Admins can read all listings"
ON public.listings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can read all user_roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));