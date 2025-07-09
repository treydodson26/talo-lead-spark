-- Fix RLS policies for automation testing functionality
-- First drop all existing policies, then create new ones

-- Drop existing policies for communication_sequences
DROP POLICY IF EXISTS "Allow anonymous access to communication_sequences" ON public.communication_sequences;
DROP POLICY IF EXISTS "Allow authenticated access to communication_sequences" ON public.communication_sequences;
DROP POLICY IF EXISTS "Enable read access for all users on communication_sequences" ON public.communication_sequences;

-- Drop existing policies for sequence_steps
DROP POLICY IF EXISTS "Allow anonymous access to sequence_steps" ON public.sequence_steps;
DROP POLICY IF EXISTS "Allow authenticated access to sequence_steps" ON public.sequence_steps;

-- Drop existing policies for email_templates
DROP POLICY IF EXISTS "Allow anonymous access to email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow authenticated access to email_templates" ON public.email_templates;

-- Drop existing policies for communication_history
DROP POLICY IF EXISTS "Allow anonymous access to communication_history" ON public.communication_history;
DROP POLICY IF EXISTS "Allow authenticated access to communication_history" ON public.communication_history;

-- Create new policies for communication_sequences
CREATE POLICY "Allow all access to communication_sequences"
ON public.communication_sequences FOR ALL
USING (true)
WITH CHECK (true);

-- Create new policies for sequence_steps
CREATE POLICY "Allow all access to sequence_steps"
ON public.sequence_steps FOR ALL
USING (true)
WITH CHECK (true);

-- Create new policies for email_templates
CREATE POLICY "Allow all access to email_templates"
ON public.email_templates FOR ALL
USING (true)
WITH CHECK (true);

-- Create new policies for communication_history
CREATE POLICY "Allow all access to communication_history"
ON public.communication_history FOR ALL
USING (true)
WITH CHECK (true);