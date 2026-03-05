import Link from "next/link";
import FairCountdown from "@/components/fair/fair-countdown";
import FairKineticScene from "@/components/fair/fair-kinetic-scene";
import { getFairLandingData } from "@/lib/fair/data";

const storyCards = [
  {
    title: "Squad Arena",
    detail: "Participants are grouped by department and assigned into supervised squads for live fair tasks.",
    tone: "from-[#031E49] to-[#0A2D6C]",
  },
  {
    title: "Creator Booths",
    detail: "Young teams showcase field outcomes, QR growth metrics, and community-led conversion results.",
    tone: "from-[#0A2D6C] to-[#00684B]",
  },
  {
    title: "Final Stage",
    detail: "Top department receives sponsor slot, hamper rewards, and priority ecosystem onboarding.",
    tone: "from-[#00684B] to-[#00B16A]",
  },
];

export default async function FairLandingPage({
  searchParams,
}: {
  searchParams?: Promise<{ scan?: string }>;
}) {
  const params = (await searchParams) || {};
  const scanCode = params.scan || "";

  const { event, departments, tasks } = await getFairLandingData();
  const topDepartment = departments[0]?.department_name || "Department Pulse";
  const totalPoints = departments.reduce((sum, department) => sum + department.total_points, 0);
  const strongestScore = departments[0]?.total_points || 1;

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#031E49]">
      <section className="relative isolate overflow-hidden border-b border-[#031E49]/10 bg-[#f8f4ec]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(0,177,106,0.16),transparent_30%),radial-gradient(circle_at_86%_6%,rgba(4,32,76,0.19),transparent_38%),linear-gradient(180deg,#f8f4ec_0%,#f3efe6_100%)]" />
        <div className="absolute inset-0 opacity-40 [background:linear-gradient(120deg,rgba(3,30,73,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(3,30,73,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_0.94fr] gap-8 items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-[#031E49]/15 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#031E49]/75">
                Rizik Fair Experience Surface
              </p>

              <h1 className="mt-6 text-4xl md:text-6xl leading-[1.03] font-black tracking-tight text-[#031E49]">
                {event.name}
                <span className="block text-transparent bg-clip-text bg-[linear-gradient(90deg,#00B16A_0%,#0B3D8E_80%)]">
                  Next-Gen Launch Arena
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base md:text-lg text-[#0A2D6C]/75 leading-relaxed">
                QR-to-web onboarding, department war leaderboard, creative mission flow, and squad-based workforce entry
                designed for a modern youth-first fair experience.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#031E49]/15 bg-white px-3 py-1 text-xs font-semibold text-[#031E49]/80">
                  {departments.length} Departments Live
                </span>
                <span className="rounded-full border border-[#031E49]/15 bg-white px-3 py-1 text-xs font-semibold text-[#031E49]/80">
                  {tasks.length} Missions Active
                </span>
                <span className="rounded-full border border-[#00B16A]/25 bg-[#00B16A]/10 px-3 py-1 text-xs font-semibold text-[#00784D]">
                  {totalPoints} Total Points Tracked
                </span>
              </div>

              {scanCode ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#00B16A]/35 bg-[#00B16A]/12 px-3 py-2 text-xs font-semibold text-[#00784D]">
                  QR scan detected: {scanCode}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/fair/join" className="px-6 py-3 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]">
                  Join Rizik Fair
                </Link>
                <Link href="/fair/dashboard" className="px-6 py-3 rounded-full border border-[#031E49]/18 bg-white text-[#031E49] text-sm font-bold hover:bg-[#f8f4ec]">
                  Open My Dashboard
                </Link>
                <Link href="/community" className="px-6 py-3 rounded-full border border-[#031E49]/18 bg-white text-[#031E49] text-sm font-bold hover:bg-[#f8f4ec]">
                  Explore Community
                </Link>
              </div>
            </div>

            <FairKineticScene
              topDepartment={topDepartment}
              totalDepartments={departments.length}
              totalTasks={tasks.length}
              scanCode={scanCode || undefined}
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {storyCards.map((card) => (
            <article key={card.title} className="relative overflow-hidden rounded-3xl border border-[#031E49]/12 bg-white shadow-[0_12px_32px_rgba(3,30,73,0.08)]">
              <div className={`h-1.5 bg-gradient-to-r ${card.tone}`} />
              <div className="p-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#031E49]/70 font-semibold">Experience Block</p>
                <h2 className="mt-2 text-xl font-extrabold text-[#031E49]">{card.title}</h2>
                <p className="mt-3 text-sm text-[#0A2D6C]/70 leading-relaxed">{card.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-[0_12px_32px_rgba(3,30,73,0.08)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-[#031E49]">Countdown Chamber</h2>
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[#00784D]">Finalism Trigger</p>
            </div>
            <p className="mt-3 text-sm text-[#0A2D6C]/68 leading-relaxed">
              Once this timer reaches zero, scoreboard values are frozen for final verification and the winner announcement process starts.
            </p>
            <div className="mt-5">
              <FairCountdown targetIso={event.event_starts_at} />
            </div>
            <p className="mt-4 text-xs text-[#0A2D6C]/75">
              Launch time: {new Date(event.event_starts_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
            </p>
          </article>

          <article className="rounded-3xl border border-[#031E49]/10 bg-[linear-gradient(155deg,#031E49_0%,#0B3278_55%,#00754E_120%)] p-6 text-white shadow-[0_18px_40px_rgba(3,30,73,0.28)]">
            <p className="text-xs uppercase tracking-[0.14em] text-white/65 font-semibold">Workforce Extension</p>
            <h3 className="mt-3 text-2xl font-black">Squad-Based Part-Time Model</h3>
            <p className="mt-3 text-sm text-white/78 leading-relaxed">
              Participants from schools, colleges, universities, madrasas, mosque networks, and support communities are
              onboarded into squads under permanent Rizik managers.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Supervised by permanent staff</div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Department-based assignments</div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Realtime mission tracking</div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Sponsor-ready winner pipeline</div>
            </div>
          </article>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
          <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-[0_12px_32px_rgba(3,30,73,0.08)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-[#031E49]">Department War Leaderboard</h2>
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[#031E49]/70">Live Attention Map</p>
            </div>
            <div className="mt-5 space-y-3">
              {departments.length === 0 ? (
                <p className="text-sm text-[#0A2D6C]/60">No department data available yet.</p>
              ) : (
                departments.slice(0, 8).map((department, index) => {
                  const width = Math.max(8, Math.round((department.total_points / strongestScore) * 100));
                  return (
                    <div key={department.id} className="rounded-2xl border border-[#031E49]/10 bg-[#F6F2EA] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#031E49]">#{index + 1} {department.department_name}</p>
                          <p className="text-xs text-[#0A2D6C]/75">{department.institution_name || "Rizik Partner Network"}</p>
                        </div>
                        <p className="text-base font-bold text-[#00784D]">{department.total_points} pts</p>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[#031E49]/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#00B16A_0%,#0B4AA3_100%)]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-[0_12px_32px_rgba(3,30,73,0.08)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-[#031E49]">Mission Sequence</h2>
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[#031E49]/70">Onboarding Path</p>
            </div>
            <div className="mt-5 space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-[#0A2D6C]/60">No mission tasks are configured yet.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-[#031E49]/10 bg-[#F6F2EA] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#031E49]">
                        {task.task_order}. {task.title}
                      </p>
                      <span className="text-xs font-bold text-[#00784D]">+{task.points}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#0A2D6C]/75">{task.description || "Task details appear in dashboard."}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${task.requires_proof ? "bg-[#031E49] text-white" : "bg-[#031E49]/10 text-[#031E49]"}`}>
                        {task.requires_proof ? "Proof Required" : "Self-Verified"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
