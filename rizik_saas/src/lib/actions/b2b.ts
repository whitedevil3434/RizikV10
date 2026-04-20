"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitB2BInquiryAction(formData: FormData) {
    const admin = createAdminClient();

    const org_name = formData.get("org_name") as string;
    const contact_name = formData.get("contact_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const category = formData.get("category") as string;
    const estimated_volume = parseInt(formData.get("estimated_volume") as string || "0");
    const requirements = formData.get("requirements") as string;

    if (!org_name || !contact_name || !email) {
        return { error: "Organization, Contact Name, and Email are required." };
    }

    const { error } = await admin.from("rizik_b2b_inquiries").insert({
        org_name,
        contact_name,
        email,
        phone,
        category,
        estimated_volume,
        requirements,
        status: 'NEW'
    });

    if (error) {
        console.error("B2B Inquiry Error:", error);
        return { error: "Failed to submit inquiry. Please try again." };
    }

    revalidatePath("/admin/crm");
    return { success: true };
}
