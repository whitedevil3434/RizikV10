import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthSurfacePath, isControlPlanePath } from "@/lib/auth/policy";

function hasSupabaseAuthCookie(request: NextRequest): boolean {
    return request.cookies
        .getAll()
        .some((cookie) => cookie.name.includes("auth-token") && cookie.name.startsWith("sb-"));
}

function normalizeHost(hostname: string): string {
    return hostname.trim().toLowerCase();
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search;
    const isControlPlane = isControlPlanePath(pathname);

    const opsHost = process.env.OPS_HOSTNAME ? normalizeHost(process.env.OPS_HOSTNAME) : "";
    const currentHost = normalizeHost(request.headers.get("host") || "");
    const isOpsHost = Boolean(opsHost) && currentHost.split(":")[0] === opsHost.split(":")[0];

    // Optional host-level split: keep admin/portal under a dedicated ops hostname.
    if (isControlPlane && opsHost && !isOpsHost) {
        const opsUrl = request.nextUrl.clone();
        opsUrl.host = opsHost;
        return NextResponse.redirect(opsUrl);
    }

    // Dedicated ops host should stay focused on control-plane routes.
    if (opsHost && isOpsHost && !isControlPlane && !isAuthSurfacePath(pathname) && pathname !== "/account") {
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = "/admin";
        adminUrl.search = "";
        return NextResponse.redirect(adminUrl);
    }

    // Early auth gate for admin/portal paths. Role checks are handled in route layouts.
    if (isControlPlane && !hasSupabaseAuthCookie(request)) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
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
