import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthSurfacePath, isControlPlanePath } from "@/lib/auth/policy";
import { updateSession } from "@/lib/supabase/middleware";

function normalizeHost(hostname: string): string {
    return hostname.trim().toLowerCase();
}

function resolveHostFromSiteUrl(siteUrl: string | undefined): string {
    if (!siteUrl) return "";
    try {
        return normalizeHost(new URL(siteUrl).host);
    } catch {
        return "";
    }
}

function cloneSetCookies(from: NextResponse, to: NextResponse): NextResponse {
    from.cookies.getAll().forEach((cookie) => {
        to.cookies.set(cookie.name, cookie.value, cookie);
    });
    return to;
}

function loginRedirect(request: NextRequest, pathname: string, search: string, sessionResponse: NextResponse): NextResponse {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return cloneSetCookies(sessionResponse, NextResponse.redirect(loginUrl));
}

export async function middleware(request: NextRequest) {
    const currentHost = normalizeHost(request.headers.get("host") || "");
    const hostnameOnly = currentHost.split(":")[0];

    const { response: sessionResponse, userId } = await updateSession(request);

    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search;
    const isControlPlane = isControlPlanePath(pathname);
    const isWriterPath = pathname.startsWith("/writer");
    const isAccountPath = pathname.startsWith("/account");
    const requiresAuth = isControlPlane || isWriterPath || isAccountPath;
    const isAuthenticated = Boolean(userId);
    const canonicalHost = resolveHostFromSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

    // Redirect ghost subdomain to the integrated writer route
    if (hostnameOnly.startsWith("ghost.")) {
        const writerUrl = request.nextUrl.clone();
        writerUrl.pathname = "/writer";
        return cloneSetCookies(sessionResponse, NextResponse.redirect(writerUrl));
    }

    // Canonical host enforcement: avoid auth/session split across .pages.dev vs production domain.
    if (
        canonicalHost &&
        currentHost !== canonicalHost &&
        hostnameOnly.endsWith(".pages.dev") &&
        !hostnameOnly.includes("localhost")
    ) {
        const canonicalUrl = request.nextUrl.clone();
        canonicalUrl.host = canonicalHost;
        return cloneSetCookies(sessionResponse, NextResponse.redirect(canonicalUrl));
    }

    const opsHost = process.env.OPS_HOSTNAME ? normalizeHost(process.env.OPS_HOSTNAME) : "";
    const isOpsHost = Boolean(opsHost) && hostnameOnly === opsHost.split(":")[0];

    // Optional host-level split: keep admin/portal under a dedicated ops hostname.
    if (isControlPlane && opsHost && !isOpsHost) {
        const opsUrl = request.nextUrl.clone();
        opsUrl.host = opsHost;
        return cloneSetCookies(sessionResponse, NextResponse.redirect(opsUrl));
    }

    // Dedicated ops host should stay focused on control-plane routes.
    // If user visits customer surfaces on ops host, move them to public host (same path) when configured.
    if (opsHost && isOpsHost && !isControlPlane && !isAuthSurfacePath(pathname) && pathname !== "/account") {
        if (canonicalHost && canonicalHost !== opsHost) {
            const publicUrl = request.nextUrl.clone();
            publicUrl.host = canonicalHost;
            return cloneSetCookies(sessionResponse, NextResponse.redirect(publicUrl));
        }

        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = "/admin";
        adminUrl.search = "";
        return cloneSetCookies(sessionResponse, NextResponse.redirect(adminUrl));
    }

    // Early auth gate for admin/portal/writer/account paths. Role checks remain in route layouts.
    if (requiresAuth && !isAuthenticated) {
        return loginRedirect(request, pathname, search, sessionResponse);
    }

    return sessionResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - rizik-logo.svg
         * - rizik-mark.svg
         */
        "/((?!api|_next/static|_next/image|favicon.ico|rizik-logo.svg|rizik-mark.svg).*)",
    ],
};
