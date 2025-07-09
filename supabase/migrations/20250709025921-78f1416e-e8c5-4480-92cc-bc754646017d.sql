-- Fix permission denied errors for communication automation tables
-- Grant explicit permissions to the authenticator role

-- Grant table permissions to authenticator role
GRANT ALL ON public.communication_sequences TO authenticator;
GRANT ALL ON public.sequence_steps TO authenticator;
GRANT ALL ON public.email_templates TO authenticator;
GRANT ALL ON public.communication_history TO authenticator;
GRANT ALL ON public.leads TO authenticator;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- Also grant to anon role for unauthenticated access
GRANT ALL ON public.communication_sequences TO anon;
GRANT ALL ON public.sequence_steps TO anon;
GRANT ALL ON public.email_templates TO anon;
GRANT ALL ON public.communication_history TO anon;
GRANT ALL ON public.leads TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure RLS is enabled but policies allow access
ALTER TABLE public.communication_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;

-- Double-check that our policies exist and are correct
DROP POLICY IF EXISTS "Allow all access to communication_sequences" ON public.communication_sequences;
CREATE POLICY "Allow all access to communication_sequences"
ON public.communication_sequences FOR ALL
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to sequence_steps" ON public.sequence_steps;
CREATE POLICY "Allow all access to sequence_steps"
ON public.sequence_steps FOR ALL
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to email_templates" ON public.email_templates;
CREATE POLICY "Allow all access to email_templates"
ON public.email_templates FOR ALL
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to communication_history" ON public.communication_history;
CREATE POLICY "Allow all access to communication_history"
ON public.communication_history FOR ALL
TO public
USING (true)
WITH CHECK (true);