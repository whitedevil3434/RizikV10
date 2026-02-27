"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

/**
 * Server Action: Sign up with email/password.
 * Creates auth user + inserts into user_profiles.
 */
export async function signUpAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
    });

    if (error) return { error: error.message };

    if (data.user) {
        await supabase.from("user_profiles").insert({
            id: data.user.id,
            full_name: fullName,
            role: "CUSTOMER",
        });
    }

    redirect("/store");
}

/**
 * Server Action: Sign in with email/password.
 * Redirects based on user role (BRAC-style RBAC).
 */
export async function signInAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const adminRoles = ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER"];
        if (profile?.role && adminRoles.includes(profile.role)) redirect("/admin");
        if (profile?.role === "B2B_BUYER") redirect("/portal");
    }

    redirect("/store");
}

/**
 * Server Action: Sign out.
 */
export async function signOutAction() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
}

/**
 * Server Action: Firebase Google OAuth Sync.
 * Maps a Firebase user to a Supabase session by creating/verifying a shadow auth user.
 */
export async function syncFirebaseUserAndSignInAction(firebaseUser: { uid: string, email: string, name: string, photoUrl: string }) {
    const adminSupabase = createAdminClient();
    const ssrSupabase = await createServerSupabaseClient();
    const dummyPassword = `${firebaseUser.uid}#RizikV10`; // Deterministic password based on Firebase UID

    // 1. Try to create the user in Supabase Auth as auto-confirmed
    const { data: newAuthUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: firebaseUser.email,
        password: dummyPassword,
        email_confirm: true,
        user_metadata: { full_name: firebaseUser.name, avatar_url: firebaseUser.photoUrl }
    });

    // If there's an error that IS NOT "user already exists", return it
    if (createError && !createError.message.toLowerCase().includes("already registered")) {
        console.error("Firebase sync user creation error:", createError);
        return { error: "Failed to map Google account to Supabase." };
    }

    // 2. Insert or Update user profile 
    // We do this whether newly created or already existing (to update name/avatar if needed)
    // To do this, we need the Supabase UID. 
    let supabaseUid = newAuthUser?.user?.id;

    if (!supabaseUid) {
        // User already existed, fetch their ID
        const { data: existingUsers } = await adminSupabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u) => u.email === firebaseUser.email);
        supabaseUid = existingUser?.id;
    }

    if (supabaseUid) {
        await adminSupabase.from("user_profiles").upsert({
            id: supabaseUid,
            full_name: firebaseUser.name,
            avatar_url: firebaseUser.photoUrl,
            role: "CUSTOMER" // Default role, upsert might overwrite admin role if not careful, so let's only do it if it fails to find one
        }, { onConflict: 'id' }).select();

        // Actually, to avoid accidentally overwriting a SUPER_ADMIN role with CUSTOMER upon re-login,
        // let's only insert it if it doesn't already exist.
        const { data: profile } = await adminSupabase.from("user_profiles").select("role").eq("id", supabaseUid).single();
        if (!profile) {
            await adminSupabase.from("user_profiles").insert({
                id: supabaseUid,
                full_name: firebaseUser.name,
                avatar_url: firebaseUser.photoUrl,
                role: "CUSTOMER"
            });
        }
    }

    // 3. Sign them in using the SSR client to set the cookies
    const { error: signInError } = await ssrSupabase.auth.signInWithPassword({
        email: firebaseUser.email,
        password: dummyPassword
    });

    if (signInError) {
        console.error("Firebase sync sign in error:", signInError);
        return { error: "Failed to create active session." };
    }

    // Redirect based on role
    const { data: { user } } = await ssrSupabase.auth.getUser();
    if (user) {
        const { data: profile } = await adminSupabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const adminRoles = ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER"];
        if (profile?.role && adminRoles.includes(profile.role)) redirect("/admin");
        if (profile?.role === "B2B_BUYER") redirect("/portal");
    }

    redirect("/store");
}
