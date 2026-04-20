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

async function createTestAccount(email, password, fullName, role) {
    console.log(`Setting up ${email}...`);
    // Create or get user
    let userId;
    const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    });

    if (createError && (createError.code === "user_already_exists" || createError.code === "email_exists")) {
        console.log(`User ${email} already exists. Updating password...`);
        // We have to get the ID
        const { data: usersData } = await adminSupabase.auth.admin.listUsers();
        const user = usersData.users.find(u => u.email === email);
        userId = user.id;

        await adminSupabase.auth.admin.updateUserById(userId, { password });
    } else if (createError) {
        console.error(`Error creating ${email}:`, createError);
        return;
    } else {
        userId = createData.user.id;
    }

    // Upsert profile
    const { error: profileError } = await adminSupabase.from("user_profiles").upsert({
        id: userId,
        full_name: fullName,
        role: role
    }, { onConflict: "id" });

    if (profileError) {
        console.error(`Error profiling ${email}:`, profileError);
    } else {
        console.log(`Successfully configured ${email} as ${role}`);
    }
}

async function main() {
    await createTestAccount("admin@rizik.com", "password123", "Rizik Admin", "SUPER_ADMIN");
    await createTestAccount("employee@rizik.com", "password123", "Rizik Employee", "PRODUCTION_MANAGER");
    await createTestAccount("customer@test.com", "password123", "Test Customer", "CUSTOMER");
}

main();
