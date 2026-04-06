export const runtime = 'edge';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

/**
 * OAuth Callback Route.
 * Supabase redirects here after Google sign-in.
 * Exchanges the code for a session, then redirects to /store.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

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

            return NextResponse.redirect(`${origin}/store`);
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
