-- Add missing columns to emily_customers table for CSV import
ALTER TABLE emily_customers 
ADD COLUMN IF NOT EXISTS marketing_text_opt_in boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS agree_to_liability_waiver boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pre_arketa_milestone_count integer,
ADD COLUMN IF NOT EXISTS transactional_text_opt_in boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS first_seen date,
ADD COLUMN IF NOT EXISTS last_seen date;