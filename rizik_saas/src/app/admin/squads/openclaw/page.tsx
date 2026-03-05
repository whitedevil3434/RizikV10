import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";
import OpenClawChatClient from "./OpenClawChatClient";
import { getCurrentUserContext } from "@/lib/auth/session";

export default async function OpenClawAgentPage() {
    const admin = createAdminClient();
    const { role } = await getCurrentUserContext();

    // Fetch last 50 messages to prime the chat
    const { data } = await admin
        .from("rizik_openclaw_comms")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

    const initialMessages = (data || []).map(r => ({
        id: r.id,
        sender: r.sender as "USER" | "OPENCLAW" | "ANTIGRAVITY",
        msg_type: r.msg_type as "COMMAND" | "LOG" | "ERROR" | "SUCCESS" | "CHAT",
        content: r.content,
        metadata: r.metadata,
        created_at: r.created_at
    }));

    return (
        <OpsShell
            title="OpenClaw Operations Hub"
            subtitle="Secure bridge to local Mac Mini Agent for automated design & printing."
            activeHref="/admin/squads/openclaw"
            scopeLabel="Admin ERP"
            roleLabel="Agent Command"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/squads", label: "Overview", tone: "neutral" },
                { href: "/admin/squads/openclaw", label: "OpenClaw UI", tone: "primary" },
            ]}
        >
            <div className="max-w-4xl mx-auto h-[75vh]">
                <OpenClawChatClient initialMessages={initialMessages} userRole={role} />
            </div>
        </OpsShell>
    );
}
