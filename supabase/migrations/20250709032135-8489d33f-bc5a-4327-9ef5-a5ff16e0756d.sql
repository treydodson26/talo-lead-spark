-- Create enum for certification levels
CREATE TYPE public.certification_level AS ENUM ('200hr', '500hr', 'advanced');

-- Create enum for class status
CREATE TYPE public.class_status AS ENUM ('scheduled', 'completed', 'cancelled', 'needs_substitute');

-- Create enum for substitute request status
CREATE TYPE public.substitute_request_status AS ENUM ('pending', 'filled', 'escalated', 'cancelled');

-- Create instructors table
CREATE TABLE public.instructors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    certification_level certification_level NOT NULL DEFAULT '200hr',
    base_rate DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    per_student_rate DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    substitute_rate_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    availability_notes TEXT,
    bio TEXT,
    specialties TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES public.instructors(id),
    substitute_instructor_id UUID REFERENCES public.instructors(id),
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 20,
    student_count INTEGER NOT NULL DEFAULT 0,
    status class_status NOT NULL DEFAULT 'scheduled',
    is_substitute_class BOOLEAN NOT NULL DEFAULT false,
    substitute_notice_hours INTEGER,
    room TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll_records table
CREATE TABLE public.payroll_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID NOT NULL REFERENCES public.instructors(id),
    class_id UUID NOT NULL REFERENCES public.classes(id),
    base_payment DECIMAL(10,2) NOT NULL,
    student_payment DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_payment DECIMAL(10,2) NOT NULL,
    is_substitute BOOLEAN NOT NULL DEFAULT false,
    substitute_multiplier DECIMAL(3,2),
    payment_date DATE,
    gusto_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create substitute_requests table
CREATE TABLE public.substitute_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id),
    original_instructor_id UUID NOT NULL REFERENCES public.instructors(id),
    requested_by TEXT,
    request_reason TEXT,
    notice_hours INTEGER NOT NULL,
    priority_level INTEGER NOT NULL DEFAULT 1, -- 1=normal, 2=urgent, 3=emergency
    status substitute_request_status NOT NULL DEFAULT 'pending',
    filled_by_instructor_id UUID REFERENCES public.instructors(id),
    filled_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    broadcast_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instructor_availability table
CREATE TABLE public.instructor_availability (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID NOT NULL REFERENCES public.instructors(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(instructor_id, day_of_week, start_time, end_time)
);

-- Enable RLS on all tables
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitute_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all access for now - you can restrict later based on user roles)
CREATE POLICY "Allow all access to instructors" ON public.instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payroll_records" ON public.payroll_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to substitute_requests" ON public.substitute_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to instructor_availability" ON public.instructor_availability FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON public.instructors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON public.payroll_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_substitute_requests_updated_at BEFORE UPDATE ON public.substitute_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instructor_availability_updated_at BEFORE UPDATE ON public.instructor_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate payroll
CREATE OR REPLACE FUNCTION public.calculate_instructor_payment(
    p_instructor_id UUID,
    p_class_id UUID,
    p_student_count INTEGER,
    p_is_substitute BOOLEAN DEFAULT false,
    p_notice_hours INTEGER DEFAULT NULL
)
RETURNS TABLE(
    base_payment DECIMAL(10,2),
    student_payment DECIMAL(10,2),
    total_payment DECIMAL(10,2),
    substitute_multiplier DECIMAL(3,2)
) AS $$
DECLARE
    instructor_record RECORD;
    base_amount DECIMAL(10,2);
    student_amount DECIMAL(10,2);
    multiplier DECIMAL(3,2) := 1.00;
    total_amount DECIMAL(10,2);
BEGIN
    -- Get instructor rates
    SELECT base_rate, per_student_rate, substitute_rate_multiplier
    INTO instructor_record
    FROM public.instructors 
    WHERE id = p_instructor_id;
    
    -- Calculate base payment
    base_amount := instructor_record.base_rate;
    
    -- Calculate student-based payment
    student_amount := instructor_record.per_student_rate * p_student_count;
    
    -- Apply substitute multiplier if it's a substitute class with short notice
    IF p_is_substitute AND p_notice_hours IS NOT NULL AND p_notice_hours < 24 THEN
        multiplier := instructor_record.substitute_rate_multiplier;
    END IF;
    
    -- Calculate total
    total_amount := (base_amount + student_amount) * multiplier;
    
    RETURN QUERY SELECT base_amount, student_amount, total_amount, multiplier;
END;
$$ LANGUAGE plpgsql;

-- Create function to find available substitutes
CREATE OR REPLACE FUNCTION public.find_available_substitutes(
    p_class_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_original_instructor_id UUID
)
RETURNS TABLE(
    instructor_id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    certification_level certification_level
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        i.id,
        i.first_name,
        i.last_name,
        i.email,
        i.phone,
        i.certification_level
    FROM public.instructors i
    LEFT JOIN public.instructor_availability ia ON i.id = ia.instructor_id
    WHERE i.is_active = true
    AND i.id != p_original_instructor_id
    AND (
        ia.day_of_week = EXTRACT(DOW FROM p_class_date)
        AND ia.start_time <= p_start_time
        AND ia.end_time >= p_end_time
        AND ia.is_available = true
    )
    -- Exclude instructors who already have a class at this time
    AND NOT EXISTS (
        SELECT 1 FROM public.classes c
        WHERE (c.instructor_id = i.id OR c.substitute_instructor_id = i.id)
        AND c.scheduled_date = p_class_date
        AND c.start_time < p_end_time
        AND c.end_time > p_start_time
        AND c.status != 'cancelled'
    )
    ORDER BY i.certification_level DESC, i.first_name, i.last_name;
END;
$$ LANGUAGE plpgsql;