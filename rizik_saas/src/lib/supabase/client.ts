import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function isLocalHost(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

function resolveCookieDomain(): string | undefined {
    const explicit = process.env.SUPABASE_COOKIE_DOMAIN?.trim();
    if (explicit) return explicit;
    if (process.env.NODE_ENV !== "production") return undefined;

    const configuredSite =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

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

const cookieDomain = resolveCookieDomain();

// Initialize the Supabase client for client-side operations
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
        ...(cookieDomain ? { domain: cookieDomain } : {}),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    }
});
