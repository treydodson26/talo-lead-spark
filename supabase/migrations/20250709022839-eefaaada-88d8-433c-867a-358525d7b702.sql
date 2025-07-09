-- Fix RLS policies to allow anonymous access for studio management
-- This is a studio management system, so we need public access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow all operations on communication_sequences" ON public.communication_sequences;
DROP POLICY IF EXISTS "Allow all operations on sequence_steps" ON public.sequence_steps;
DROP POLICY IF EXISTS "Allow all operations on communication_history" ON public.communication_history;
DROP POLICY IF EXISTS "Allow all operations on qr_codes" ON public.qr_codes;

-- Create permissive policies for anonymous users
CREATE POLICY "Allow anonymous access to leads" ON public.leads 
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to email_templates" ON public.email_templates 
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to communication_sequences" ON public.communication_sequences 
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to sequence_steps" ON public.sequence_steps 
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to communication_history" ON public.communication_history 
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to qr_codes" ON public.qr_codes 
FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also allow authenticated users
CREATE POLICY "Allow authenticated access to leads" ON public.leads 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to email_templates" ON public.email_templates 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to communication_sequences" ON public.communication_sequences 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to sequence_steps" ON public.sequence_steps 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to communication_history" ON public.communication_history 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to qr_codes" ON public.qr_codes 
FOR ALL TO authenticated USING (true) WITH CHECK (true);