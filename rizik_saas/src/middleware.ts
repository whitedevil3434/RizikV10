// filepath: /Users/sabbir/RizikV10/rizik_saas/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a placeholder for Supabase Auth Middleware
// It ensures that /admin routes are protected and /portal is routed based on RBAC

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // We will integrate Supabase SSR auth here.
    // For now, this is the architectural structure showing the BRAC-style separation.

    const isPublicRoute =
        path === '/' ||
        path === '/store' ||
        path.startsWith('/mats') ||
        path.startsWith('/bio-shield') ||
        path.startsWith('/verify'); // The QR scanning route

    const isAdminRoute = path.startsWith('/admin');
    const isPortalRoute = path.startsWith('/portal'); // B2B Specific

    // Example Logic (to be replaced with actual Supabase JWT check)
    // const token = request.cookies.get('sb-access-token');
    // const userRole = request.cookies.get('rzk-user-role')?.value || 'GUEST';

    // *** DEVELOPMENT OVERRIDE FOR UI TESTING ***
    // Bypassing strict auth checks so we can see the /admin and /portal pages

    /*
    if (isAdminRoute && userRole !== 'SUPER_ADMIN' && userRole !== 'LOGISTICS_MANAGER' && userRole !== 'PRODUCTION_MANAGER') {
        // Redirect unauthorized users trying to access ERP
        return NextResponse.redirect(new URL('/login?error=Unauthorized_ERP_Access', request.url));
    }

    if (isPortalRoute && userRole !== 'B2B_BUYER' && userRole !== 'SUPER_ADMIN') {
        // Redirect basic B2C customers away from the B2B wholesale board
        return NextResponse.redirect(new URL('/store', request.url));
    }
    */

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
         */
        '/((?!api|_next/static|_next/image|favicon.ico|rizik-logo.svg).*)',
    ],
}
