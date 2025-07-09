-- Fix RLS policies to allow anonymous access for testing
DROP POLICY IF EXISTS "Allow all access to instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow all access to classes" ON public.classes;
DROP POLICY IF EXISTS "Allow all access to payroll_records" ON public.payroll_records;
DROP POLICY IF EXISTS "Allow all access to substitute_requests" ON public.substitute_requests;
DROP POLICY IF EXISTS "Allow all access to instructor_availability" ON public.instructor_availability;

-- Create new policies that work with anonymous access
CREATE POLICY "Enable all access for anonymous users on instructors" ON public.instructors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anonymous users on classes" ON public.classes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anonymous users on payroll_records" ON public.payroll_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anonymous users on substitute_requests" ON public.substitute_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anonymous users on instructor_availability" ON public.instructor_availability FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also add policies for authenticated users
CREATE POLICY "Enable all access for authenticated users on instructors" ON public.instructors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users on classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users on payroll_records" ON public.payroll_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users on substitute_requests" ON public.substitute_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users on instructor_availability" ON public.instructor_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add sample instructors
INSERT INTO public.instructors (first_name, last_name, email, phone, certification_level, base_rate, per_student_rate, bio, specialties) VALUES
('Sarah', 'Johnson', 'sarah@taloyoga.com', '555-0101', '500hr', 75.00, 8.00, 'Experienced yoga instructor specializing in Vinyasa and meditation practices.', ARRAY['Vinyasa', 'Meditation', 'Prenatal']),
('Michael', 'Chen', 'michael@taloyoga.com', '555-0102', '200hr', 50.00, 5.00, 'Passionate about making yoga accessible to beginners and seniors.', ARRAY['Hatha', 'Gentle', 'Restorative']),
('Emma', 'Rodriguez', 'emma@taloyoga.com', '555-0103', 'advanced', 90.00, 10.00, 'Advanced certified instructor with specialization in therapeutic yoga.', ARRAY['Therapeutic', 'Yin', 'Advanced Poses']),
('David', 'Kim', 'david@taloyoga.com', '555-0104', '200hr', 55.00, 6.00, 'High-energy instructor focused on power yoga and strength building.', ARRAY['Power Yoga', 'Strength', 'Flow']);

-- Add sample classes
INSERT INTO public.classes (name, instructor_id, scheduled_date, start_time, end_time, student_count, status, room) VALUES
('Morning Vinyasa Flow', (SELECT id FROM public.instructors WHERE email = 'sarah@taloyoga.com'), CURRENT_DATE + INTERVAL '1 day', '07:00', '08:00', 15, 'scheduled', 'Studio A'),
('Gentle Hatha', (SELECT id FROM public.instructors WHERE email = 'michael@taloyoga.com'), CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 8, 'completed', 'Studio B'),
('Power Yoga', (SELECT id FROM public.instructors WHERE email = 'david@taloyoga.com'), CURRENT_DATE + INTERVAL '2 days', '18:00', '19:30', 12, 'scheduled', 'Studio A'),
('Therapeutic Yin', (SELECT id FROM public.instructors WHERE email = 'emma@taloyoga.com'), CURRENT_DATE, '19:00', '20:30', 6, 'needs_substitute', 'Studio C');

-- Add instructor availability
INSERT INTO public.instructor_availability (instructor_id, day_of_week, start_time, end_time) VALUES
-- Sarah's availability (Monday to Friday mornings)
((SELECT id FROM public.instructors WHERE email = 'sarah@taloyoga.com'), 1, '06:00', '12:00'),
((SELECT id FROM public.instructors WHERE email = 'sarah@taloyoga.com'), 2, '06:00', '12:00'),
((SELECT id FROM public.instructors WHERE email = 'sarah@taloyoga.com'), 3, '06:00', '12:00'),
((SELECT id FROM public.instructors WHERE email = 'sarah@taloyoga.com'), 4, '06:00', '12:00'),
((SELECT id FROM public.instructors WHERE email = 'sarah@taloyoga.com'), 5, '06:00', '12:00'),

-- Michael's availability (all week, flexible)
((SELECT id FROM public.instructors WHERE email = 'michael@taloyoga.com'), 0, '08:00', '18:00'),
((SELECT id FROM public.instructors WHERE email = 'michael@taloyoga.com'), 1, '08:00', '18:00'),
((SELECT id FROM public.instructors WHERE email = 'michael@taloyoga.com'), 2, '08:00', '18:00'),
((SELECT id FROM public.instructors WHERE email = 'michael@taloyoga.com'), 6, '08:00', '18:00'),

-- David's availability (evenings)
((SELECT id FROM public.instructors WHERE email = 'david@taloyoga.com'), 1, '17:00', '21:00'),
((SELECT id FROM public.instructors WHERE email = 'david@taloyoga.com'), 2, '17:00', '21:00'),
((SELECT id FROM public.instructors WHERE email = 'david@taloyoga.com'), 3, '17:00', '21:00'),
((SELECT id FROM public.instructors WHERE email = 'david@taloyoga.com'), 4, '17:00', '21:00');

-- Add a substitute request for testing
INSERT INTO public.substitute_requests (class_id, original_instructor_id, request_reason, notice_hours, priority_level) VALUES
((SELECT id FROM public.classes WHERE name = 'Therapeutic Yin'), 
 (SELECT id FROM public.instructors WHERE email = 'emma@taloyoga.com'), 
 'Family emergency', 
 4, 
 3);