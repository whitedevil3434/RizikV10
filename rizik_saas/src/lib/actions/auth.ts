"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/client";
import { ADMIN_ROLES, canAccessPortalRole, isControlPlanePath } from "@/lib/auth/policy";
import { redirect } from "next/navigation";
async function buildShadowPassword(firebaseUid: string): Promise<string> {
    const salt = (process.env.FIREBASE_SHADOW_PASSWORD_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "rizik-shadow-fallback").trim();
    const data = new TextEncoder().encode(`${firebaseUid}:${salt}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const requestedNext = (formData.get("next") as string | null) ?? "";
    const safeNext = getSafeNextPath(requestedNext);

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

            // Force Initialize Free Credits (3 Free Uses) if untouched
            const { data: currentUsage } = await adminSupabase
                .from("user_usage")
                .select("free_uses_remaining, total_transformations, paid_credits")
                .eq("user_id", data.user.id)
                .maybeSingle();

            if (!currentUsage) {
                await adminSupabase.from("user_usage").insert({
                    user_id: data.user.id,
                    free_uses_remaining: 3,
                    paid_credits: 0,
                });
            } else if (currentUsage.total_transformations === 0 && currentUsage.free_uses_remaining === 0 && currentUsage.paid_credits === 0) {
                await adminSupabase.from("user_usage")
                    .update({ free_uses_remaining: 3 })
                    .eq("user_id", data.user.id);
            }
        } catch (e) {
            console.error("Profile/Usage initialization error:", e);
        }
    }

    return { redirectTo: safeNext || "/store" };
}

function getSafeNextPath(requestedNext: string | null): string {
    if (!requestedNext) return "";
    if (requestedNext.startsWith("/") && !requestedNext.startsWith("//")) {
        return requestedNext;
    }
    if (requestedNext.startsWith("http")) {
        try {
            const url = new URL(requestedNext);
            const hostname = url.hostname;
            if (hostname === "localhost" || hostname.endsWith("rizikecosystem.com")) {
                return requestedNext;
            }
        } catch {
            return "";
        }
    }
    return "";
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
    const safeNext = getSafeNextPath(requestedNext);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        try {
            const adminSupabase = createAdminClient();
            const { data: usageRow } = await adminSupabase
                .from("user_usage")
                .select("user_id, free_uses_remaining, total_transformations, paid_credits")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!usageRow) {
                await adminSupabase.from("user_usage").insert({
                    user_id: user.id,
                    free_uses_remaining: 3,
                    paid_credits: 0,
                });
            } else if (usageRow.total_transformations === 0 && usageRow.free_uses_remaining === 0 && usageRow.paid_credits === 0) {
                await adminSupabase.from("user_usage")
                    .update({ free_uses_remaining: 3 })
                    .eq("user_id", user.id);
            }

            const { data: profile } = await adminSupabase
                .from("user_profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();

            const role = profile?.role || "CUSTOMER";
            const isAdmin = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
            const isPortal = canAccessPortalRole(role);

            if (safeNext) {
                let checkPath = safeNext;
                try {
                    if (safeNext.startsWith("http")) checkPath = new URL(safeNext).pathname;
                } catch {}

                if (!isControlPlanePath(checkPath)) return { redirectTo: safeNext };
                if (checkPath.startsWith("/admin") && isAdmin) return { redirectTo: safeNext };
                if (checkPath.startsWith("/portal") && isPortal) return { redirectTo: safeNext };
            }

            if (isAdmin) return { redirectTo: "/admin" };
            if (isPortal) return { redirectTo: "/portal" };
        } catch {
            if (safeNext) {
                let checkPath = safeNext;
                try { if (safeNext.startsWith("http")) checkPath = new URL(safeNext).pathname; } catch {}
                if (!isControlPlanePath(checkPath)) return { redirectTo: safeNext };
            }
        }
    }

    return { redirectTo: safeNext || "/store" };
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
export async function syncFirebaseUserAndSignInAction(firebaseUser: { uid: string, email: string, name: string, photoUrl: string }, nextPath: string = "") {
    if (!firebaseUser.email) {
        return { error: "Google account is missing an email address." };
    }

    const adminSupabase = createAdminClient();
    const ssrSupabase = await createServerSupabaseClient();
    const shadowPassword = await buildShadowPassword(firebaseUser.uid);

    // 1. Try to create the user in Supabase Auth as auto-confirmed
    const { data: newAuthUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: firebaseUser.email,
        password: shadowPassword,
        email_confirm: true,
        user_metadata: { full_name: firebaseUser.name, avatar_url: firebaseUser.photoUrl }
    });

    if (createError) {
        // Log for diagnostic purposes but don't fail immediately.
        // We will try one last time to find the user by email as a robust fallback.
        console.warn("Firebase sync createUser error, attempting fallback search:", createError.message);
    }

    // 2. Insert or Update user profile 
    // We do this whether newly created or already existing (to update name/avatar if needed)
    // To do this, we need the Supabase UID. 
    let supabaseUid: string | null = newAuthUser?.user?.id ?? null;

    if (!supabaseUid) {
        // Fallback: fetch their ID with paginated lookup if creation failed or was a partial success (existing user)
        supabaseUid = await findAuthUserIdByEmail(adminSupabase, firebaseUser.email);
    }

    if (!supabaseUid) {
        // If we STILL don't have a UID, return the original creation error if it existed
        if (createError) {
            console.error("Firebase sync mapping failure:", createError);
            return { error: `Failed to map Google account: ${createError.message}` };
        }
        return { error: "Failed to resolve Supabase user ID for Google account." };
    }

    if (supabaseUid) {
        // Keep a deterministic but secret-salted password for account-link sign-in.
        await adminSupabase.auth.admin.updateUserById(supabaseUid, {
            password: shadowPassword,
            user_metadata: { full_name: firebaseUser.name, avatar_url: firebaseUser.photoUrl },
        });

        // 2a. Ensure Profile Exists — NEVER overwrite existing role (Enterprise RBAC: Principle of Least Privilege)
        // Check if profile already exists to preserve admin/employee roles
        const { data: existingProfile } = await adminSupabase
            .from("user_profiles")
            .select("id, role")
            .eq("id", supabaseUid)
            .maybeSingle();

        if (existingProfile) {
            // Profile exists — only update name/avatar, NEVER touch role
            await adminSupabase.from("user_profiles").update({
                full_name: firebaseUser.name,
                avatar_url: firebaseUser.photoUrl,
            }).eq("id", supabaseUid);
        } else {
            // Truly new user — assign CUSTOMER role
            await adminSupabase.from("user_profiles").insert({
                id: supabaseUid,
                full_name: firebaseUser.name,
                avatar_url: firebaseUser.photoUrl,
                role: "CUSTOMER"
            });
        }

        // 2b. Ensure 3 Free Credits Exist
        const { data: existingUsage } = await adminSupabase
            .from("user_usage")
            .select("user_id, free_uses_remaining, total_transformations, paid_credits")
            .eq("user_id", supabaseUid)
            .maybeSingle();

        if (!existingUsage) {
            await adminSupabase.from("user_usage").insert({
                user_id: supabaseUid,
                free_uses_remaining: 3,
                paid_credits: 0,
            });
        } else if (existingUsage.total_transformations === 0 && existingUsage.free_uses_remaining === 0 && existingUsage.paid_credits === 0) {
            await adminSupabase.from("user_usage")
                .update({ free_uses_remaining: 3 })
                .eq("user_id", supabaseUid);
        }
    }

    // 3. Sign them in using the SSR client to set the cookies
    const { error: signInError } = await ssrSupabase.auth.signInWithPassword({
        email: firebaseUser.email,
        password: shadowPassword
    });

    if (signInError) {
        console.error("Firebase sync sign in error:", signInError);
        // If password mismatch (rare due to deterministic salt), try fixing it
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
             // Re-force the shadow password for safety
             if (supabaseUid) {
                 await adminSupabase.auth.admin.updateUserById(supabaseUid, { password: shadowPassword });
                 // Try one more time
                 const { error: retryError } = await ssrSupabase.auth.signInWithPassword({
                     email: firebaseUser.email,
                     password: shadowPassword
                 });
                 if (retryError) return { error: "Session creation failed after retry." };
             } else {
                 return { error: "Invalid password for mapped account." };
             }
        } else {
            return { error: "Failed to create active session." };
        }
    }

    // Redirect based on role
    const safeNext = getSafeNextPath(nextPath);
    const { data: { user } } = await ssrSupabase.auth.getUser();
    if (user) {
        const { data: profile } = await adminSupabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        const role = profile?.role || "CUSTOMER";
        const isAdmin = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
        const isPortal = canAccessPortalRole(role);

        if (safeNext) {
            // Reconstruct path to check against control plane prefixes if it's an absolute URL
            let checkPath = safeNext;
            try {
                if (safeNext.startsWith("http")) checkPath = new URL(safeNext).pathname;
            } catch {}

            if (!isControlPlanePath(checkPath)) return { redirectTo: safeNext };
            if (checkPath.startsWith("/admin") && isAdmin) return { redirectTo: safeNext };
            if (checkPath.startsWith("/portal") && isPortal) return { redirectTo: safeNext };
        }

        if (isAdmin) return { redirectTo: "/admin" };
        if (isPortal) return { redirectTo: "/portal" };
    }

    return { redirectTo: safeNext || "/store" };
}

/**
 * Server Action: Send password reset email.
 * Uses Supabase's built-in resetPasswordForEmail.
 */
export async function forgotPasswordAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const email = formData.get("email") as string;

    if (!email) return { error: "Email is required." };

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://rizikecosystem.com";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?type=recovery`,
    });

    if (error) {
        console.error("Password reset error:", error);
        // Don't reveal if email exists or not (security best practice)
        return { success: true };
    }

    return { success: true };
}

/**
 * Server Action: Update password after reset link.
 * Called from /login/update-password page.
 */
export async function updatePasswordAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
        return { error: "Password must be at least 6 characters." };
    }
    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
        console.error("Update password error:", error);
        return { error: "Failed to update password. The reset link may have expired." };
    }

    return { success: true, redirectTo: "/store" };
}

/**
 * Server Action: Get usage for the current user safely bypassing RLS
 */
export async function getUsageAction() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { free: 0, paid: 0 };

    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
        .from('user_usage')
        .select('free_uses_remaining, paid_credits')
        .eq('user_id', user.id)
        .single();
    
    if (data) {
        return { free: data.free_uses_remaining, paid: data.paid_credits };
    }
    return { free: 0, paid: 0 };
}
