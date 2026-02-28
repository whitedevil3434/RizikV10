import { createAdminClient } from "@/lib/supabase/client";

export const DEFAULT_FAIR_SLUG = "rizik-fair-launch";

export interface FairEvent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  event_starts_at: string;
  event_ends_at: string;
  registration_deadline: string;
}

export interface FairDepartment {
  id: string;
  department_code: string;
  department_name: string;
  institution_name: string | null;
  total_points: number;
}

export interface FairTask {
  id: string;
  title: string;
  description: string | null;
  points: number;
  task_order: number;
  requires_proof: boolean;
}

export interface FairRegistrationSummary {
  id: string;
  full_name: string | null;
  institution_name: string | null;
  institution_type: string | null;
  subject_area: string | null;
  status: string;
  department_id: string | null;
  wants_squad_job: boolean;
}

export interface FairTaskProgress {
  id: string;
  task_id: string;
  status: string;
  proof_url: string | null;
  notes: string | null;
  submitted_at: string | null;
  task: FairTask;
}

const fallbackEvent: FairEvent = {
  id: "fallback-fair",
  slug: DEFAULT_FAIR_SLUG,
  name: "Rizik Fair 2026",
  tagline: "Department War + Squad Workforce Launch",
  description:
    "Scan the label QR, create your fair account, complete launch tasks, and compete for department prizes and sponsor slots.",
  event_starts_at: "2026-03-28T10:00:00+06:00",
  event_ends_at: "2026-03-28T20:00:00+06:00",
  registration_deadline: "2026-03-27T23:59:59+06:00",
};

const fallbackDepartments: FairDepartment[] = [
  { id: "dept-cse", department_code: "CSE", department_name: "Computer Science & Engineering", institution_name: "Rizik Partner University", total_points: 1180 },
  { id: "dept-eee", department_code: "EEE", department_name: "Electrical & Electronic Engineering", institution_name: "Rizik Partner University", total_points: 1055 },
  { id: "dept-bba", department_code: "BBA", department_name: "Business Administration", institution_name: "Rizik Partner University", total_points: 990 },
  { id: "dept-islamic", department_code: "ISLAMIC", department_name: "Islamic Studies", institution_name: "Rizik Partner Madrasa Network", total_points: 940 },
];

const fallbackTasks: FairTask[] = [
  { id: "task-1", title: "Create Fair Profile", description: "Complete profile and choose institution + department.", points: 20, task_order: 1, requires_proof: false },
  { id: "task-2", title: "Join Opening Brief", description: "Attend the fair orientation briefing.", points: 25, task_order: 2, requires_proof: false },
  { id: "task-3", title: "Share Rizik Fair", description: "Share fair launch message with your network.", points: 30, task_order: 3, requires_proof: true },
  { id: "task-4", title: "Invite 3 Participants", description: "Bring three eligible participants from your community.", points: 35, task_order: 4, requires_proof: true },
  { id: "task-5", title: "Complete Squad Orientation", description: "Finish part-time workforce orientation.", points: 40, task_order: 5, requires_proof: false },
];

function sortDepartmentsByScore(items: FairDepartment[]): FairDepartment[] {
  return [...items].sort((a, b) => b.total_points - a.total_points);
}

export async function getFairLandingData(slug = DEFAULT_FAIR_SLUG): Promise<{
  event: FairEvent;
  departments: FairDepartment[];
  tasks: FairTask[];
}> {
  try {
    const admin = createAdminClient();

    const { data: eventData, error: eventError } = await admin
      .from("rizik_fair_events")
      .select("id, slug, name, tagline, description, event_starts_at, event_ends_at, registration_deadline")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (eventError || !eventData) {
      return {
        event: fallbackEvent,
        departments: sortDepartmentsByScore(fallbackDepartments),
        tasks: fallbackTasks,
      };
    }

    const event = eventData as FairEvent;

    const [{ data: deptRows }, { data: scoreRows }, { data: taskRows }] = await Promise.all([
      admin
        .from("rizik_fair_departments")
        .select("id, department_code, department_name, institution_name")
        .eq("fair_event_id", event.id),
      admin
        .from("rizik_fair_department_scores")
        .select("department_id, points")
        .eq("fair_event_id", event.id),
      admin
        .from("rizik_fair_tasks")
        .select("id, title, description, points, task_order, requires_proof")
        .eq("fair_event_id", event.id)
        .order("task_order", { ascending: true }),
    ]);

    const scoreMap = new Map<string, number>();
    for (const row of scoreRows || []) {
      const departmentId = String((row as { department_id: string }).department_id);
      const points = Number((row as { points: number | null }).points || 0);
      scoreMap.set(departmentId, points);
    }

    const departments: FairDepartment[] = (deptRows || []).map((row) => {
      const typed = row as { id: string; department_code: string; department_name: string; institution_name: string | null };
      return {
        id: typed.id,
        department_code: typed.department_code,
        department_name: typed.department_name,
        institution_name: typed.institution_name,
        total_points: scoreMap.get(typed.id) || 0,
      };
    });

    const tasks: FairTask[] = (taskRows || []).map((row) => {
      const typed = row as FairTask;
      return typed;
    });

    return {
      event,
      departments: sortDepartmentsByScore(departments.length > 0 ? departments : fallbackDepartments),
      tasks: tasks.length > 0 ? tasks : fallbackTasks,
    };
  } catch {
    return {
      event: fallbackEvent,
      departments: sortDepartmentsByScore(fallbackDepartments),
      tasks: fallbackTasks,
    };
  }
}

export async function getFairUserDashboard(userId: string, slug = DEFAULT_FAIR_SLUG): Promise<{
  event: FairEvent;
  departments: FairDepartment[];
  registration: FairRegistrationSummary | null;
  taskProgress: FairTaskProgress[];
}> {
  const landing = await getFairLandingData(slug);

  try {
    const admin = createAdminClient();

    const { data: registration } = await admin
      .from("rizik_fair_registrations")
      .select("id, full_name, institution_name, institution_type, subject_area, status, department_id, wants_squad_job")
      .eq("fair_event_id", landing.event.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!registration) {
      return {
        event: landing.event,
        departments: landing.departments,
        registration: null,
        taskProgress: [],
      };
    }

    const reg = registration as FairRegistrationSummary;

    const [{ data: tasks }, { data: submissions }] = await Promise.all([
      admin
        .from("rizik_fair_tasks")
        .select("id, title, description, points, task_order, requires_proof")
        .eq("fair_event_id", landing.event.id)
        .order("task_order", { ascending: true }),
      admin
        .from("rizik_fair_task_submissions")
        .select("id, task_id, status, proof_url, notes, submitted_at")
        .eq("registration_id", reg.id),
    ]);

    const taskMap = new Map<string, FairTask>();
    for (const task of tasks || []) {
      const typed = task as FairTask;
      taskMap.set(typed.id, typed);
    }

    const submissionMap = new Map<string, FairTaskProgress>();
    for (const row of submissions || []) {
      const typed = row as {
        id: string;
        task_id: string;
        status: string;
        proof_url: string | null;
        notes: string | null;
        submitted_at: string | null;
      };
      const task = taskMap.get(typed.task_id);
      if (!task) continue;
      submissionMap.set(typed.task_id, {
        id: typed.id,
        task_id: typed.task_id,
        status: typed.status,
        proof_url: typed.proof_url,
        notes: typed.notes,
        submitted_at: typed.submitted_at,
        task,
      });
    }

    const taskProgress: FairTaskProgress[] = (tasks || []).map((taskRow) => {
      const task = taskRow as FairTask;
      const existing = submissionMap.get(task.id);
      if (existing) return existing;
      return {
        id: `virtual-${task.id}`,
        task_id: task.id,
        status: "TODO",
        proof_url: null,
        notes: null,
        submitted_at: null,
        task,
      };
    });

    return {
      event: landing.event,
      departments: landing.departments,
      registration: reg,
      taskProgress,
    };
  } catch {
    return {
      event: landing.event,
      departments: landing.departments,
      registration: null,
      taskProgress: [],
    };
  }
}

export interface DeliveryLivePosition {
  id: number;
  dispatch_ref: string | null;
  latitude: number | null;
  longitude: number | null;
  speed_kmh: number | null;
  location_note: string | null;
  recorded_at: string;
}

export interface FairAdminSummary {
  total_registrations: number;
  active_registrations: number;
  pending_submissions: number;
  squad_applications: number;
}

export interface FairTaskAdminMetric extends FairTask {
  submitted_count: number;
  approved_count: number;
}

export interface FairRecentRegistration {
  id: string;
  full_name: string | null;
  institution_name: string | null;
  subject_area: string | null;
  status: string;
  wants_squad_job: boolean;
  created_at: string;
}

export interface FairSubmissionReviewItem {
  id: string;
  status: string;
  submitted_at: string | null;
  proof_url: string | null;
  notes: string | null;
  approval_notes: string | null;
  task_title: string;
  task_points: number;
  participant_name: string;
  department_name: string;
}

export interface WorkforceApplication {
  id: string;
  status: string;
  preferred_department: string | null;
  created_at: string;
  registration_name: string | null;
  institution_name: string | null;
  subject_area: string | null;
}

export interface SquadOverview {
  id: string;
  squad_name: string;
  department_name: string | null;
  squad_type: string;
  is_active: boolean;
  member_count: number;
  open_jobs: number;
}

export interface SquadJobOverview {
  id: string;
  title: string;
  department_name: string | null;
  status: string;
  location_text: string | null;
  starts_at: string | null;
  ends_at: string | null;
  squad_name: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

const fallbackLivePositions: DeliveryLivePosition[] = [
  {
    id: 1,
    dispatch_ref: "SHP-7402",
    latitude: 23.7815,
    longitude: 90.4002,
    speed_kmh: 28,
    location_note: "Dhaka corridor",
    recorded_at: "2026-02-28T13:20:00+06:00",
  },
  {
    id: 2,
    dispatch_ref: "SHP-7401",
    latitude: 23.7637,
    longitude: 90.3892,
    speed_kmh: 35,
    location_note: "On route to Chattogram",
    recorded_at: "2026-02-28T13:17:00+06:00",
  },
];

const fallbackSquads: SquadOverview[] = [
  {
    id: "squad-cse-a",
    squad_name: "CSE Strike Team A",
    department_name: "Computer Science & Engineering",
    squad_type: "TEMP_EXTENSION",
    is_active: true,
    member_count: 12,
    open_jobs: 3,
  },
  {
    id: "squad-islamic-b",
    squad_name: "Islamic Studies Outreach",
    department_name: "Islamic Studies",
    squad_type: "TEMP_EXTENSION",
    is_active: true,
    member_count: 9,
    open_jobs: 2,
  },
];

const fallbackApplications: WorkforceApplication[] = [
  {
    id: "app-1",
    status: "SCREENING",
    preferred_department: "CSE",
    created_at: "2026-02-28T11:00:00+06:00",
    registration_name: "Rizik Fair Applicant",
    institution_name: "Rizik Partner University",
    subject_area: "Software Engineering",
  },
];

export async function getLatestDeliveryPositions(limit = 8): Promise<DeliveryLivePosition[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_delivery_live_positions")
      .select("id, dispatch_ref, latitude, longitude, speed_kmh, location_note, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return fallbackLivePositions.slice(0, limit);
    }

    return data.map((row) => {
      const typed = row as {
        id: number;
        dispatch_ref: string | null;
        latitude: number | string | null;
        longitude: number | string | null;
        speed_kmh: number | string | null;
        location_note: string | null;
        recorded_at: string;
      };
      return {
        id: typed.id,
        dispatch_ref: typed.dispatch_ref,
        latitude: typed.latitude == null ? null : toNumber(typed.latitude),
        longitude: typed.longitude == null ? null : toNumber(typed.longitude),
        speed_kmh: typed.speed_kmh == null ? null : toNumber(typed.speed_kmh),
        location_note: typed.location_note,
        recorded_at: typed.recorded_at,
      };
    });
  } catch {
    return fallbackLivePositions.slice(0, limit);
  }
}

export async function getFairAdminData(slug = DEFAULT_FAIR_SLUG): Promise<{
  event: FairEvent;
  departments: FairDepartment[];
  summary: FairAdminSummary;
  taskMetrics: FairTaskAdminMetric[];
  recentRegistrations: FairRecentRegistration[];
  submissions: FairSubmissionReviewItem[];
}> {
  const landing = await getFairLandingData(slug);

  const fallbackSummary: FairAdminSummary = {
    total_registrations: 0,
    active_registrations: 0,
    pending_submissions: 0,
    squad_applications: 0,
  };

  const fallbackMetrics: FairTaskAdminMetric[] = landing.tasks.map((task) => ({
    ...task,
    submitted_count: 0,
    approved_count: 0,
  }));

  if (landing.event.id === fallbackEvent.id) {
    return {
      event: landing.event,
      departments: landing.departments,
      summary: fallbackSummary,
      taskMetrics: fallbackMetrics,
      recentRegistrations: [],
      submissions: [],
    };
  }

  try {
    const admin = createAdminClient();
    const eventId = landing.event.id;

    const [
      totalCountResponse,
      activeCountResponse,
      registrationIdsResponse,
      recentRegistrationsResponse,
      tasksResponse,
    ] = await Promise.all([
      admin.from("rizik_fair_registrations").select("id", { head: true, count: "exact" }).eq("fair_event_id", eventId),
      admin
        .from("rizik_fair_registrations")
        .select("id", { head: true, count: "exact" })
        .eq("fair_event_id", eventId)
        .eq("status", "ACTIVE"),
      admin.from("rizik_fair_registrations").select("id").eq("fair_event_id", eventId),
      admin
        .from("rizik_fair_registrations")
        .select("id, full_name, institution_name, subject_area, status, wants_squad_job, created_at")
        .eq("fair_event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("rizik_fair_tasks")
        .select("id, title, description, points, task_order, requires_proof")
        .eq("fair_event_id", eventId)
        .order("task_order", { ascending: true }),
    ]);

    const registrationIds = (registrationIdsResponse.data || []).map((row) => (row as { id: string }).id);
    const taskRows = (tasksResponse.data || []) as FairTask[];
    const registrationRows = (recentRegistrationsResponse.data || []) as {
      id: string;
      full_name: string | null;
      institution_name: string | null;
      subject_area: string | null;
      status: string;
      wants_squad_job: boolean;
      created_at: string;
    }[];

    let submissionRows: {
      id: string;
      registration_id: string;
      task_id: string;
      status: string;
      submitted_at: string | null;
      proof_url: string | null;
      notes: string | null;
      approval_notes: string | null;
      updated_at: string;
    }[] = [];
    let squadApplications = 0;
    let submissionReviewRows: {
      id: string;
      registration_id: string;
      task_id: string;
      status: string;
      submitted_at: string | null;
      proof_url: string | null;
      notes: string | null;
      approval_notes: string | null;
      updated_at: string;
    }[] = [];
    let registrationDetails: {
      id: string;
      full_name: string | null;
      department_id: string | null;
    }[] = [];

    if (registrationIds.length > 0) {
      const [{ data: submissions }, { data: applications }, { data: allRegistrations }] = await Promise.all([
        admin
        .from("rizik_fair_task_submissions")
        .select("id, registration_id, task_id, status, submitted_at, proof_url, notes, approval_notes, updated_at")
        .in("registration_id", registrationIds),
        admin
          .from("rizik_workforce_applications")
          .select("id")
          .in("registration_id", registrationIds),
        admin
          .from("rizik_fair_registrations")
          .select("id, full_name, department_id")
          .in("id", registrationIds),
      ]);
      submissionRows = (submissions || []) as {
        id: string;
        registration_id: string;
        task_id: string;
        status: string;
        submitted_at: string | null;
        proof_url: string | null;
        notes: string | null;
        approval_notes: string | null;
        updated_at: string;
      }[];
      submissionReviewRows = [...submissionRows]
        .filter((row) => row.status !== "TODO")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 30);

      registrationDetails = (allRegistrations || []) as {
        id: string;
        full_name: string | null;
        department_id: string | null;
      }[];
      squadApplications = (applications || []).length;
    }

    const submissionCountByTask = new Map<string, { submitted: number; approved: number }>();
    for (const row of submissionRows) {
      const current = submissionCountByTask.get(row.task_id) || { submitted: 0, approved: 0 };
      if (row.status === "SUBMITTED") current.submitted += 1;
      if (row.status === "APPROVED") current.approved += 1;
      submissionCountByTask.set(row.task_id, current);
    }

    const pendingSubmissions = submissionRows.filter((row) => row.status === "SUBMITTED").length;

    const metrics: FairTaskAdminMetric[] = taskRows.map((task) => {
      const counts = submissionCountByTask.get(task.id) || { submitted: 0, approved: 0 };
      return {
        ...task,
        submitted_count: counts.submitted,
        approved_count: counts.approved,
      };
    });

    const recentRegistrations: FairRecentRegistration[] = registrationRows.map((row) => ({
      id: row.id,
      full_name: row.full_name,
      institution_name: row.institution_name,
      subject_area: row.subject_area,
      status: row.status,
      wants_squad_job: row.wants_squad_job,
      created_at: row.created_at,
    }));

    const taskMap = new Map(taskRows.map((task) => [task.id, task]));
    const registrationMap = new Map(registrationDetails.map((row) => [row.id, row]));
    const departmentNameById = new Map(landing.departments.map((department) => [department.id, department.department_name]));

    const submissions: FairSubmissionReviewItem[] = submissionReviewRows.map((row) => {
      const task = taskMap.get(row.task_id);
      const registration = registrationMap.get(row.registration_id);
      const departmentName = registration?.department_id
        ? departmentNameById.get(registration.department_id) || "Department pending"
        : "Department pending";

      return {
        id: row.id,
        status: row.status,
        submitted_at: row.submitted_at,
        proof_url: row.proof_url,
        notes: row.notes,
        approval_notes: row.approval_notes,
        task_title: task?.title || "Fair Task",
        task_points: task?.points || 0,
        participant_name: registration?.full_name || "Rizik Participant",
        department_name: departmentName,
      };
    });

    return {
      event: landing.event,
      departments: landing.departments,
      summary: {
        total_registrations: totalCountResponse.count || 0,
        active_registrations: activeCountResponse.count || 0,
        pending_submissions: pendingSubmissions,
        squad_applications: squadApplications,
      },
      taskMetrics: metrics.length > 0 ? metrics : fallbackMetrics,
      recentRegistrations,
      submissions,
    };
  } catch {
    return {
      event: landing.event,
      departments: landing.departments,
      summary: fallbackSummary,
      taskMetrics: fallbackMetrics,
      recentRegistrations: [],
      submissions: [],
    };
  }
}

export async function getSquadOperationsData(slug = DEFAULT_FAIR_SLUG): Promise<{
  event: FairEvent;
  applications: WorkforceApplication[];
  squads: SquadOverview[];
  jobs: SquadJobOverview[];
  livePositions: DeliveryLivePosition[];
}> {
  const landing = await getFairLandingData(slug);
  const fallbackJobs: SquadJobOverview[] = [
    {
      id: "job-1",
      title: "Campus Outreach Route",
      department_name: "CSE",
      status: "OPEN",
      location_text: "Dhaka North",
      starts_at: "2026-03-02T10:00:00+06:00",
      ends_at: "2026-03-02T14:00:00+06:00",
      squad_name: "CSE Strike Team A",
    },
  ];

  if (landing.event.id === fallbackEvent.id) {
    return {
      event: landing.event,
      applications: fallbackApplications,
      squads: fallbackSquads,
      jobs: fallbackJobs,
      livePositions: fallbackLivePositions,
    };
  }

  try {
    const admin = createAdminClient();
    const eventId = landing.event.id;
    const { data: registrationRows } = await admin
      .from("rizik_fair_registrations")
      .select("id")
      .eq("fair_event_id", eventId);
    const registrationIds = (registrationRows || []).map((row) => (row as { id: string }).id);

    const appsPromise = registrationIds.length > 0
      ? admin
        .from("rizik_workforce_applications")
        .select("id, status, preferred_department, created_at, registration:registration_id(full_name, institution_name, subject_area)")
        .in("registration_id", registrationIds)
        .order("created_at", { ascending: false })
        .limit(25)
      : Promise.resolve({ data: [] as unknown[] });

    const [appsResponse, squadsResponse, jobsResponse, membershipsResponse, livePositions] = await Promise.all([
      appsPromise,
      admin
        .from("rizik_squad_units")
        .select("id, squad_name, department_name, squad_type, is_active")
        .eq("fair_event_id", eventId)
        .order("created_at", { ascending: false }),
      admin
        .from("rizik_squad_jobs")
        .select("id, title, department_name, status, location_text, starts_at, ends_at, squad_id")
        .order("created_at", { ascending: false })
        .limit(30),
      admin
        .from("rizik_squad_memberships")
        .select("id, squad_id"),
      getLatestDeliveryPositions(8),
    ]);

    const rawSquads = (squadsResponse.data || []) as {
      id: string;
      squad_name: string;
      department_name: string | null;
      squad_type: string;
      is_active: boolean;
    }[];

    const memberships = (membershipsResponse.data || []) as { id: string; squad_id: string }[];
    const rawJobs = (jobsResponse.data || []) as {
      id: string;
      title: string;
      department_name: string | null;
      status: string;
      location_text: string | null;
      starts_at: string | null;
      ends_at: string | null;
      squad_id: string | null;
    }[];
    const squadIdSet = new Set(rawSquads.map((squad) => squad.id));
    const filteredJobs = rawJobs.filter((job) => !job.squad_id || squadIdSet.has(job.squad_id));

    const memberCountBySquad = new Map<string, number>();
    for (const member of memberships) {
      memberCountBySquad.set(member.squad_id, (memberCountBySquad.get(member.squad_id) || 0) + 1);
    }

    const openJobsBySquad = new Map<string, number>();
    for (const job of filteredJobs) {
      if (!job.squad_id || job.status !== "OPEN") continue;
      openJobsBySquad.set(job.squad_id, (openJobsBySquad.get(job.squad_id) || 0) + 1);
    }

    const squadNameMap = new Map<string, string>();
    const squads: SquadOverview[] = rawSquads.map((squad) => {
      squadNameMap.set(squad.id, squad.squad_name);
      return {
        id: squad.id,
        squad_name: squad.squad_name,
        department_name: squad.department_name,
        squad_type: squad.squad_type,
        is_active: squad.is_active,
        member_count: memberCountBySquad.get(squad.id) || 0,
        open_jobs: openJobsBySquad.get(squad.id) || 0,
      };
    });

    const jobs: SquadJobOverview[] = filteredJobs.map((job) => ({
      id: job.id,
      title: job.title,
      department_name: job.department_name,
      status: job.status,
      location_text: job.location_text,
      starts_at: job.starts_at,
      ends_at: job.ends_at,
      squad_name: job.squad_id ? squadNameMap.get(job.squad_id) || null : null,
    }));

    const applications: WorkforceApplication[] = ((appsResponse.data || []) as {
      id: string;
      status: string;
      preferred_department: string | null;
      created_at: string;
      registration: {
        full_name: string | null;
        institution_name: string | null;
        subject_area: string | null;
      } | null;
    }[]).map((app) => ({
      id: app.id,
      status: app.status,
      preferred_department: app.preferred_department,
      created_at: app.created_at,
      registration_name: app.registration?.full_name || null,
      institution_name: app.registration?.institution_name || null,
      subject_area: app.registration?.subject_area || null,
    }));

    return {
      event: landing.event,
      applications: applications.length > 0 ? applications : fallbackApplications,
      squads: squads.length > 0 ? squads : fallbackSquads,
      jobs: jobs.length > 0 ? jobs : fallbackJobs,
      livePositions: livePositions.length > 0 ? livePositions : fallbackLivePositions,
    };
  } catch {
    return {
      event: landing.event,
      applications: fallbackApplications,
      squads: fallbackSquads,
      jobs: fallbackJobs,
      livePositions: fallbackLivePositions,
    };
  }
}
