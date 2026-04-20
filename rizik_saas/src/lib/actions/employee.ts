"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Check-in: creates an attendance record for today */
export async function checkInAction() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();

    // Get employee record linked to this user
    const { data: employee } = await admin
        .from("rizik_employees")
        .select("id, full_name")
        .eq("email", user.email)
        .maybeSingle();

    if (!employee) return { error: "Employee record not found" };

    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const { data: existing } = await admin
        .from("rizik_attendance")
        .select("id")
        .eq("employee_id", employee.id)
        .eq("date", today)
        .maybeSingle();

    if (existing) return { error: "Already checked in today" };

    const now = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour12: false });

    const { error } = await admin.from("rizik_attendance").insert({
        employee_id: employee.id,
        employee_name: employee.full_name,
        date: today,
        check_in: now,
        status: "PRESENT",
    });

    if (error) return { error: error.message };
    return { success: true, time: now };
}

/** Check-out: updates today's attendance record with check-out time */
export async function checkOutAction() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = createAdminClient();

    const { data: employee } = await admin
        .from("rizik_employees")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

    if (!employee) return { error: "Employee record not found" };

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour12: false });

    const { data: existing } = await admin
        .from("rizik_attendance")
        .select("id, check_in")
        .eq("employee_id", employee.id)
        .eq("date", today)
        .maybeSingle();

    if (!existing) return { error: "No check-in found for today" };

    // Calculate hours worked
    const checkInParts = existing.check_in.split(":").map(Number);
    const nowParts = now.split(":").map(Number);
    const hoursWorked = ((nowParts[0] * 60 + nowParts[1]) - (checkInParts[0] * 60 + checkInParts[1])) / 60;

    const { error } = await admin
        .from("rizik_attendance")
        .update({
            check_out: now,
            hours_worked: parseFloat(hoursWorked.toFixed(1)),
        })
        .eq("id", existing.id);

    if (error) return { error: error.message };
    return { success: true, time: now, hoursWorked: hoursWorked.toFixed(1) };
}

/** Report an issue: creates ops request */
export async function reportIssueAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const category = formData.get("category") as string;
    const note = formData.get("note") as string;

    if (!category || !note) return { error: "Category and note are required" };

    const admin = createAdminClient();

    // Get employee name
    const { data: employee } = await admin
        .from("rizik_employees")
        .select("full_name, department")
        .eq("email", user.email)
        .maybeSingle();

    const code = `RPT-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await admin.from("rizik_ops_requests").insert({
        request_code: code,
        request_type: category,
        detail: note,
        owner_team: employee?.department || "Operations",
        status: "APPROVAL_PENDING",
        submitted_by: employee?.full_name || user.email,
    });

    if (error) return { error: error.message };
    return { success: true, code };
}
