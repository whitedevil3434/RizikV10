"use server";

import { createAdminClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

// ── Create Invoice ──
export async function createInvoiceAction(formData: FormData) {
    const customerName = (formData.get("customer_name") as string || "").trim();
    const customerEmail = (formData.get("customer_email") as string || "").trim();
    const orderCode = (formData.get("order_code") as string || "").trim();
    const subtotal = parseFloat(formData.get("subtotal_bdt") as string || "0");
    const notes = (formData.get("notes") as string || "").trim();
    const dueDays = parseInt(formData.get("due_days") as string || "30", 10);

    if (!customerName || subtotal <= 0) {
        return { error: "Customer name and subtotal are required." };
    }

    const tax = Math.round(subtotal * 0.075 * 100) / 100; // BD VAT 7.5%
    const total = subtotal + tax;
    const seq = Math.floor(Math.random() * 900) + 100;
    const invoiceNumber = `RZK-INV-${new Date().getFullYear()}-${seq}`;
    const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString().split("T")[0];

    const admin = createAdminClient();
    const { error } = await admin.from("rizik_invoices").insert({
        invoice_number: invoiceNumber,
        order_code: orderCode || null,
        customer_name: customerName,
        customer_email: customerEmail || null,
        subtotal_bdt: subtotal,
        tax_bdt: tax,
        total_bdt: total,
        status: "DRAFT",
        due_date: dueDate,
        notes: notes || null,
    });

    if (error) {
        console.error("Create invoice error:", error);
        return { error: "Failed to create invoice." };
    }

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/invoices");
    return { success: true, invoiceNumber };
}

// ── Mark Invoice as Paid ──
export async function markInvoicePaidAction(invoiceId: string, paymentMethod: string) {
    const admin = createAdminClient();
    const { error } = await admin
        .from("rizik_invoices")
        .update({ status: "PAID", paid_at: new Date().toISOString(), payment_method: paymentMethod })
        .eq("id", invoiceId);

    if (error) return { error: "Failed to update invoice." };
    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/invoices");
    return { success: true };
}

// ── Send Invoice ──
export async function sendInvoiceAction(invoiceId: string) {
    const admin = createAdminClient();
    const { error } = await admin
        .from("rizik_invoices")
        .update({ status: "SENT" })
        .eq("id", invoiceId);

    if (error) return { error: "Failed to send invoice." };
    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/invoices");
    return { success: true };
}

// ── Submit Expense ──
export async function submitExpenseAction(formData: FormData) {
    const category = (formData.get("category") as string || "MATERIALS").trim();
    const description = (formData.get("description") as string || "").trim();
    const amount = parseFloat(formData.get("amount_bdt") as string || "0");
    const submittedBy = (formData.get("submitted_by") as string || "").trim();

    if (!description || amount <= 0) {
        return { error: "Description and amount are required." };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("rizik_expenses").insert({
        category,
        description,
        amount_bdt: amount,
        submitted_by: submittedBy || null,
        status: "PENDING",
    });

    if (error) return { error: "Failed to submit expense." };
    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/expenses");
    return { success: true };
}

// ── Approve Expense ──
export async function approveExpenseAction(expenseId: string, approverName: string) {
    const admin = createAdminClient();
    const { error } = await admin
        .from("rizik_expenses")
        .update({ status: "APPROVED", approved_by: approverName })
        .eq("id", expenseId);

    if (error) return { error: "Failed to approve expense." };
    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/expenses");
    return { success: true };
}
