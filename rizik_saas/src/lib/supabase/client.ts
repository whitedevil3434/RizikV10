import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase client for client-side operations
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
        domain: process.env.NODE_ENV === 'production' ? '.rizikecosystem.com' : 'localhost',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    }
});

/**
 * Creates a Supabase client with the Service Role key for backend/admin operations.
 * WARNING: NEVER use this on the client-side as it bypasses Row Level Security (RLS).
 * Only use in Server Actions or API routes.
 */
export const createAdminClient = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("Missing Supabase Service Key");

    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
