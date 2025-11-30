-- ==========================================
-- RIZIK MAJOR: ACADEMIC ECONOMY
-- ==========================================

-- 1. DEPARTMENTS TABLE
-- Stores the list of verified departments (e.g., CSE, Law, BBA)
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., "Computer Science & Engineering"
    short_name TEXT, -- e.g., "CSE"
    icon_url TEXT, -- URL to department icon
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed some initial departments
INSERT INTO public.departments (name, short_name, icon_url) VALUES
('Computer Science & Engineering', 'CSE', 'https://api.iconify.design/mdi:code-braces.svg'),
('Law & Justice', 'Law', 'https://api.iconify.design/mdi:gavel.svg'),
('Business Administration', 'BBA', 'https://api.iconify.design/mdi:briefcase.svg'),
('English Literature', 'English', 'https://api.iconify.design/mdi:book-open-page-variant.svg')
ON CONFLICT (name) DO NOTHING;

-- 2. UPDATE USER PROFILES
-- Add academic identity fields
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS student_id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'; -- Array of skills e.g. ['Python', 'Drafting']

-- 3. RLS POLICIES (Optional but good practice)
-- Allow read access to departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to departments"
ON public.departments FOR SELECT
USING (true);

-- 4. GIGS TABLE (The Job Vault)
CREATE TYPE gig_status AS ENUM ('open', 'assigned', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(10, 2) NOT NULL,
    status gig_status DEFAULT 'open',
    escrow_status TEXT DEFAULT 'pending', -- pending, locked, released, refunded
    
    -- The Critical Link
    required_department TEXT NOT NULL, -- e.g., "Law", "CSE" (Could be FK, but keeping simple for text matching)
    
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Gigs
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all gigs"
ON public.gigs FOR SELECT
USING (true);

CREATE POLICY "Allow insert for authenticated users"
ON public.gigs FOR INSERT
WITH CHECK (auth.uid() = created_by);
