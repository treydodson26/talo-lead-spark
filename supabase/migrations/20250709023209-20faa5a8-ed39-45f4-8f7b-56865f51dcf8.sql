-- Update email templates to be WhatsApp message templates
UPDATE public.email_templates SET 
  content = 'Hi {{name}}! 🧘‍♀️

Welcome to Talo Yoga Studio! We''re excited to have you join our community.

Your yoga journey starts here. Our classes are designed for all levels - from gentle flows to dynamic sessions.

Next steps:
📅 Book your first class online
⏰ Arrive 15 minutes early for orientation  
📱 Save this number for updates

Questions? Just reply to this message!

Namaste 🙏
Talo Yoga Team'
WHERE name = 'Welcome - General';

UPDATE public.email_templates SET 
  content = 'Hi {{name}}! 🤱

Congratulations on your pregnancy! We''re honored to support you during this special time.

Our prenatal yoga classes help you:
💪 Build strength safely
🤱 Connect with your baby
👶 Prepare for birth
👭 Meet other expecting moms

Important: Please bring healthcare provider clearance for prenatal yoga.

Ready to start? Book your first class online!

With love 💕
Talo Yoga Team'
WHERE name = 'Welcome - Prenatal';

UPDATE public.email_templates SET 
  content = 'Hi {{name}}! 👋

Hope you''ve been exploring our yoga offerings! We wanted to check in after a few days.

Starting yoga can feel overwhelming, but remember - every expert was once a beginner! 

Try these beginner-friendly classes:
🌅 Gentle Flow (Mon & Wed)
😌 Restorative Yoga (Fri evenings)
📚 Yoga Basics (Sat mornings)

Ready to book? Reply to this message or visit our website!

We can''t wait to see you on the mat! 🧘‍♀️

Talo Yoga Team'
WHERE name = 'Follow-up Day 3';

UPDATE public.email_templates SET 
  content = 'Hi {{name}}! 💜

We miss you at Talo Yoga! It''s been a while since your last visit.

Life gets busy - we understand. But your wellness doesn''t have to pause! 

Special comeback offer:
🧘‍♀️ 50% off your next class
🌟 Free meditation session
💫 Personal instructor check-in

Valid for 2 weeks - just mention this message when booking!

Your mat is waiting for you 🙏

Talo Yoga Team'
WHERE name = 'Re-engagement - Come Back';