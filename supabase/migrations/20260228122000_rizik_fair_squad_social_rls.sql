-- RLS hardening for Rizik Fair + Squad + Community surfaces

ALTER TABLE IF EXISTS public.rizik_fair_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_fair_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_fair_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_fair_department_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_fair_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_fair_task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_workforce_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_squad_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_squad_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_squad_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_squad_job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_delivery_live_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rizik_social_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fair_events_public_read ON public.rizik_fair_events;
CREATE POLICY fair_events_public_read
ON public.rizik_fair_events
FOR SELECT
USING (true);

DROP POLICY IF EXISTS fair_departments_public_read ON public.rizik_fair_departments;
CREATE POLICY fair_departments_public_read
ON public.rizik_fair_departments
FOR SELECT
USING (true);

DROP POLICY IF EXISTS fair_tasks_public_read ON public.rizik_fair_tasks;
CREATE POLICY fair_tasks_public_read
ON public.rizik_fair_tasks
FOR SELECT
USING (true);

DROP POLICY IF EXISTS fair_scores_public_read ON public.rizik_fair_department_scores;
CREATE POLICY fair_scores_public_read
ON public.rizik_fair_department_scores
FOR SELECT
USING (true);

DROP POLICY IF EXISTS fair_registration_owner_read ON public.rizik_fair_registrations;
CREATE POLICY fair_registration_owner_read
ON public.rizik_fair_registrations
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS fair_registration_owner_insert ON public.rizik_fair_registrations;
CREATE POLICY fair_registration_owner_insert
ON public.rizik_fair_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS fair_registration_owner_update ON public.rizik_fair_registrations;
CREATE POLICY fair_registration_owner_update
ON public.rizik_fair_registrations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS fair_submission_owner_read ON public.rizik_fair_task_submissions;
CREATE POLICY fair_submission_owner_read
ON public.rizik_fair_task_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS fair_submission_owner_write ON public.rizik_fair_task_submissions;
CREATE POLICY fair_submission_owner_write
ON public.rizik_fair_task_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS workforce_application_owner_read ON public.rizik_workforce_applications;
CREATE POLICY workforce_application_owner_read
ON public.rizik_workforce_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS workforce_application_owner_write ON public.rizik_workforce_applications;
CREATE POLICY workforce_application_owner_write
ON public.rizik_workforce_applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS workforce_application_owner_update ON public.rizik_workforce_applications;
CREATE POLICY workforce_application_owner_update
ON public.rizik_workforce_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rizik_fair_registrations r
    WHERE r.id = registration_id
      AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS squad_units_authenticated_read ON public.rizik_squad_units;
CREATE POLICY squad_units_authenticated_read
ON public.rizik_squad_units
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS squad_memberships_authenticated_read ON public.rizik_squad_memberships;
CREATE POLICY squad_memberships_authenticated_read
ON public.rizik_squad_memberships
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS squad_jobs_authenticated_read ON public.rizik_squad_jobs;
CREATE POLICY squad_jobs_authenticated_read
ON public.rizik_squad_jobs
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS squad_assignments_authenticated_read ON public.rizik_squad_job_assignments;
CREATE POLICY squad_assignments_authenticated_read
ON public.rizik_squad_job_assignments
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS delivery_positions_authenticated_read ON public.rizik_delivery_live_positions;
CREATE POLICY delivery_positions_authenticated_read
ON public.rizik_delivery_live_positions
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS social_posts_public_read ON public.rizik_social_posts;
CREATE POLICY social_posts_public_read
ON public.rizik_social_posts
FOR SELECT
USING (visibility = 'PUBLIC');

DROP POLICY IF EXISTS social_posts_owner_insert ON public.rizik_social_posts;
CREATE POLICY social_posts_owner_insert
ON public.rizik_social_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS social_posts_owner_update ON public.rizik_social_posts;
CREATE POLICY social_posts_owner_update
ON public.rizik_social_posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS social_comments_public_read ON public.rizik_social_comments;
CREATE POLICY social_comments_public_read
ON public.rizik_social_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.rizik_social_posts p
    WHERE p.id = post_id
      AND p.visibility = 'PUBLIC'
  )
);

DROP POLICY IF EXISTS social_comments_owner_insert ON public.rizik_social_comments;
CREATE POLICY social_comments_owner_insert
ON public.rizik_social_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS social_comments_owner_update ON public.rizik_social_comments;
CREATE POLICY social_comments_owner_update
ON public.rizik_social_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
