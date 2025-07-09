-- Create sequence steps for automated follow-up campaigns
-- This implements SREQ-002: 3 touchpoints over 7 days

-- Get the sequence IDs we need
DO $$
DECLARE
    follow_up_sequence_id UUID;
    welcome_general_template_id UUID;
    follow_up_template_id UUID;
    reengagement_sequence_id UUID;
    reengagement_template_id UUID;
BEGIN
    -- Get the follow-up sequence ID
    SELECT id INTO follow_up_sequence_id 
    FROM public.communication_sequences 
    WHERE name = 'New Lead Follow-up Sequence';
    
    -- Get template IDs
    SELECT id INTO welcome_general_template_id 
    FROM public.email_templates 
    WHERE name = 'Welcome - General';
    
    SELECT id INTO follow_up_template_id 
    FROM public.email_templates 
    WHERE name = 'Follow-up Day 3';
    
    SELECT id INTO reengagement_template_id 
    FROM public.email_templates 
    WHERE name = 'Re-engagement - Come Back';
    
    SELECT id INTO reengagement_sequence_id 
    FROM public.communication_sequences 
    WHERE name = 'Re-engagement Campaign';

    -- Insert sequence steps for follow-up campaign (SREQ-002)
    INSERT INTO public.sequence_steps (sequence_id, template_id, step_order, delay_hours) VALUES
    (follow_up_sequence_id, welcome_general_template_id, 1, 2),     -- Welcome immediately (2 hours)
    (follow_up_sequence_id, follow_up_template_id, 2, 72),          -- Follow-up after 3 days
    (follow_up_sequence_id, reengagement_template_id, 3, 168);      -- Final follow-up after 7 days

    -- Insert sequence steps for re-engagement campaign (SREQ-005)
    INSERT INTO public.sequence_steps (sequence_id, template_id, step_order, delay_hours) VALUES
    (reengagement_sequence_id, reengagement_template_id, 1, 0);     -- Immediate re-engagement message

END $$;

-- Create additional follow-up templates for the sequence
INSERT INTO public.email_templates (name, subject, content, type, segment, delay_hours) VALUES
('Follow-up Day 7', 'Your yoga journey awaits! 🌟', 
'Hi {{name}}! 💫

We haven''t heard from you lately, and we wanted to reach out one more time!

Your wellness journey is important, and we''re here to support you every step of the way.

🎁 SPECIAL OFFER: Book any class this week and get:
• 20% off your first month
• Free yoga mat rental
• Complimentary wellness consultation

This offer expires in 3 days, so don''t miss out!

Ready to start? Reply to this message or visit our website.

We believe in you! 🧘‍♀️✨

Talo Yoga Team', 'follow-up', 'general', 168),

('Intro Package Follow-up', 'How''s your intro package going? 🧘‍♀️', 
'Hi {{name}}! 🌸

You''re halfway through your intro package - how exciting! We hope you''re loving your yoga journey so far.

Quick check-in:
✨ Have you tried different class styles?
💪 Are you feeling stronger and more flexible?
😌 How''s your stress level?

Remember, your intro package includes:
• Unlimited classes for 30 days
• Free yoga mat rental
• Access to our meditation library
• New student support

Need help choosing your next class? Just reply to this message!

Keep shining! ⭐

Talo Yoga Team', 'follow-up', 'general', 360); -- 15 days into intro

-- Create function to trigger sequence automation
CREATE OR REPLACE FUNCTION public.trigger_communication_sequence(
    p_lead_id UUID,
    p_trigger_type trigger_type,
    p_segment customer_segment DEFAULT 'general'
)
RETURNS VOID AS $$
DECLARE
    sequence_record RECORD;
    step_record RECORD;
    template_record RECORD;
BEGIN
    -- Find active sequences for this trigger type and segment
    FOR sequence_record IN 
        SELECT id, name 
        FROM public.communication_sequences 
        WHERE trigger_type = p_trigger_type 
        AND (segment = p_segment OR segment IS NULL)
        AND is_active = true
        ORDER BY segment DESC NULLS LAST -- Prefer segment-specific sequences
        LIMIT 1
    LOOP
        -- Queue all steps in the sequence
        FOR step_record IN
            SELECT template_id, delay_hours, step_order
            FROM public.sequence_steps 
            WHERE sequence_id = sequence_record.id 
            ORDER BY step_order
        LOOP
            -- Get template details
            SELECT content, subject INTO template_record
            FROM public.email_templates 
            WHERE id = step_record.template_id;
            
            -- Insert into communication history with delay
            INSERT INTO public.communication_history (
                lead_id,
                type,
                template_id,
                sequence_id,
                subject,
                content,
                status,
                created_at
            ) VALUES (
                p_lead_id,
                'SMS',
                step_record.template_id,
                sequence_record.id,
                template_record.subject,
                template_record.content,
                'pending',
                now() + (step_record.delay_hours || ' hours')::interval
            );
        END LOOP;
        
        -- Log sequence trigger
        RAISE NOTICE 'Triggered sequence % for lead %', sequence_record.name, p_lead_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to process scheduled messages (ready to send)
CREATE OR REPLACE FUNCTION public.get_ready_messages()
RETURNS TABLE (
    id UUID,
    lead_id UUID,
    template_id UUID,
    sequence_id UUID,
    content TEXT,
    lead_name TEXT,
    lead_phone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ch.id,
        ch.lead_id,
        ch.template_id,
        ch.sequence_id,
        ch.content,
        l.name as lead_name,
        l.phone as lead_phone
    FROM public.communication_history ch
    JOIN public.leads l ON ch.lead_id = l.id
    WHERE ch.status = 'pending'
    AND ch.type = 'SMS'
    AND ch.created_at <= now() -- Message is ready to send
    ORDER BY ch.created_at ASC
    LIMIT 50; -- Process in batches
END;
$$ LANGUAGE plpgsql;