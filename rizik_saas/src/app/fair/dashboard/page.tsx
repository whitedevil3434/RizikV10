import Link from "next/link";
import { redirect } from "next/navigation";
import FairCountdown from "@/components/fair/fair-countdown";
import { submitFairTaskAction } from "@/lib/actions/fair";
import { getCurrentUserContext } from "@/lib/auth/session";
import { getFairUserDashboard, getLatestDeliveryPositions } from "@/lib/fair/data";

const infoMessages: Record<string, string> = {
  joined: "Registration completed successfully.",
  updated: "Task progress submitted.",
};

const errorMessages: Record<string, string> = {
  missing_submission: "Missing task submission reference.",
  submission_not_found: "Task submission was not found.",
  unauthorized_task_update: "You are not allowed to update this task.",
};

function statusTone(status: string): string {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "SUBMITTED") return "bg-amber-100 text-amber-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-[#031E49]/10 text-[#031E49]";
}

export default async function FairDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ joined?: string; updated?: string; error?: string }>;
}) {
  const params = (await searchParams) || {};

  const { user } = await getCurrentUserContext();
  if (!user) {
    redirect("/login?next=/fair/dashboard");
  }

  const fairData = await getFairUserDashboard(user.id);
  const livePositions = await getLatestDeliveryPositions(8);

  if (!fairData.registration) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] text-[#031E49]">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold">Fair Dashboard</h1>
          <p className="mt-4 text-sm md:text-base text-[#0A2D6C]/70">
            Your account is active, but you have not joined the fair yet. Complete registration to unlock tasks,
            scoreboard tracking, and squad application status.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/fair/join" className="px-6 py-3 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]">
              Complete Registration
            </Link>
            <Link href="/fair" className="px-6 py-3 rounded-full border border-[#031E49]/15 bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
              Back to Fair Home
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const completedTasks = fairData.taskProgress.filter((item) => item.status !== "TODO").length;
  const submittedTasks = fairData.taskProgress.filter((item) => item.status === "SUBMITTED").length;
  const approvedTasks = fairData.taskProgress.filter((item) => item.status === "APPROVED").length;
  const totalPoints = fairData.taskProgress
    .filter((item) => item.status !== "TODO")
    .reduce((sum, item) => sum + item.task.points, 0);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#031E49]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/50 font-semibold">My Fair Status</p>
            <h1 className="mt-3 text-3xl font-bold">{fairData.event.name}</h1>
            <p className="mt-2 text-sm text-[#0A2D6C]/65">{fairData.event.tagline}</p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/55 p-3">
                <p className="text-xs text-[#031E49]/50">Tasks Started</p>
                <p className="mt-1 text-2xl font-bold">{completedTasks}</p>
              </div>
              <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/55 p-3">
                <p className="text-xs text-[#031E49]/50">Pending Review</p>
                <p className="mt-1 text-2xl font-bold">{submittedTasks}</p>
              </div>
              <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/55 p-3">
                <p className="text-xs text-[#031E49]/50">Approved</p>
                <p className="mt-1 text-2xl font-bold">{approvedTasks}</p>
              </div>
              <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/55 p-3">
                <p className="text-xs text-[#031E49]/50">Points</p>
                <p className="mt-1 text-2xl font-bold text-[#00B16A]">{totalPoints}</p>
              </div>
            </div>

            <div className="mt-6">
              <FairCountdown targetIso={fairData.event.event_starts_at} />
            </div>
          </article>

          <article className="rounded-3xl border border-[#031E49]/10 bg-gradient-to-br from-[#031E49] to-[#0A2D6C] p-6 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-white/60 font-semibold">Workforce Eligibility</p>
            <h2 className="mt-3 text-2xl font-bold">Squad Candidate Status</h2>
            <p className="mt-3 text-sm text-white/75">
              {fairData.registration.wants_squad_job
                ? "You are currently marked for squad-workforce screening. A squad leader or permanent supervisor can contact you after review."
                : "You are currently participating in the fair only. Update your registration if you want part-time squad assignments."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/fair/join" className="px-4 py-2 rounded-full bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
                Update Registration
              </Link>
              <Link href="/community" className="px-4 py-2 rounded-full border border-white/25 text-white text-sm font-bold hover:bg-white/10">
                Open Community
              </Link>
            </div>
          </article>
        </div>

        {params.joined || params.updated || params.error ? (
          <div className="mt-5 space-y-2">
            {params.joined ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {infoMessages.joined}
              </div>
            ) : null}
            {params.updated ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {infoMessages.updated}
              </div>
            ) : null}
            {params.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessages[params.error] || "Task update failed."}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Task Progress</h2>
            <div className="mt-4 space-y-4">
              {fairData.taskProgress.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm md:text-base font-bold text-[#031E49]">
                      {item.task.task_order}. {item.task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${statusTone(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-[#00B16A]">+{item.task.points}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[#0A2D6C]/65">{item.task.description || "No details provided."}</p>

                  {item.status === "TODO" || item.status === "REJECTED" ? (
                    <form action={submitFairTaskAction} className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                      <input type="hidden" name="submission_id" value={item.id} />
                      <input
                        name="proof_url"
                        placeholder={item.task.requires_proof ? "Proof URL (required for this task)" : "Proof URL (optional)"}
                        className="rounded-lg border border-[#031E49]/15 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
                      />
                      <input
                        name="notes"
                        placeholder="Submission notes"
                        className="rounded-lg border border-[#031E49]/15 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#031E49] text-white text-xs font-bold hover:bg-[#0A2D6C]"
                      >
                        Submit
                      </button>
                    </form>
                  ) : (
                    <p className="mt-3 text-xs text-[#0A2D6C]/65">
                      Submitted at: {item.submitted_at ? new Date(item.submitted_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "-"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-3xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Department Leaderboard</h3>
              <div className="mt-4 space-y-2">
                {fairData.departments.slice(0, 6).map((department, index) => (
                  <div key={department.id} className="flex items-center justify-between rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-3 py-2">
                    <div>
                      <p className="text-xs font-bold">#{index + 1} {department.department_code}</p>
                      <p className="text-[11px] text-[#0A2D6C]/60">{department.department_name}</p>
                    </div>
                    <p className="text-sm font-bold text-[#00B16A]">{department.total_points}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Live Delivery Feed</h3>
              <div className="mt-4 space-y-2">
                {livePositions.map((position) => (
                  <div key={position.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-3 py-2">
                    <p className="text-xs font-bold text-[#031E49]">{position.dispatch_ref || "Dispatch"}</p>
                    <p className="mt-0.5 text-[11px] text-[#0A2D6C]/65">
                      {position.latitude && position.longitude
                        ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`
                        : "Location pending"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#0A2D6C]/55">
                      {position.location_note || "No note"} · {new Date(position.recorded_at).toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka" })}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
