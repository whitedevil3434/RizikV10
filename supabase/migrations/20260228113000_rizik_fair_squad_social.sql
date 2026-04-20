-- Rizik Fair + Squad Workforce + Community Surfaces

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1) Fair Core
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rizik_fair_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    event_starts_at TIMESTAMPTZ NOT NULL,
    event_ends_at TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_fair_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fair_event_id UUID NOT NULL REFERENCES public.rizik_fair_events(id) ON DELETE CASCADE,
    department_code TEXT NOT NULL,
    department_name TEXT NOT NULL,
    institution_name TEXT,
    institution_type TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (fair_event_id, department_code)
);

CREATE TABLE IF NOT EXISTS public.rizik_fair_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fair_event_id UUID NOT NULL REFERENCES public.rizik_fair_events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 10,
    task_order INTEGER NOT NULL DEFAULT 1,
    requires_proof BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (fair_event_id, task_order)
);

CREATE TABLE IF NOT EXISTS public.rizik_fair_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fair_event_id UUID NOT NULL REFERENCES public.rizik_fair_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    full_name TEXT,
    institution_name TEXT,
    institution_type TEXT,
    department_id UUID REFERENCES public.rizik_fair_departments(id) ON DELETE SET NULL,
    subject_area TEXT,
    phone_number TEXT,
    wants_squad_job BOOLEAN NOT NULL DEFAULT FALSE,
    candidate_note TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (fair_event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.rizik_fair_task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.rizik_fair_registrations(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.rizik_fair_tasks(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'TODO',
    proof_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (registration_id, task_id)
);

CREATE TABLE IF NOT EXISTS public.rizik_fair_department_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fair_event_id UUID NOT NULL REFERENCES public.rizik_fair_events(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.rizik_fair_departments(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (fair_event_id, department_id)
);

CREATE TABLE IF NOT EXISTS public.rizik_workforce_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES public.rizik_fair_registrations(id) ON DELETE CASCADE,
    preferred_department TEXT,
    availability_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    status TEXT NOT NULL DEFAULT 'SCREENING',
    reviewer_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2) Squad Workforce Extension
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rizik_squad_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fair_event_id UUID REFERENCES public.rizik_fair_events(id) ON DELETE SET NULL,
    squad_name TEXT NOT NULL,
    department_name TEXT,
    squad_leader_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    permanent_manager_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    squad_type TEXT NOT NULL DEFAULT 'TEMP_EXTENSION',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_squad_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES public.rizik_squad_units(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    fair_registration_id UUID REFERENCES public.rizik_fair_registrations(id) ON DELETE SET NULL,
    member_type TEXT NOT NULL DEFAULT 'TEMPORARY',
    role_title TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (squad_id, user_id),
    UNIQUE (squad_id, fair_registration_id)
);

CREATE TABLE IF NOT EXISTS public.rizik_squad_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID REFERENCES public.rizik_squad_units(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    department_name TEXT,
    task_details TEXT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    location_text TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_squad_job_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.rizik_squad_jobs(id) ON DELETE CASCADE,
    squad_membership_id UUID NOT NULL REFERENCES public.rizik_squad_memberships(id) ON DELETE CASCADE,
    assignment_status TEXT NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, squad_membership_id)
);

-- ==========================================
-- 3) Delivery Live Position Surface
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rizik_delivery_live_positions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dispatch_ref TEXT,
    tracker_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    accuracy_m NUMERIC(8, 2),
    speed_kmh NUMERIC(8, 2),
    heading_deg NUMERIC(8, 2),
    location_note TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4) Social Community Layer
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rizik_social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    post_text TEXT NOT NULL,
    image_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'PUBLIC',
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rizik_social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.rizik_social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5) Views + Indexes
-- ==========================================
CREATE OR REPLACE VIEW public.rizik_fair_live_scoreboard AS
SELECT
    d.id AS department_id,
    d.fair_event_id,
    d.department_code,
    d.department_name,
    d.institution_name,
    COALESCE(s.points, 0) + COALESCE(d.score, 0) AS total_points
FROM public.rizik_fair_departments d
LEFT JOIN public.rizik_fair_department_scores s
    ON s.department_id = d.id AND s.fair_event_id = d.fair_event_id;

CREATE OR REPLACE VIEW public.rizik_social_public_feed AS
SELECT
    p.id,
    p.post_text,
    p.image_url,
    p.visibility,
    p.likes_count,
    p.created_at,
    COALESCE(
      CASE
        WHEN u.full_name IS NULL OR length(u.full_name) = 0 THEN 'Rizik Member'
        ELSE left(u.full_name, 1) || repeat('*', GREATEST(length(u.full_name) - 1, 0))
      END,
      'Rizik Member'
    ) AS masked_author_name
FROM public.rizik_social_posts p
LEFT JOIN public.user_profiles u ON u.id = p.user_id
WHERE p.visibility = 'PUBLIC'
ORDER BY p.created_at DESC;

CREATE INDEX IF NOT EXISTS idx_rizik_fair_registrations_user_event
    ON public.rizik_fair_registrations (user_id, fair_event_id);

CREATE INDEX IF NOT EXISTS idx_rizik_fair_task_submissions_registration
    ON public.rizik_fair_task_submissions (registration_id, status);

CREATE INDEX IF NOT EXISTS idx_rizik_social_posts_created_at
    ON public.rizik_social_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rizik_social_comments_post
    ON public.rizik_social_comments (post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rizik_delivery_positions_recorded
    ON public.rizik_delivery_live_positions (recorded_at DESC);

-- ==========================================
-- 6) Seed Baseline Fair Configuration
-- ==========================================
INSERT INTO public.rizik_fair_events (
    slug,
    name,
    tagline,
    description,
    event_starts_at,
    event_ends_at,
    registration_deadline,
    is_active,
    metadata
)
VALUES (
    'rizik-fair-launch',
    'Rizik Fair 2026',
    'Department War + Squad Workforce Launch',
    'Scan, join, complete onboarding tasks, and compete in department leaderboard challenges.',
    '2026-03-28T10:00:00+06',
    '2026-03-28T20:00:00+06',
    '2026-03-27T23:59:59+06',
    TRUE,
    '{"sponsorPrize":"Rizik Gift Hamper + Next Sponsor Slot","scanEntry":"qr_label"}'::JSONB
)
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    event_starts_at = EXCLUDED.event_starts_at,
    event_ends_at = EXCLUDED.event_ends_at,
    registration_deadline = EXCLUDED.registration_deadline,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

WITH fair AS (
    SELECT id FROM public.rizik_fair_events WHERE slug = 'rizik-fair-launch' LIMIT 1
)
INSERT INTO public.rizik_fair_departments (
    fair_event_id,
    department_code,
    department_name,
    institution_name,
    institution_type
)
SELECT fair.id, dept.department_code, dept.department_name, dept.institution_name, dept.institution_type
FROM fair,
LATERAL (
    VALUES
      ('CSE', 'Computer Science & Engineering', 'Rizik Partner University', 'UNIVERSITY'),
      ('EEE', 'Electrical & Electronic Engineering', 'Rizik Partner University', 'UNIVERSITY'),
      ('BBA', 'Business Administration', 'Rizik Partner University', 'UNIVERSITY'),
      ('ENGLISH', 'English', 'Rizik Partner University', 'UNIVERSITY'),
      ('CIVIL', 'Civil Engineering', 'Rizik Partner University', 'UNIVERSITY'),
      ('ISLAMIC', 'Islamic Studies', 'Rizik Partner Madrasa Network', 'MADRASA')
) AS dept(department_code, department_name, institution_name, institution_type)
ON CONFLICT (fair_event_id, department_code) DO UPDATE
SET
    department_name = EXCLUDED.department_name,
    institution_name = EXCLUDED.institution_name,
    institution_type = EXCLUDED.institution_type;

WITH fair AS (
    SELECT id FROM public.rizik_fair_events WHERE slug = 'rizik-fair-launch' LIMIT 1
)
INSERT INTO public.rizik_fair_tasks (
    fair_event_id,
    title,
    description,
    points,
    task_order,
    requires_proof
)
SELECT fair.id, task.title, task.description, task.points, task.task_order, task.requires_proof
FROM fair,
LATERAL (
    VALUES
      ('Create Fair Profile', 'Complete profile and choose institution + department.', 20, 1, FALSE),
      ('Join Opening Brief', 'Attend the fair orientation briefing.', 25, 2, FALSE),
      ('Share Rizik Fair', 'Share fair launch message with your network.', 30, 3, TRUE),
      ('Invite 3 Participants', 'Bring three eligible participants from your community.', 35, 4, TRUE),
      ('Complete Squad Orientation', 'Finish part-time workforce orientation.', 40, 5, FALSE)
) AS task(title, description, points, task_order, requires_proof)
ON CONFLICT (fair_event_id, task_order) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    points = EXCLUDED.points,
    requires_proof = EXCLUDED.requires_proof;
