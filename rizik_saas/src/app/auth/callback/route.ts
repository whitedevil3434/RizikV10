export const runtime = 'edge';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_ROLES, canAccessPortalRole, isControlPlanePath } from '@/lib/auth/policy';
import { NextResponse } from 'next/server';

function getSafeNextPath(requestedNext: string | null): string {
    if (!requestedNext) return "";
    if (requestedNext.startsWith("/") && !requestedNext.startsWith("//")) {
        return requestedNext;
    }
    if (requestedNext.startsWith("http")) {
        try {
            const url = new URL(requestedNext);
            const hostname = url.hostname.toLowerCase();
            const configuredSiteHost = process.env.NEXT_PUBLIC_SITE_URL
                ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.toLowerCase()
                : "";
            const opsHost = (process.env.OPS_HOSTNAME || "").toLowerCase().split(":")[0];

            const allowedHosts = new Set<string>([
                "localhost",
                "127.0.0.1",
                configuredSiteHost,
                opsHost,
            ].filter(Boolean));

            if (allowedHosts.has(hostname) || hostname === "rizikecosystem.com" || hostname.endsWith(".rizikecosystem.com")) {
                return requestedNext;
            }
        } catch {
            return "";
        }
    }
    return "";
}

/**
 * OAuth Callback Route.
 * Supabase redirects here after Google sign-in.
 * Exchanges the code for a session, then redirects to the public home.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const safeNext = getSafeNextPath(searchParams.get("next"));

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            let adminSupabase: ReturnType<typeof createAdminClient> | null = null;
            try {
                adminSupabase = createAdminClient();
            } catch {
                adminSupabase = null;
            }
            // Check if user_profiles row exists, if not create one
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: existingProfile } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!existingProfile) {
                    const profileData = {
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email || 'New User',
                        role: 'CUSTOMER',
                    };

                    if (adminSupabase) {
                        await adminSupabase.from('user_profiles').upsert(profileData, { onConflict: "id" });
                    } else {
                        await supabase.from('user_profiles').upsert(profileData, { onConflict: "id" });
                    }
                }

                const usageData = {
                    user_id: user.id,
                    free_uses_remaining: 3,
                    paid_credits: 0,
                };
                if (adminSupabase) {
                    await adminSupabase.from('user_usage').upsert(usageData, { onConflict: "user_id", ignoreDuplicates: true });
                } else {
                    await supabase.from('user_usage').upsert(usageData, { onConflict: "user_id", ignoreDuplicates: true });
                }
            }

            // Check if this is a password recovery callback
            const type = searchParams.get('type');
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/login/update-password`);
            }

            if (safeNext) {
                let checkPath = safeNext;
                try {
                    if (safeNext.startsWith("http")) checkPath = new URL(safeNext).pathname;
                } catch {}
                if (!isControlPlanePath(checkPath)) return NextResponse.redirect(safeNext.startsWith("http") ? safeNext : `${origin}${safeNext}`);
            }

            if (user) {
                let role = "CUSTOMER";
                try {
                    if (adminSupabase) {
                        const { data: profile } = await adminSupabase
                            .from("user_profiles")
                            .select("role")
                            .eq("id", user.id)
                            .maybeSingle();
                        role = profile?.role || "CUSTOMER";
                    } else {
                        const { data: profile } = await supabase
                            .from("user_profiles")
                            .select("role")
                            .eq("id", user.id)
                            .maybeSingle();
                        role = profile?.role || "CUSTOMER";
                    }
                } catch {
                    role = "CUSTOMER";
                }

                if (safeNext) {
                    let checkPath = safeNext;
                    try {
                        if (safeNext.startsWith("http")) checkPath = new URL(safeNext).pathname;
                    } catch {}

                    if (checkPath.startsWith("/admin") && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
                        return NextResponse.redirect(safeNext.startsWith("http") ? safeNext : `${origin}${safeNext}`);
                    }
                    if (checkPath.startsWith("/portal") && canAccessPortalRole(role)) {
                        return NextResponse.redirect(safeNext.startsWith("http") ? safeNext : `${origin}${safeNext}`);
                    }
                }

                if (ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
                    return NextResponse.redirect(`${origin}/admin`);
                }
                if (canAccessPortalRole(role)) {
                    return NextResponse.redirect(`${origin}/portal`);
                }
            }

            return NextResponse.redirect(`${origin}/`);
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
