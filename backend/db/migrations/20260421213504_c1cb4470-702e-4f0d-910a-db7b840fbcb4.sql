-- Approval status enum
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Account approvals table
CREATE TABLE public.account_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  status public.approval_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_account_approvals_status ON public.account_approvals(status);
CREATE INDEX idx_account_approvals_user_id ON public.account_approvals(user_id);

ALTER TABLE public.account_approvals ENABLE ROW LEVEL SECURITY;

-- Users can view their own approval status
CREATE POLICY "Users view own approval"
  ON public.account_approvals FOR SELECT
  USING (auth.uid() = user_id);

-- Admins manage all approvals
CREATE POLICY "Admins manage all approvals"
  ON public.account_approvals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_account_approvals_updated_at
  BEFORE UPDATE ON public.account_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to also create approval row
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

  -- Customers and admins are auto-approved; dealers/painters need review
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

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: check if a user account is approved
CREATE OR REPLACE FUNCTION public.is_account_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT status = 'approved' FROM public.account_approvals WHERE user_id = _user_id),
    true  -- legacy users with no approval row are treated as approved
  );
$$;

-- Backfill existing users so they aren't locked out
INSERT INTO public.account_approvals (user_id, role, status, reviewed_at)
SELECT ur.user_id, ur.role, 'approved'::approval_status, now()
FROM public.user_roles ur
LEFT JOIN public.account_approvals aa ON aa.user_id = ur.user_id
WHERE aa.user_id IS NULL;

