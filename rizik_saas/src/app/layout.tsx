import type { Metadata } from 'next';
import Link from 'next/link';
import RizikLogo from '@/components/brand/rizik-logo';
import { getCurrentUserContext } from '@/lib/auth/session';
import { canAccessAdminRole, canAccessPortalRole } from '@/lib/auth/policy';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rizik Global | Engineering the Future of Eco-Tech & Food Safety',
  description: 'Rizik Global is the holding company for Rizik EcoMat, Rizik BioShield, and enterprise supply operations.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await getCurrentUserContext();
  const canAccessPortal = canAccessPortalRole(role);
  const canAccessAdmin = canAccessAdminRole(role);
  const workspaceLabel = canAccessAdmin ? "Admin ERP" : role === "B2B_BUYER" ? "B2B Portal" : "Employee Portal";

  const ecosystemLinks = [
    { href: '/', label: 'Global' },
    { href: '/b2b', label: 'B2B' },
    { href: '/subsidiaries', label: 'Subsidiaries' },
    { href: '/impact', label: 'Impact' },
  ];

  const publicExperienceLinks = [
    { href: '/fair', label: 'Rizik Fair' },
    { href: '/community', label: 'Community' },
    { href: '/trust', label: 'Trust' },
  ];

  const mobileCommerceLinks = [
    { href: '/store', label: 'Store' },
    { href: '/cart', label: 'Cart' },
    { href: user ? '/account' : '/login', label: user ? 'Account' : 'Login' },
  ];

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[var(--color-brand-background)] text-[var(--color-brand-primary)]">
        {/* Navigation Bar - Corporate Level */}
        <nav className="fixed w-full z-50 border-b border-[#031E49]/10 bg-[#F5F2EB]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 gap-4">
              {/* Brand Logo */}
              <Link href="/" className="flex-shrink-0 flex items-center gap-3">
                <RizikLogo className="h-8 w-auto" />
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center rounded-full border border-[#031E49]/10 bg-white/70 p-1">
                  {ecosystemLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-[#031E49]/80 hover:text-[#031E49] hover:bg-[#031E49]/5 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  {publicExperienceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-[#031E49]/80 hover:text-[#031E49] px-2 py-2 rounded-md text-sm font-semibold transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link href="/store" className="text-[#031E49]/80 hover:text-[#031E49] px-2 py-2 rounded-md text-sm font-semibold transition-colors">E-Commerce</Link>
                  <Link href="/bio-shield" className="text-[#031E49]/80 hover:text-[#031E49] px-2 py-2 rounded-md text-sm font-semibold transition-colors">Bio-Shield R&D</Link>
                  <Link href="/cart" className="text-[#031E49]/80 hover:text-[#031E49] px-2 py-2 rounded-md text-sm font-semibold transition-colors">
                    <svg className="w-5 h-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    Cart
                  </Link>
                  <Link href={user ? "/account" : "/login"} className="text-[#031E49]/80 hover:text-[#031E49] px-2 py-2 rounded-md text-sm font-semibold transition-colors">
                    {user ? "Account" : "Login"}
                  </Link>
                  {canAccessPortal && (
                    <Link
                      href={canAccessAdmin ? "/admin" : "/portal"}
                      className="bg-[#031E49] hover:bg-[#0A2D6C] text-[#F5F2EB] px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all"
                    >
                      {workspaceLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Ecosystem Switcher */}
            <div className="md:hidden pb-3">
              <div className="grid grid-cols-4 gap-2">
                {ecosystemLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-center py-2 rounded-lg bg-white border border-[#031E49]/10 text-[11px] font-semibold text-[#031E49]/80"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {publicExperienceLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-center py-2 rounded-lg bg-white border border-[#031E49]/10 text-[11px] font-semibold text-[#031E49]/80"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {mobileCommerceLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-center py-2 rounded-lg bg-white border border-[#031E49]/10 text-[11px] font-semibold text-[#031E49]/85"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              {canAccessPortal ? (
                <div className="mt-2">
                  <Link
                    href={canAccessAdmin ? "/admin" : "/portal"}
                    className="block w-full text-center py-2 rounded-lg bg-[#031E49] text-[#F5F2EB] text-[11px] font-bold"
                  >
                    {workspaceLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-32 md:pt-20 min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#031E49]/10 bg-[#031E49] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[#F5F2EB]/50 text-sm">© 2026 Rizik Global. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
