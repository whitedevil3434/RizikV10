import Link from "next/link";
import OpsShell from "@/components/workspace/ops-shell";
import { getFairAdminData } from "@/lib/fair/data";
import { adminNavItems } from "@/lib/workspace/nav";
import { reviewFairSubmissionAction } from "@/lib/actions/fair";

const errorMessages: Record<string, string> = {
  missing_submission: "Missing submission reference.",
  submission_not_found: "Submission not found.",
  registration_not_found: "Participant registration not found.",
};

export default async function AdminFairPage({
  searchParams,
}: {
  searchParams?: Promise<{ reviewed?: string; error?: string }>;
}) {
  const params = (await searchParams) || {};
  const data = await getFairAdminData();

  return (
    <OpsShell
      title="Fair Operations"
      subtitle="Manage launch participation, department leaderboard momentum, and task verification flow."
      activeHref="/admin/fair"
      scopeLabel="Admin ERP"
      roleLabel="Campaign Control"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/fair", label: "Fair Ops", tone: "neutral" },
        { href: "/admin/squads", label: "Squad Ops", tone: "neutral" },
        { href: "/fair", label: "Public Fair Page", tone: "primary" },
      ]}
    >
      {params.reviewed ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Submission review updated successfully.
        </div>
      ) : null}
      {params.error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessages[params.error] || "Failed to process submission review."}
        </div>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Registrations</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{data.summary.total_registrations}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Active Participants</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{data.summary.active_registrations}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Pending Submissions</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{data.summary.pending_submissions}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Squad Applicants</p>
          <p className="mt-2 text-3xl font-bold text-[#00B16A]">{data.summary.squad_applications}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-7">
        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#031E49]">Department Scoreboard</h2>
            <p className="text-xs font-semibold text-[#00B16A] uppercase tracking-[0.12em]">Live Rank</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.departments.slice(0, 8).map((department, index) => (
              <div key={department.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#031E49]">#{index + 1} {department.department_name}</p>
                  <p className="text-xs text-[#0A2D6C]/60">{department.institution_name || "Rizik network"}</p>
                </div>
                <p className="text-sm font-bold text-[#00B16A]">{department.total_points} pts</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49]">Task Review Load</h2>
          <div className="mt-4 space-y-3">
            {data.taskMetrics.map((task) => (
              <div key={task.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3">
                <p className="text-sm font-bold text-[#031E49]">{task.task_order}. {task.title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-[#0A2D6C]/65">
                  <span>Submitted: {task.submitted_count}</span>
                  <span>Approved: {task.approved_count}</span>
                  <span className="font-bold text-[#00B16A]">+{task.points}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49]">Recent Registrations</h2>
          <div className="mt-4 space-y-2">
            {data.recentRegistrations.length === 0 ? (
              <p className="text-sm text-[#0A2D6C]/60">No registrations available yet.</p>
            ) : (
              data.recentRegistrations.map((registration) => (
                <div key={registration.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3">
                  <p className="text-sm font-bold text-[#031E49]">{registration.full_name || "Rizik Participant"}</p>
                  <p className="mt-1 text-xs text-[#0A2D6C]/65">
                    {registration.institution_name || "Institution pending"} · {registration.subject_area || "Subject pending"}
                  </p>
                  <p className="mt-1 text-[11px] text-[#0A2D6C]/55">
                    {registration.status} · {registration.wants_squad_job ? "Squad candidate" : "Fair participant only"}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-gradient-to-br from-[#031E49] to-[#0A2D6C] p-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 font-semibold">Campaign Links</p>
          <h3 className="mt-3 text-2xl font-bold">Public + Internal Surfaces</h3>
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            Keep fair discovery public while verification, approval, and squad assignment remain in the control plane.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/fair" className="px-4 py-2 rounded-full bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
              Open Fair Page
            </Link>
            <Link href="/community" className="px-4 py-2 rounded-full border border-white/25 text-white text-sm font-bold hover:bg-white/10">
              Open Community
            </Link>
            <Link href="/admin/squads" className="px-4 py-2 rounded-full border border-white/25 text-white text-sm font-bold hover:bg-white/10">
              Open Squad Ops
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#031E49]">Submission Review Queue</h2>
        <div className="mt-4 space-y-4">
          {data.submissions.length === 0 ? (
            <p className="text-sm text-[#0A2D6C]/60">No submitted tasks to review yet.</p>
          ) : (
            data.submissions.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#031E49]">{submission.task_title}</p>
                    <p className="mt-1 text-xs text-[#0A2D6C]/65">
                      {submission.participant_name} · {submission.department_name} · +{submission.task_points} points
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    submission.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : submission.status === "SUBMITTED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {submission.status}
                  </span>
                </div>

                {submission.proof_url ? (
                  <a
                    href={submission.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-bold text-[#00B16A] hover:text-emerald-700"
                  >
                    Open proof link
                  </a>
                ) : null}

                {submission.notes ? (
                  <p className="mt-2 text-xs text-[#0A2D6C]/65">Submission note: {submission.notes}</p>
                ) : null}

                <form action={reviewFairSubmissionAction} className="mt-3 flex flex-col md:flex-row gap-2 md:items-center">
                  <input type="hidden" name="submission_id" value={submission.id} />
                  <input
                    name="approval_notes"
                    placeholder="Review note (optional)"
                    className="flex-1 rounded-lg border border-[#031E49]/15 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
                  />
                  <button
                    type="submit"
                    name="decision"
                    value="APPROVED"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="REJECTED"
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Reject
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </OpsShell>
  );
}
