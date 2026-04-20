import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function isLocalHost(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

function resolveCookieDomain(): string | undefined {
    const explicit = process.env.SUPABASE_COOKIE_DOMAIN?.trim();
    if (explicit) return explicit;
    if (process.env.NODE_ENV !== "production") return undefined;

    const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (!configuredSite) return undefined;

    try {
        const hostname = new URL(configuredSite).hostname.toLowerCase();
        if (isLocalHost(hostname) || hostname.endsWith(".pages.dev")) return undefined;
        if (hostname.endsWith("rizikecosystem.com")) return ".rizikecosystem.com";
    } catch {
        return undefined;
    }

    return undefined;
}

/**
 * Creates a Supabase client for Server Components and Server Actions.
 * Uses @supabase/ssr for proper cookie-based session management.
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        const domain = resolveCookieDomain();
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                ...(domain ? { domain } : {}),
                            })
                        );
                    } catch {
                        // Ignored in Server Components (read-only context)
                    }
                },
            },
        }
    );
}

/**
 * Creates a Supabase Admin client (bypasses RLS).
 * ONLY use in Server Actions or API routes.
 */
export async function createAdminSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        const domain = resolveCookieDomain();
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                ...(domain ? { domain } : {}),
                            })
                        );
                    } catch {
                        // Ignored in Server Components
                    }
                },
            },
        }
    );
}
