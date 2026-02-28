"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/client";
import { ADMIN_ROLES, canAccessPortalRole, isControlPlanePath } from "@/lib/auth/policy";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

function buildShadowPassword(firebaseUid: string): string {
    const salt = (process.env.FIREBASE_SHADOW_PASSWORD_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "rizik-shadow-fallback").trim();
    const digest = createHash("sha256").update(`${firebaseUid}:${salt}`).digest("hex");
    return `${digest.slice(0, 30)}#Rz!`;
}

async function findAuthUserIdByEmail(
    adminSupabase: ReturnType<typeof createAdminClient>,
    email: string
): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    let page = 1;
    const perPage = 200;
    const maxPages = 50;

    while (page <= maxPages) {
        const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage });
        if (error) {
            console.error("Firebase sync list users error:", error);
            return null;
        }

        const users = data?.users || [];
        const match = users.find((u) => u.email?.trim().toLowerCase() === normalizedEmail);
        if (match?.id) return match.id;
        if (users.length < perPage) return null;

        page += 1;
    }

    return null;
}

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
        try {
            const adminSupabase = createAdminClient();
            await adminSupabase.from("user_profiles").upsert({
                id: data.user.id,
                full_name: fullName,
                role: "CUSTOMER",
            }, { onConflict: "id" });
        } catch {
            await supabase.from("user_profiles").upsert({
                id: data.user.id,
                full_name: fullName,
                role: "CUSTOMER",
            }, { onConflict: "id" });
        }
    }

    return { redirectTo: "/store" };
}

/**
 * Server Action: Sign in with email/password.
 * Redirects based on user role (RBAC).
 */
export async function signInAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const requestedNext = (formData.get("next") as string | null) ?? "";
    const safeNext = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
        ? requestedNext
        : "";

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        try {
            const adminSupabase = createAdminClient();
            const { data: profile } = await adminSupabase
                .from("user_profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();

            const role = profile?.role || "CUSTOMER";
            const isAdmin = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
            const isPortal = canAccessPortalRole(role);

            if (safeNext && !isControlPlanePath(safeNext)) return { redirectTo: safeNext };
            if (safeNext.startsWith("/admin") && isAdmin) return { redirectTo: safeNext };
            if (safeNext.startsWith("/portal") && isPortal) return { redirectTo: safeNext };

            if (isAdmin) return { redirectTo: "/admin" };
            if (isPortal) return { redirectTo: "/portal" };
        } catch {
            if (safeNext && !isControlPlanePath(safeNext)) {
                return { redirectTo: safeNext };
            }
        }
    }

    return { redirectTo: "/store" };
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
    if (!firebaseUser.email) {
        return { error: "Google account is missing an email address." };
    }

    const adminSupabase = createAdminClient();
    const ssrSupabase = await createServerSupabaseClient();
    const shadowPassword = buildShadowPassword(firebaseUser.uid);

    // 1. Try to create the user in Supabase Auth as auto-confirmed
    const { data: newAuthUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: firebaseUser.email,
        password: shadowPassword,
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
    let supabaseUid: string | null = newAuthUser?.user?.id ?? null;

    if (!supabaseUid) {
        // User already existed, fetch their ID with paginated lookup.
        supabaseUid = await findAuthUserIdByEmail(adminSupabase, firebaseUser.email);
    }

    if (supabaseUid) {
        // Keep a deterministic but secret-salted password for account-link sign-in.
        await adminSupabase.auth.admin.updateUserById(supabaseUid, {
            password: shadowPassword,
            user_metadata: { full_name: firebaseUser.name, avatar_url: firebaseUser.photoUrl },
        });

        const { data: profile } = await adminSupabase
            .from("user_profiles")
            .select("role")
            .eq("id", supabaseUid)
            .maybeSingle();

        if (!profile) {
            await adminSupabase.from("user_profiles").upsert({
                id: supabaseUid,
                full_name: firebaseUser.name,
                avatar_url: firebaseUser.photoUrl,
                role: "CUSTOMER"
            }, { onConflict: "id" });
        }
    }

    // 3. Sign them in using the SSR client to set the cookies
    const { error: signInError } = await ssrSupabase.auth.signInWithPassword({
        email: firebaseUser.email,
        password: shadowPassword
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
            .maybeSingle();

        if (profile?.role && ADMIN_ROLES.includes(profile.role as (typeof ADMIN_ROLES)[number])) return { redirectTo: "/admin" };
        if (profile?.role && canAccessPortalRole(profile.role)) return { redirectTo: "/portal" };
    }

    return { redirectTo: "/store" };
}
