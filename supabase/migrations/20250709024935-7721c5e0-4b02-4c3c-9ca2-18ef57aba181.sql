-- Implement Intro Package Automation (SREQ-003) and Post-Class Follow-up (SREQ-004)

-- First, let's add new trigger types
ALTER TYPE trigger_type ADD VALUE 'intro-package-purchased';
ALTER TYPE trigger_type ADD VALUE 'first-class-attended';

-- Create email templates for intro package sequence (5 touchpoints over 30 days)
INSERT INTO public.email_templates (name, subject, content, type, segment, delay_hours) VALUES
('Intro Package Welcome', 'Welcome to your Talo Yoga journey! 🧘‍♀️✨', 
'Hi {{name}}! 🌟

Welcome to Talo Yoga and congratulations on starting your wellness journey with our 30-day intro package!

Here''s what you can expect:
✨ Unlimited classes for 30 days
🧘‍♀️ Access to all class styles (Vinyasa, Hatha, Yin, Power)
📱 Free yoga mat rental for every class
🎧 Complimentary meditation library access
👥 New student support and guidance

Your intro package is active starting today! We recommend trying different class styles to find what resonates with you.

Ready for your first class? Check our schedule and book your spot!

Namaste 🙏
The Talo Yoga Team', 'intro-package', 'general', 0),

('Intro Package Week 1', 'How''s your first week going? 🌱', 
'Hi {{name}}! 🌸

You''re one week into your Talo Yoga journey - how are you feeling?

Week 1 Reflection:
💪 Have you noticed any changes in your strength or flexibility?
😌 How''s your stress level compared to last week?
🧘‍♀️ Which class style has been your favorite so far?

Week 2 Suggestions:
• Try a different class time to fit your schedule
• Experiment with new instructors
• Don''t forget about our meditation library!

Remember: Your body is adapting and every practice counts, even if it feels challenging.

You''re doing amazing! Keep showing up for yourself ⭐

Love & Light,
Talo Yoga Team', 'intro-package', 'general', 168),

('Intro Package Mid-Point', 'Halfway there! You''re crushing it! 💪', 
'Hi {{name}}! 🎉

You''re officially halfway through your intro package - this is HUGE!

Your Progress So Far:
🌟 You''ve committed to your wellness for 2+ weeks
💪 Your body is getting stronger every day
🧘‍♀️ You''re building a sustainable yoga practice

What Our Students Say at This Point:
"I sleep better and feel more centered"
"My back pain has decreased significantly"
"I actually CRAVE my yoga time now!"

For Your Next Two Weeks:
• Challenge yourself with a new class style
• Set an intention for each practice
• Connect with other students - our community is amazing!

Fun fact: Studies show it takes 21 days to form a habit. You''re already there! 🎯

Keep shining bright ✨
Talo Yoga Team', 'intro-package', 'general', 360),

('Intro Package Week 3', 'You''re in the zone! Final week prep 🔥', 
'Hi {{name}}! 🚀

Week 3 complete - you''re officially in the yoga flow zone!

What''s Happening in Your Body:
🧘‍♀️ Increased flexibility and balance
💪 Better core strength and posture
😌 Improved stress management
🌙 Enhanced sleep quality

As You Enter Your Final Week:
• Reflect on your transformation
• Consider your post-intro package goals
• Ask yourself: How do you want to continue this journey?

Special Invitation:
Join us for a complimentary consultation to discuss membership options that fit your lifestyle and budget. We''d love to support your continued growth!

Your transformation has been beautiful to witness 💫

With gratitude,
Talo Yoga Team', 'intro-package', 'general', 528),

('Intro Package Final Push', 'Last few days - finish strong! 🏁', 
'Hi {{name}}! ⏰

Your 30-day intro package expires in just a few days - time to finish strong!

Look How Far You''ve Come:
✅ Committed to 30 days of wellness
✅ Tried multiple yoga styles
✅ Built strength, flexibility, and mindfulness
✅ Created a self-care routine

Don''t Let This Momentum Stop!
🎯 Book your remaining classes now
💝 Special offer: 20% off your first month membership (expires when your intro does!)
📞 Schedule your free consultation today

This isn''t an ending - it''s the beginning of a lifelong practice that will serve you in every aspect of life.

Ready to continue your journey with us?

Forever your yoga family 💕
Talo Yoga Team', 'intro-package', 'general', 672),

-- Create post-class follow-up template (SREQ-004)
('First Class Follow-up', 'How was your first class? 🌟', 
'Hi {{name}}! 💫

How did your first class at Talo Yoga feel? We hope you left feeling energized and centered!

Quick Check-in:
😊 How are you feeling physically?
🧘‍♀️ Did the class meet your expectations?
❓ Do you have any questions about your practice?

What''s Next:
📅 Your next class is just a click away
🔄 Try different styles to find your favorites
💬 Feel free to ask your instructors anything

Remember: Every expert was once a beginner. You''re exactly where you need to be.

We''re so grateful you chose to start your yoga journey with us!

Can''t wait to see you on the mat again 🙏

With love,
Your Talo Yoga Family', 'follow-up', 'general', 4);

-- Create communication sequences for new trigger types
INSERT INTO public.communication_sequences (name, description, trigger_type, segment, is_active) VALUES
('Intro Package Journey', '5-touchpoint sequence distributed over 30-day intro package period', 'intro-package-purchased', 'general', true),
('First Class Follow-up', 'Post-class follow-up message sent 4 hours after first class attendance', 'first-class-attended', 'general', true);

-- Set up sequence steps for intro package (5 interactions over 30 days)
DO $$
DECLARE
    intro_sequence_id UUID;
    welcome_template_id UUID;
    week1_template_id UUID;
    midpoint_template_id UUID;
    week3_template_id UUID;
    final_template_id UUID;
BEGIN
    -- Get sequence ID
    SELECT id INTO intro_sequence_id 
    FROM public.communication_sequences 
    WHERE name = 'Intro Package Journey';
    
    -- Get template IDs
    SELECT id INTO welcome_template_id FROM public.email_templates WHERE name = 'Intro Package Welcome';
    SELECT id INTO week1_template_id FROM public.email_templates WHERE name = 'Intro Package Week 1';
    SELECT id INTO midpoint_template_id FROM public.email_templates WHERE name = 'Intro Package Mid-Point';
    SELECT id INTO week3_template_id FROM public.email_templates WHERE name = 'Intro Package Week 3';
    SELECT id INTO final_template_id FROM public.email_templates WHERE name = 'Intro Package Final Push';

    -- Insert sequence steps (5 touchpoints distributed over 30 days)
    INSERT INTO public.sequence_steps (sequence_id, template_id, step_order, delay_hours) VALUES
    (intro_sequence_id, welcome_template_id, 1, 0),      -- Immediate welcome
    (intro_sequence_id, week1_template_id, 2, 168),      -- Week 1 (7 days)
    (intro_sequence_id, midpoint_template_id, 3, 360),   -- Mid-point (15 days)
    (intro_sequence_id, week3_template_id, 4, 528),      -- Week 3 (22 days)
    (intro_sequence_id, final_template_id, 5, 672);      -- Final push (28 days)
END $$;

-- Set up sequence steps for first class follow-up
DO $$
DECLARE
    followup_sequence_id UUID;
    followup_template_id UUID;
BEGIN
    -- Get sequence ID
    SELECT id INTO followup_sequence_id 
    FROM public.communication_sequences 
    WHERE name = 'First Class Follow-up';
    
    -- Get template ID
    SELECT id INTO followup_template_id FROM public.email_templates WHERE name = 'First Class Follow-up';

    -- Insert sequence step (4 hours after first class)
    INSERT INTO public.sequence_steps (sequence_id, template_id, step_order, delay_hours) VALUES
    (followup_sequence_id, followup_template_id, 1, 4);  -- 4 hours after first class
END $$;

-- Update the trigger_communication_sequence function to handle new triggers
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