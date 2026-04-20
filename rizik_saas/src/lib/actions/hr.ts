"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function generatePayrollAction(month: number, year: number) {
    const admin = createAdminClient();

    // 1. Fetch all employees
    const { data: employees, error: empError } = await admin
        .from("rizik_employees")
        .select("id, full_name, basic_salary_bdt");

    if (empError || !employees) {
        return { error: "Failed to fetch employees." };
    }

    // 2. Check for existing payroll for this period to avoid duplicates
    const { data: existing } = await admin
        .from("rizik_payroll")
        .select("id")
        .eq("month", month)
        .eq("year", year);

    if (existing && existing.length > 0) {
        return { error: `Payroll for ${month}/${year} already exists.` };
    }

    const payrollRecords = employees.map(emp => {
        const basic = emp.basic_salary_bdt || 25000;
        const allowances = basic * 0.1; // 10% auto-allowance for now
        const deductions = 0; // Default
        const net = basic + allowances - deductions;

        return {
            employee_id: emp.id,
            month,
            year,
            basic_bdt: basic,
            allowances_bdt: allowances,
            deductions_bdt: deductions,
            net_salary_bdt: net,
            status: 'DRAFT'
        };
    });

    // 3. Insert records
    const { error: insertError } = await admin.from("rizik_payroll").insert(payrollRecords);

    if (insertError) {
        console.error("Payroll Generation Error:", insertError);
        return { error: "Failed to generate payroll records." };
    }

    revalidatePath("/admin/hr/payroll");
    return { success: true, count: payrollRecords.length };
}
