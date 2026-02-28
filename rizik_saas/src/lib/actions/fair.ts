"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_FAIR_SLUG } from "@/lib/fair/data";
import { canAccessAdminRole } from "@/lib/auth/policy";

async function requireAuthenticatedUser(nextPath: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

async function requireAdminUser(nextPath: string) {
  const user = await requireAuthenticatedUser(nextPath);
  let role: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as string | null) || null;
  } catch {
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as string | null) || null;
  }

  if (!role || !canAccessAdminRole(role)) {
    redirect("/store?error=unauthorized_admin");
  }

  return user;
}

async function resolveFairEventId(admin: ReturnType<typeof createAdminClient>, fairSlug: string): Promise<string | null> {
  const { data } = await admin
    .from("rizik_fair_events")
    .select("id")
    .eq("slug", fairSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (data?.id) return data.id as string;

  const fallback = await admin
    .from("rizik_fair_events")
    .select("id")
    .eq("is_active", true)
    .order("event_starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (fallback.data?.id as string) || null;
}

export async function registerForFairAction(formData: FormData) {
  const fairSlug = String(formData.get("fair_slug") || DEFAULT_FAIR_SLUG);
  const user = await requireAuthenticatedUser("/fair/join");

  const institutionName = String(formData.get("institution_name") || "").trim();
  const institutionType = String(formData.get("institution_type") || "").trim();
  const departmentCode = String(formData.get("department_code") || "").trim().toUpperCase();
  const subjectArea = String(formData.get("subject_area") || "").trim();
  const phoneNumber = String(formData.get("phone_number") || "").trim();
  const candidateNote = String(formData.get("candidate_note") || "").trim();
  const wantsSquadJob = formData.get("wants_squad_job") === "on";

  const admin = createAdminClient();

  const fairEventId = await resolveFairEventId(admin, fairSlug);
  if (!fairEventId) {
    redirect("/fair/join?error=no_active_fair");
  }

  const { data: profile } = await admin
    .from("user_profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  let departmentId: string | null = null;
  if (departmentCode) {
    const { data: dept } = await admin
      .from("rizik_fair_departments")
      .select("id")
      .eq("fair_event_id", fairEventId)
      .eq("department_code", departmentCode)
      .maybeSingle();

    departmentId = (dept?.id as string) || null;
  }

  const { data: registration, error: registrationError } = await admin
    .from("rizik_fair_registrations")
    .upsert(
      {
        fair_event_id: fairEventId,
        user_id: user.id,
        full_name: (profile?.full_name as string | undefined) || user.email || "Rizik Member",
        institution_name: institutionName || null,
        institution_type: institutionType || null,
        department_id: departmentId,
        subject_area: subjectArea || null,
        phone_number: phoneNumber || null,
        wants_squad_job: wantsSquadJob,
        candidate_note: candidateNote || null,
        status: "ACTIVE",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "fair_event_id,user_id" }
    )
    .select("id")
    .single();

  if (registrationError || !registration?.id) {
    redirect("/fair/join?error=registration_failed");
  }

  const registrationId = registration.id as string;

  const { data: tasks } = await admin
    .from("rizik_fair_tasks")
    .select("id")
    .eq("fair_event_id", fairEventId);

  if (tasks && tasks.length > 0) {
    const submissionRows = tasks.map((task) => ({
      registration_id: registrationId,
      task_id: (task as { id: string }).id,
      status: "TODO",
      updated_at: new Date().toISOString(),
    }));

    await admin
      .from("rizik_fair_task_submissions")
      .upsert(submissionRows, { onConflict: "registration_id,task_id" });
  }

  if (wantsSquadJob) {
    await admin.from("rizik_workforce_applications").upsert(
      {
        registration_id: registrationId,
        preferred_department: subjectArea || departmentCode || null,
        availability_json: { mode: "part_time", source: "fair_join_form" },
        status: "SCREENING",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "registration_id" }
    );
  }

  revalidatePath("/fair");
  revalidatePath("/fair/dashboard");
  redirect("/fair/dashboard?joined=1");
}

export async function submitFairTaskAction(formData: FormData) {
  const user = await requireAuthenticatedUser("/fair/dashboard");
  const submissionId = String(formData.get("submission_id") || "").trim();
  const proofUrl = String(formData.get("proof_url") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!submissionId) {
    redirect("/fair/dashboard?error=missing_submission");
  }

  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("rizik_fair_task_submissions")
    .select("id, status, task_id, registration_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    redirect("/fair/dashboard?error=submission_not_found");
  }

  const typedSubmission = submission as {
    id: string;
    status: string;
    task_id: string;
    registration_id: string;
  };

  const { data: registration } = await admin
    .from("rizik_fair_registrations")
    .select("id, user_id, fair_event_id, department_id")
    .eq("id", typedSubmission.registration_id)
    .maybeSingle();

  if (!registration || (registration as { user_id: string }).user_id !== user.id) {
    redirect("/fair/dashboard?error=unauthorized_task_update");
  }

  const typedRegistration = registration as {
    id: string;
    user_id: string;
    fair_event_id: string;
    department_id: string | null;
  };

  await admin
    .from("rizik_fair_task_submissions")
    .update({
      status: "SUBMITTED",
      proof_url: proofUrl || null,
      notes: notes || null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", typedSubmission.id);

  if (typedSubmission.status === "TODO" && typedRegistration.department_id) {
    const { data: task } = await admin
      .from("rizik_fair_tasks")
      .select("points")
      .eq("id", typedSubmission.task_id)
      .maybeSingle();

    const points = Number((task as { points?: number } | null)?.points || 0);
    if (points > 0) {
      const { data: existingScore } = await admin
        .from("rizik_fair_department_scores")
        .select("id, points")
        .eq("fair_event_id", typedRegistration.fair_event_id)
        .eq("department_id", typedRegistration.department_id)
        .maybeSingle();

      const nextPoints = Number((existingScore as { points?: number } | null)?.points || 0) + points;

      await admin
        .from("rizik_fair_department_scores")
        .upsert(
          {
            id: (existingScore as { id?: string } | null)?.id,
            fair_event_id: typedRegistration.fair_event_id,
            department_id: typedRegistration.department_id,
            points: nextPoints,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "fair_event_id,department_id" }
        );
    }
  }

  revalidatePath("/fair");
  revalidatePath("/fair/dashboard");
  redirect("/fair/dashboard?updated=1");
}

export async function reviewFairSubmissionAction(formData: FormData) {
  await requireAdminUser("/admin/fair");

  const submissionId = String(formData.get("submission_id") || "").trim();
  const decisionRaw = String(formData.get("decision") || "").trim().toUpperCase();
  const approvalNotes = String(formData.get("approval_notes") || "").trim();
  const decision = decisionRaw === "APPROVED" ? "APPROVED" : "REJECTED";

  if (!submissionId) {
    redirect("/admin/fair?error=missing_submission");
  }

  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("rizik_fair_task_submissions")
    .select("id, status, task_id, registration_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    redirect("/admin/fair?error=submission_not_found");
  }

  const typedSubmission = submission as {
    id: string;
    status: string;
    task_id: string;
    registration_id: string;
  };

  const { data: registration } = await admin
    .from("rizik_fair_registrations")
    .select("fair_event_id, department_id")
    .eq("id", typedSubmission.registration_id)
    .maybeSingle();

  if (!registration) {
    redirect("/admin/fair?error=registration_not_found");
  }

  const typedRegistration = registration as {
    fair_event_id: string;
    department_id: string | null;
  };

  await admin
    .from("rizik_fair_task_submissions")
    .update({
      status: decision,
      approval_notes: approvalNotes || null,
      approved_at: decision === "APPROVED" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", typedSubmission.id);

  if (typedRegistration.department_id) {
    const { data: task } = await admin
      .from("rizik_fair_tasks")
      .select("points")
      .eq("id", typedSubmission.task_id)
      .maybeSingle();

    const points = Number((task as { points?: number } | null)?.points || 0);
    if (points > 0) {
      let delta = 0;
      if (typedSubmission.status !== "APPROVED" && decision === "APPROVED") {
        delta = points;
      } else if (typedSubmission.status === "APPROVED" && decision !== "APPROVED") {
        delta = -points;
      }

      if (delta !== 0) {
        const { data: existingScore } = await admin
          .from("rizik_fair_department_scores")
          .select("id, points")
          .eq("fair_event_id", typedRegistration.fair_event_id)
          .eq("department_id", typedRegistration.department_id)
          .maybeSingle();

        const previous = Number((existingScore as { points?: number } | null)?.points || 0);
        const nextPoints = Math.max(0, previous + delta);

        await admin
          .from("rizik_fair_department_scores")
          .upsert(
            {
              id: (existingScore as { id?: string } | null)?.id,
              fair_event_id: typedRegistration.fair_event_id,
              department_id: typedRegistration.department_id,
              points: nextPoints,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "fair_event_id,department_id" }
          );
      }
    }
  }

  revalidatePath("/admin/fair");
  revalidatePath("/fair");
  revalidatePath("/fair/dashboard");
  redirect("/admin/fair?reviewed=1");
}
