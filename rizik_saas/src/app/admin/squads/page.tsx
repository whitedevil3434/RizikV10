import OpsShell from "@/components/workspace/ops-shell";
import { getSquadOperationsData } from "@/lib/fair/data";
import { adminNavItems } from "@/lib/workspace/nav";

function toneByStatus(status: string): string {
  if (status === "APPROVED" || status === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (status === "SCREENING" || status === "OPEN") return "bg-amber-100 text-amber-700";
  if (status === "REJECTED" || status === "CLOSED") return "bg-red-100 text-red-700";
  return "bg-[#031E49]/10 text-[#031E49]";
}

export default async function AdminSquadsPage() {
  const data = await getSquadOperationsData();

  return (
    <OpsShell
      title="Squad Workforce Operations"
      subtitle="Control temporary workforce pipelines, squad composition, and assignment execution under permanent teams."
      activeHref="/admin/squads"
      scopeLabel="Admin ERP"
      roleLabel="Workforce Extension"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/squads", label: "Squad Ops", tone: "neutral" },
        { href: "/admin/team", label: "Team & RBAC", tone: "neutral" },
        { href: "/admin/fair", label: "Fair Ops", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Squad Units</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{data.squads.length}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Applications</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{data.applications.length}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Open Jobs</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{data.jobs.filter((job) => job.status === "OPEN").length}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Live Delivery Trackers</p>
          <p className="mt-2 text-3xl font-bold text-[#00B16A]">{data.livePositions.length}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-7">
        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49]">Workforce Application Queue</h2>
          <div className="mt-4 space-y-3">
            {data.applications.map((application) => (
              <div key={application.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#031E49]">{application.registration_name || "Applicant"}</p>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${toneByStatus(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#0A2D6C]/65">
                  {application.institution_name || "Institution pending"} · {application.subject_area || "Subject pending"}
                </p>
                <p className="mt-1 text-[11px] text-[#0A2D6C]/55">
                  Preferred: {application.preferred_department || "Not specified"} · {new Date(application.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49]">Active Squads</h2>
          <div className="mt-4 space-y-3">
            {data.squads.map((squad) => (
              <div key={squad.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#031E49]">{squad.squad_name}</p>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${squad.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {squad.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#0A2D6C]/65">{squad.department_name || "Department pending"} · {squad.squad_type}</p>
                <p className="mt-1 text-[11px] text-[#0A2D6C]/55">Members: {squad.member_count} · Open jobs: {squad.open_jobs}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49]">Squad Job Board</h2>
          <div className="mt-4 space-y-3">
            {data.jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#031E49]">{job.title}</p>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${toneByStatus(job.status)}`}>{job.status}</span>
                </div>
                <p className="mt-1 text-xs text-[#0A2D6C]/65">{job.squad_name || "Unassigned squad"} · {job.department_name || "Department pending"}</p>
                <p className="mt-1 text-[11px] text-[#0A2D6C]/55">
                  {job.location_text || "Location pending"} · {job.starts_at ? new Date(job.starts_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "Schedule pending"}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49]">Live Delivery Tracking</h2>
          <div className="mt-4 space-y-3">
            {data.livePositions.map((position) => (
              <div key={position.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-4 py-3">
                <p className="text-sm font-bold text-[#031E49]">{position.dispatch_ref || "Dispatch tracker"}</p>
                <p className="mt-1 text-xs text-[#0A2D6C]/65">
                  {position.latitude && position.longitude
                    ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`
                    : "Coordinates pending"}
                </p>
                <p className="mt-1 text-[11px] text-[#0A2D6C]/55">
                  Speed: {position.speed_kmh ?? 0} km/h · {position.location_note || "No note"}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </OpsShell>
  );
}
