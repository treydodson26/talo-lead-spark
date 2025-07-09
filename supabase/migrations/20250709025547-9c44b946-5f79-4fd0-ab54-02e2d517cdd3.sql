-- Fix RLS policies for automation testing functionality

-- Grant access to communication_sequences table
DROP POLICY IF EXISTS "Allow anonymous access to communication_sequences" ON public.communication_sequences;
DROP POLICY IF EXISTS "Allow authenticated access to communication_sequences" ON public.communication_sequences;

CREATE POLICY "Enable read access for all users on communication_sequences"
ON public.communication_sequences FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users on communication_sequences"
ON public.communication_sequences FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users on communication_sequences"
ON public.communication_sequences FOR UPDATE
USING (true);

-- Grant access to sequence_steps table
DROP POLICY IF EXISTS "Allow anonymous access to sequence_steps" ON public.sequence_steps;
DROP POLICY IF EXISTS "Allow authenticated access to sequence_steps" ON public.sequence_steps;

CREATE POLICY "Enable read access for all users on sequence_steps"
ON public.sequence_steps FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users on sequence_steps"
ON public.sequence_steps FOR INSERT
WITH CHECK (true);

-- Grant access to email_templates table
DROP POLICY IF EXISTS "Allow anonymous access to email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow authenticated access to email_templates" ON public.email_templates;

CREATE POLICY "Enable read access for all users on email_templates"
ON public.email_templates FOR SELECT
USING (true);

-- Grant access to communication_history table
DROP POLICY IF EXISTS "Allow anonymous access to communication_history" ON public.communication_history;
DROP POLICY IF EXISTS "Allow authenticated access to communication_history" ON public.communication_history;

CREATE POLICY "Enable read access for all users on communication_history"
ON public.communication_history FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users on communication_history"
ON public.communication_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users on communication_history"
ON public.communication_history FOR UPDATE
USING (true);