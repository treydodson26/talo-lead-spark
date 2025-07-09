-- Create customer segment enum (if not exists)
DO $$ BEGIN
    CREATE TYPE customer_segment AS ENUM ('prenatal', 'seniors', 'young-professionals', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create lead status enum (if not exists)
DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'in-progress', 'converted', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create communication status enum (if not exists)
DO $$ BEGIN
    CREATE TYPE communication_status AS ENUM ('sent', 'failed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create email template type enum (if not exists)
DO $$ BEGIN
    CREATE TYPE email_template_type AS ENUM ('welcome', 'follow-up', 're-engagement', 'post-class');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger type enum (if not exists)
DO $$ BEGIN
    CREATE TYPE trigger_type AS ENUM ('new-lead', 'intro-purchase', 'first-class', 'inactive-90-days');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create leads table (SREQ-008, 009, 010, 011)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  referral_source TEXT NOT NULL,
  segment customer_segment DEFAULT 'general',
  status lead_status NOT NULL DEFAULT 'new',
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table (SREQ-001, 002, 003, 004, 005, 006)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type email_template_type NOT NULL,
  segment customer_segment,
  delay_hours INTEGER DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communication sequences table (SREQ-002, 003, 005)
CREATE TABLE IF NOT EXISTS public.communication_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type trigger_type NOT NULL,
  segment customer_segment,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence steps table (linking sequences to templates)
CREATE TABLE IF NOT EXISTS public.sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.communication_sequences(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communication history table (SREQ-016)
CREATE TABLE IF NOT EXISTS public.communication_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type communication_type NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  sequence_id UUID REFERENCES public.communication_sequences(id),
  subject TEXT,
  content TEXT NOT NULL,
  status communication_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create QR codes table (SREQ-008)
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scan_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this is a studio management system)
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
CREATE POLICY "Allow all operations on leads" ON public.leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on email_templates" ON public.email_templates;
CREATE POLICY "Allow all operations on email_templates" ON public.email_templates FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on communication_sequences" ON public.communication_sequences;
CREATE POLICY "Allow all operations on communication_sequences" ON public.communication_sequences FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on sequence_steps" ON public.sequence_steps;
CREATE POLICY "Allow all operations on sequence_steps" ON public.sequence_steps FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on communication_history" ON public.communication_history;
CREATE POLICY "Allow all operations on communication_history" ON public.communication_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on qr_codes" ON public.qr_codes;
CREATE POLICY "Allow all operations on qr_codes" ON public.qr_codes FOR ALL USING (true);

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_segment ON public.leads(segment);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON public.leads(submitted_at);
CREATE INDEX IF NOT EXISTS idx_leads_referral_source ON public.leads(referral_source);

CREATE INDEX IF NOT EXISTS idx_communication_history_lead_id ON public.communication_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_communication_history_sent_at ON public.communication_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_communication_history_status ON public.communication_history(status);

CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence_id ON public.sequence_steps(sequence_id);
CREATE INDEX IF NOT EXISTS idx_sequence_steps_order ON public.sequence_steps(step_order);

-- Create triggers for updated_at timestamps (check if not exists)
DO $$ BEGIN
    CREATE TRIGGER update_leads_updated_at
      BEFORE UPDATE ON public.leads
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_email_templates_updated_at
      BEFORE UPDATE ON public.email_templates
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_communication_sequences_updated_at
      BEFORE UPDATE ON public.communication_sequences
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_qr_codes_updated_at
      BEFORE UPDATE ON public.qr_codes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert default email templates (only if they don't exist)
INSERT INTO public.email_templates (name, subject, content, type, segment, delay_hours) 
SELECT * FROM (VALUES
  ('Welcome - General', 'Welcome to Talo Yoga Studio! Your Journey Begins Here', 
   'Hi {{name}},

Thank you for your interest in Talo Yoga Studio! We''re excited to welcome you to our community.

We received your inquiry and wanted to reach out personally to help you get started on your yoga journey. Our studio offers a variety of classes suitable for all levels, from gentle restorative sessions to more dynamic flows.

What''s next?
• Browse our class schedule at [studio website]
• Book your first class online or call us
• Arrive 15 minutes early for a studio tour

We''re here to support you every step of the way. Feel free to reach out with any questions!

Namaste,
The Talo Yoga Team', 'welcome'::email_template_type, 'general'::customer_segment, 2),

  ('Welcome - Prenatal', 'Welcome to Talo Yoga - Supporting You Through Your Pregnancy',
   'Hi {{name}},

Congratulations on your pregnancy! We''re honored you''ve chosen Talo Yoga to support you during this special time.

Our prenatal yoga classes are specifically designed to help you:
• Build strength and flexibility safely
• Connect with your growing baby
• Prepare your body for birth
• Find community with other expecting mothers

Important: Please bring a note from your healthcare provider clearing you for prenatal yoga.

Looking forward to seeing you in class!

With love and light,
The Talo Yoga Team', 'welcome'::email_template_type, 'prenatal'::customer_segment, 2),

  ('Follow-up Day 3', 'How was your first week at Talo Yoga?',
   'Hi {{name}},

We hope you''ve had a chance to explore our class offerings! It''s been a few days since we first connected, and we wanted to check in.

Starting a yoga practice can feel overwhelming, but remember - every expert was once a beginner. Here are some beginner-friendly classes we recommend:
• Gentle Flow (Mondays & Wednesdays)
• Restorative Yoga (Friday evenings)
• Yoga Basics (Saturday mornings)

Ready to book your first class? Reply to this email or give us a call at [phone number].

We can''t wait to see you on the mat!

Peace and light,
The Talo Yoga Team', 'follow-up'::email_template_type, 'general'::customer_segment, 72),

  ('Re-engagement - Come Back', 'We miss you at Talo Yoga!',
   'Hi {{name}},

We noticed it''s been a while since your last visit to Talo Yoga, and we miss having you in our community!

Life gets busy - we understand. But your wellness journey doesn''t have to pause. We''d love to welcome you back with a special offer:

🧘‍♀️ 50% off your next class
🌟 Complimentary meditation session
💫 Personal check-in with one of our instructors

This offer is valid for the next 2 weeks. Simply mention this email when booking.

Your mat is waiting for you.

With gratitude,
The Talo Yoga Team', 're-engagement'::email_template_type, 'general'::customer_segment, 0)
) AS new_templates(name, subject, content, type, segment, delay_hours)
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE email_templates.name = new_templates.name
);

-- Insert default communication sequences (only if they don't exist)
INSERT INTO public.communication_sequences (name, description, trigger_type, segment) 
SELECT * FROM (VALUES
  ('New Lead Follow-up Sequence', '3 touchpoints over 7 days for new prospects', 'new-lead'::trigger_type, 'general'::customer_segment),
  ('Re-engagement Campaign', 'Win-back sequence for inactive customers', 'inactive-90-days'::trigger_type, 'general'::customer_segment)
) AS new_sequences(name, description, trigger_type, segment)
WHERE NOT EXISTS (
  SELECT 1 FROM public.communication_sequences WHERE communication_sequences.name = new_sequences.name
);