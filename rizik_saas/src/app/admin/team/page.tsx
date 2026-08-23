"use client";

import { useMemo, useState } from "react";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  joinDate: string;
  workload: "LOW" | "MEDIUM" | "HIGH";
}

const employees: Employee[] = [
  { id: "E001", name: "Operations Admin", role: "SUPER_ADMIN", department: "Executive", email: "ops-admin@rizik.global", status: "ACTIVE", joinDate: "2025-01-15", workload: "HIGH" },
  { id: "E002", name: "Production Lead", role: "PRODUCTION_MANAGER", department: "Manufacturing", email: "production@rizik.global", status: "ACTIVE", joinDate: "2025-03-01", workload: "MEDIUM" },
  { id: "E003", name: "Logistics Lead", role: "LOGISTICS_MANAGER", department: "Logistics", email: "logistics@rizik.global", status: "ACTIVE", joinDate: "2025-05-20", workload: "HIGH" },
  { id: "E004", name: "Support Agent One", role: "SUPPORT_AGENT", department: "Customer Success", email: "support-1@rizik.global", status: "ACTIVE", joinDate: "2025-04-10", workload: "MEDIUM" },
  { id: "E005", name: "Support Agent Two", role: "SUPPORT_AGENT", department: "Customer Success", email: "support-2@rizik.global", status: "ON_LEAVE", joinDate: "2025-07-01", workload: "LOW" },
  { id: "E006", name: "Inventory Coordinator", role: "LOGISTICS_MANAGER", department: "Supply Chain", email: "supply@rizik.global", status: "ACTIVE", joinDate: "2025-08-11", workload: "MEDIUM" },
];

const roleHierarchy = [
  { role: "SUPER_ADMIN", label: "Super Admin", desc: "Full control over platform modules, users, and policies.", level: 5 },
  { role: "PRODUCTION_MANAGER", label: "Production Manager", desc: "Controls manufacturing schedule, quality checks, and batch release.", level: 4 },
  { role: "LOGISTICS_MANAGER", label: "Logistics Manager", desc: "Controls dispatch planning, fleet assignment, and delivery status.", level: 3 },
  { role: "SUPPORT_AGENT", label: "Support Agent", desc: "Handles customer tickets, follow-up, and response SLA.", level: 2 },
  { role: "B2B_BUYER", label: "B2B Buyer", desc: "External account with enterprise order and tracking visibility.", level: 1 },
  { role: "CUSTOMER", label: "Customer", desc: "Customer account for service access and order follow-up.", level: 0 },
];

const roleColor: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  PRODUCTION_MANAGER: "bg-blue-100 text-blue-700",
  LOGISTICS_MANAGER: "bg-amber-100 text-amber-700",
  SUPPORT_AGENT: "bg-violet-100 text-violet-700",
  B2B_BUYER: "bg-emerald-100 text-emerald-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

const workloadColor: Record<Employee["workload"], string> = {
  LOW: "text-[#031E49]/45",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600",
};

export default function AdminTeamPage() {
  const [view, setView] = useState<"team" | "rbac">("team");

  const activeCount = useMemo(() => employees.filter((emp) => emp.status === "ACTIVE").length, []);

  return (
    <OpsShell
      title="Team & RBAC"
      subtitle="Manage workforce capacity, access hierarchy, and operational role governance from one panel."
      activeHref="/admin/team"
      scopeLabel="Admin ERP"
      roleLabel="People & Access"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/team", label: "Workforce", tone: "neutral" },
        { href: "/admin/squads", label: "Squad Ops", tone: "neutral" },
        { href: "/admin/fair", label: "Fair Ops", tone: "primary" },
      ]}
    >
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setView("team")}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${view === "team" ? "bg-[#031E49] text-white" : "bg-white border border-[#031E49]/12 text-[#031E49]/70"}`}
        >
          <UserGroupIcon className="h-4 w-4 inline mr-1" />
          Team Roster ({activeCount} active)
        </button>
        <button
          onClick={() => setView("rbac")}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${view === "rbac" ? "bg-[#031E49] text-white" : "bg-white border border-[#031E49]/12 text-[#031E49]/70"}`}
        >
          <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
          RBAC Hierarchy
        </button>
      </div>

      {view === "team" ? (
        <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Workload</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/45">
                    <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{employee.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#031E49]">{employee.name}</p>
                      <p className="text-xs text-[#0A2D6C]/50">{employee.email}</p>
                    </td>
                    <td className="px-5 py-3 text-[#0A2D6C]/70">{employee.department}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleColor[employee.role] || "bg-gray-100 text-gray-700"}`}>
                        {employee.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-xs font-semibold ${workloadColor[employee.workload]}`}>{employee.workload}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${employee.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : employee.status === "ON_LEAVE" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {employee.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#0A2D6C]/60">{employee.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          {roleHierarchy.map((role) => (
            <article key={role.role} className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#031E49]/10 text-[#031E49] flex items-center justify-center font-bold">L{role.level}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleColor[role.role] || "bg-gray-100 text-gray-700"}`}>{role.role.replace(/_/g, " ")}</span>
                  <h3 className="text-sm font-bold text-[#031E49]">{role.label}</h3>
                </div>
                <p className="mt-1 text-sm text-[#0A2D6C]/60">{role.desc}</p>
              </div>
              <p className="text-xs font-semibold text-[#031E49]/45">{employees.filter((emp) => emp.role === role.role).length} active</p>
            </article>
          ))}
        </section>
      )}
    </OpsShell>
  );
}
