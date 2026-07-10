-- Painter public profile (extends profiles)
CREATE TABLE public.painter_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  painter_id UUID NOT NULL UNIQUE,
  specialty TEXT NOT NULL DEFAULT 'Interior & Exterior',
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  bio TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  skills TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.painter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view painter profiles"
  ON public.painter_profiles FOR SELECT
  USING (true);

CREATE POLICY "Painters can insert own profile"
  ON public.painter_profiles FOR INSERT
  WITH CHECK (auth.uid() = painter_id);

CREATE POLICY "Painters can update own profile"
  ON public.painter_profiles FOR UPDATE
  USING (auth.uid() = painter_id);

CREATE TRIGGER update_painter_profiles_updated_at
  BEFORE UPDATE ON public.painter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to also create painter_profiles row for painters
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role public.app_role;
  initial_status public.approval_status;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer');

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  IF user_role IN ('dealer', 'painter') THEN
    initial_status := 'pending';
  ELSE
    initial_status := 'approved';
  END IF;

  INSERT INTO public.account_approvals (user_id, role, status, reviewed_at)
  VALUES (
    NEW.id,
    user_role,
    initial_status,
    CASE WHEN initial_status = 'approved' THEN now() ELSE NULL END
  );

  -- Auto-create painter profile shell
  IF user_role = 'painter' THEN
    INSERT INTO public.painter_profiles (painter_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill painter_profiles for existing painters
INSERT INTO public.painter_profiles (painter_id)
SELECT user_id FROM public.user_roles
WHERE role = 'painter'
  AND user_id NOT IN (SELECT painter_id FROM public.painter_profiles);

