"use server";

import { createAdminClient } from "@/lib/supabase/client";
import { getCurrentUserContext } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function sendOpenClawCommand(content: string, metadata: Record<string, unknown> = {}) {
    const { user, role } = await getCurrentUserContext();
    if (!user) return { error: "Unauthorized" };

    if (!["SUPER_ADMIN", "PRODUCTION_MANAGER"].includes(role)) {
        return { error: "Permission Denied. Only Admins can command OpenClaw." };
    }

    const admin = createAdminClient();

    const { error } = await admin
        .from("rizik_openclaw_comms")
        .insert({
            sender: "USER",
            msg_type: "COMMAND",
            content: content,
            metadata: {
                user_email: user.email,
                ...metadata
            }
        });

    if (error) {
        console.error("Agent Command Error:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/squads/openclaw");
    return { success: true };
}

export async function clearOpenClawLogs() {
    const { user, role } = await getCurrentUserContext();
    if (!user || role !== "SUPER_ADMIN") return { error: "Unauthorized" };

    const admin = createAdminClient();

    // Delete everything EXCEPT the last 5 messages to keep some context
    const { data: keepData } = await admin
        .from("rizik_openclaw_comms")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(5);

    if (keepData && keepData.length > 0) {
        const keepIds = keepData.map(r => r.id);
        const { error } = await admin
            .from("rizik_openclaw_comms")
            .delete()
            .not("id", "in", `(${keepIds.join(",")})`);

        if (error) {
            console.error("Log Clear Error:", error);
            return { error: error.message };
        }
    } else {
        await admin.from("rizik_openclaw_comms").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all hack
    }

    revalidatePath("/admin/squads/openclaw");
    return { success: true };
}
