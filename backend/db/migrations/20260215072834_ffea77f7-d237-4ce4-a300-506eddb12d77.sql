
-- Painter job requests from customers
CREATE TABLE public.painter_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  painter_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT,
  location TEXT NOT NULL DEFAULT '',
  job_type TEXT NOT NULL DEFAULT 'interior',
  description TEXT,
  scheduled_date DATE,
  scheduled_time TEXT,
  estimated_hours INT DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.painter_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Painters can manage own jobs"
  ON public.painter_jobs FOR ALL
  TO authenticated
  USING (auth.uid() = painter_id);

CREATE POLICY "Customers can view own job requests"
  ON public.painter_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create job requests"
  ON public.painter_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can view all jobs"
  ON public.painter_jobs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Painter reviews from customers
CREATE TABLE public.painter_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  painter_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  job_id UUID REFERENCES public.painter_jobs(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.painter_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.painter_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON public.painter_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own reviews"
  ON public.painter_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Trigger for updated_at on painter_jobs
CREATE TRIGGER update_painter_jobs_updated_at
  BEFORE UPDATE ON public.painter_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
