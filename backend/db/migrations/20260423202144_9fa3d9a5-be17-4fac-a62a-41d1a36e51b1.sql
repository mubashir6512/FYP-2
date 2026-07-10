-- Create job_messages table for customer/painter chat
CREATE TABLE public.job_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.painter_jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'painter')),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_messages_job_created ON public.job_messages(job_id, created_at);
CREATE INDEX idx_job_messages_unread ON public.job_messages(job_id, sender_id) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;

-- Helper: check if a user is a participant in the job
CREATE OR REPLACE FUNCTION public.is_job_participant(_job_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.painter_jobs
    WHERE id = _job_id
      AND (customer_id = _user_id OR painter_id = _user_id)
  )
$$;

-- Participants can read messages
CREATE POLICY "Participants can view job messages"
ON public.job_messages
FOR SELECT
TO authenticated
USING (public.is_job_participant(job_id, auth.uid()));

-- Participants can insert messages as themselves
CREATE POLICY "Participants can send job messages"
ON public.job_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_job_participant(job_id, auth.uid())
);

-- Recipient can mark messages as read (update only their unread incoming msgs)
CREATE POLICY "Recipients can mark messages read"
ON public.job_messages
FOR UPDATE
TO authenticated
USING (
  public.is_job_participant(job_id, auth.uid())
  AND sender_id <> auth.uid()
)
WITH CHECK (
  public.is_job_participant(job_id, auth.uid())
  AND sender_id <> auth.uid()
);

-- Realtime
ALTER TABLE public.job_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_messages;

