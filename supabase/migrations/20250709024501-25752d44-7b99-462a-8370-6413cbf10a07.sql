-- Fix RLS policies for leads table to allow anonymous access
-- This fixes the permission denied errors

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous access to leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated access to leads" ON public.leads;

-- Create new policies that actually work for anonymous access (no authentication required)
CREATE POLICY "Enable insert for anonymous users" ON public.leads
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable select for anonymous users" ON public.leads
FOR SELECT 
USING (true);

CREATE POLICY "Enable update for anonymous users" ON public.leads
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for anonymous users" ON public.leads
FOR DELETE 
USING (true);