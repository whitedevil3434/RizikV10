import { getCurrentUserContext } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/client";
import { getFilteredNavItems, portalNavItems } from "@/lib/workspace/nav";
import CheckInClient from "./CheckInClient";

export default async function PortalCheckInPage() {
    const { user, role } = await getCurrentUserContext();
    const admin = createAdminClient();

    // Get employee info
    const { data: employee } = await admin
        .from("rizik_employees")
        .select("id, full_name")
        .eq("email", user?.email || "")
        .maybeSingle();

    const empName = employee?.full_name || user?.email || "Employee";

    // Check today's attendance record
    const today = new Date().toISOString().split("T")[0];
    let todayRecord: { check_in: string; check_out: string | null } | null = null;

    if (employee) {
        const { data: attendance } = await admin
            .from("rizik_attendance")
            .select("check_in, check_out")
            .eq("employee_id", employee.id)
            .eq("date", today)
            .maybeSingle();

        todayRecord = attendance;
    }

    const navItems = getFilteredNavItems(role, portalNavItems);

    return (
        <CheckInClient
            employeeName={empName}
            todayRecord={todayRecord}
            navItems={navItems}
        />
    );
}
