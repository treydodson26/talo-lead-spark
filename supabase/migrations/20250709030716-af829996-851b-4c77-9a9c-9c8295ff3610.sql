-- Grant permissions for emily_customers table
GRANT ALL ON public.emily_customers TO authenticator;
GRANT ALL ON public.emily_customers TO anon;

-- Enable RLS and create permissive policy
ALTER TABLE public.emily_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to emily_customers" ON public.emily_customers;
CREATE POLICY "Allow all access to emily_customers"
ON public.emily_customers FOR ALL
TO public
USING (true)
WITH CHECK (true);