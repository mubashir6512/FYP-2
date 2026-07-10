-- Allow public read of profile names (needed so painter names appear on
-- the public Painters listing and on customer booking cards).
-- The existing "Users can view own profile" policy stays; this adds a
-- broader public read policy. Postgres OR-combines permissive policies.

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);
