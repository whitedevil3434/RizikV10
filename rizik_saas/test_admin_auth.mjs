import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing keys");
    process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function main() {
    console.log("Testing createUser...");
    const { data, error } = await adminSupabase.auth.admin.createUser({
        email: "test.diagnostic@rizik.local",
        password: "TestPassword123!",
        email_confirm: true,
        user_metadata: { full_name: "Test User" },
    });

    if (error) {
        console.error("CREATE ERROR:", error);
    } else {
        console.log("CREATE SUCCESS:", data.user?.id);
    }
}

main();
