import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";
import { getEmployeeTasks, type OpsTask } from "@/lib/ops/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleTeam } from "@/lib/auth/policy";

function groupTasks(tasks: OpsTask[]) {
  const todo = tasks.filter((task) => task.status === "TODO");
  const doing = tasks.filter((task) => task.status === "IN_PROGRESS");
  const done = tasks.filter((task) => task.status === "DONE");
  return { todo, doing, done };
}

export default async function PortalTasksPage() {
  // Get user role
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = "GUEST";
  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("user_profiles").select("role").eq("id", user.id).maybeSingle();
    role = profile?.role || "CUSTOMER";
  }

  const team = getRoleTeam(role);
  const tasks = await getEmployeeTasks(100, team);
  const grouped = groupTasks(tasks);

  return (
    <OpsShell
      title="My Tasks"
      subtitle="Daily execution board across support, logistics, and production operations."
      activeHref="/portal/tasks"
      scopeLabel="Employee Portal"
      roleLabel="Task Execution"
      navItems={portalNavItems}
      quickLinks={[
        { href: "/portal/tasks", label: "Board", tone: "neutral" },
        { href: "/portal/requests", label: "Requests", tone: "neutral" },
        { href: "/portal", label: "Overview", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <TaskColumn title="To Do" items={grouped.todo} />
        <TaskColumn title="In Progress" items={grouped.doing} />
        <TaskColumn title="Completed" items={grouped.done} />
      </section>
    </OpsShell>
  );
}

function TaskColumn({ title, items }: { title: string; items: OpsTask[] }) {
  return (
    <article className="rounded-2xl border border-[#031E49]/15 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-[#031E49] mb-3">{title}</h2>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-[#0A2D6C]/55">No records.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 p-3">
              <p className="text-sm font-semibold text-[#031E49]">{item.title}</p>
              <p className="mt-1 text-xs text-[#0A2D6C]/60">
                Owner: {item.owner_team || "Ops"} · Due: {item.due_at ? new Date(item.due_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "-"}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
