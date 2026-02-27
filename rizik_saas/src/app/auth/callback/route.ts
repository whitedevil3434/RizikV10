import { createServerSupabaseClient } from '@/lib/supabase/server';
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
            // Check if user_profiles row exists, if not create one
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: existingProfile } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    await supabase.from('user_profiles').insert({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email || 'New User',
                        role: 'CUSTOMER',
                    });
                }
            }

            return NextResponse.redirect(`${origin}/store`);
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
