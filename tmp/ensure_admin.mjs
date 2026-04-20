
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yhwhkwveupjzrwdljivn.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMjg3OCwiZXhwIjoyMDg3Nzg4ODc4fQ.cOMxhnL4BjvllMx5K2UNkfHUuhC3rVhzWWSIIBLWCDg";

const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function checkAdmin() {
    const email = "sabbirhossainkhan43@gmail.com";
    console.log(`Checking user: ${email}`);
    
    // 1. Find user
    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) {
        console.error("List Error:", listError);
        return;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
        console.log("User does not exist. Creating...");
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
            email,
            password: "Kilo-Code@123",
            email_confirm: true,
            user_metadata: { full_name: "Sabbir (Super Admin)" }
        });
        if (createError) {
            console.error("Create Error:", createError);
        } else {
            console.log("User created successfully:", newUser.user?.id);
            // Assign SUPER_ADMIN Role
            const { error: profileError } = await adminSupabase.from("user_profiles").upsert({
                id: newUser.user?.id,
                full_name: "Sabbir (Super Admin)",
                role: "SUPER_ADMIN"
            }, { onConflict: 'id' });
            if (profileError) console.error("Profile Error:", profileError);
            else console.log("SUPER_ADMIN role assigned.");
        }
    } else {
        console.log("User exists:", user.id);
        // Ensure they have the SUPER_ADMIN role
        console.log("Setting role to SUPER_ADMIN...");
        const { error: profileError } = await adminSupabase.from("user_profiles").upsert({ 
            id: user.id, 
            role: "SUPER_ADMIN",
            full_name: "Sabbir (Super Admin)"
        }, { onConflict: 'id' });
        
        if (profileError) console.error("Profile Update Error:", profileError);
        else console.log("Role updated successfully.");

        // Force reset password to Kilo-Code@123 for our access
        console.log("Resetting password...");
        const { error: resetError } = await adminSupabase.auth.admin.updateUserById(user.id, {
            password: "Kilo-Code@123"
        });
        if (resetError) {
            console.error("Reset Error:", resetError);
        } else {
            console.log("Password reset successfully.");
        }
    }
}

checkAdmin();
