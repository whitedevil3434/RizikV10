'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RizikLogo from '@/components/brand/rizik-logo';

interface MarketingProps {
  user: unknown;
  role: string | undefined;
  canAccessPortal: boolean;
  canAccessAdmin: boolean;
  workspaceLabel: string;
}

const ecosystemLinks = [
  { href: '/', label: 'Global' },
  { href: '/b2b', label: 'B2B' },
  { href: '/subsidiaries', label: 'Subsidiaries' },
  { href: '/clink', label: 'C-Link' },
  { href: '/impact', label: 'Impact' },
];

const publicExperienceLinks = [
  { href: '/fair', label: 'Rizik Fair' },
  { href: '/community', label: 'Community' },
  { href: '/trust', label: 'Trust' },
];

const getMobileCommerceLinks = (user: unknown) => [
  { href: user ? '/account' : '/login', label: user ? 'Account' : 'Login' },
];

export function MarketingNav({ user, canAccessPortal, canAccessAdmin, workspaceLabel }: MarketingProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const isControlPlane = pathname?.startsWith('/admin') || pathname?.startsWith('/portal');

  const mobileCommerceLinks = getMobileCommerceLinks(user);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navEl = navRef.current;
    if (!navEl) return;

    const updateNavHeight = () => {
      const navHeight = navEl.offsetHeight || 0;
      document.documentElement.style.setProperty('--marketing-nav-height', `${navHeight}px`);
    };

    updateNavHeight();
    const observer = new ResizeObserver(updateNavHeight);
    observer.observe(navEl);

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    if (!mediaQuery.matches) {
      setIsMobileNavVisible(true);
      return;
    }

    let lastY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastY) < 10) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY <= 8) {
            setIsMobileNavVisible(true);
          } else if (currentY > lastY) {
            setIsMobileNavVisible(false);
          } else {
            setIsMobileNavVisible(true);
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    setIsMobileNavVisible(true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  if (isControlPlane) return null;

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-50 border-b border-[#031E49]/10 bg-[#F5F2EB]/90 backdrop-blur-md transition-transform duration-300 ease-out will-change-transform ${isMobileNavVisible ? 'translate-y-0' : '-translate-y-full'} md:translate-y-0`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <RizikLogo className="h-8 w-auto" />
          </Link>

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
              <Link href={user ? "/account" : "/login"} className="text-[#031E49]/80 hover:text-[#031E49] px-2 py-2 rounded-md text-sm font-semibold transition-colors">
                {user ? "Account" : "Login"}
              </Link>
              {canAccessPortal && (
                <Link
                  href={canAccessAdmin ? "/admin" : "/portal"}
                  className="bg-[#031E49] hover:bg-[#0A2D6C] text-[#F5F2EB] px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:-translate-y-[1px] transition-all"
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
          {canAccessPortal && (
            <div className="mt-2">
              <Link
                href={canAccessAdmin ? "/admin" : "/portal"}
                className="block w-full text-center py-2 rounded-lg bg-[#031E49] text-[#F5F2EB] text-[11px] font-bold active:scale-[0.98] transition-transform"
              >
                {workspaceLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  const pathname = usePathname();
  const isControlPlane = pathname?.startsWith('/admin') || pathname?.startsWith('/portal');

  if (isControlPlane) return null;

  return (
    <footer className="border-t border-[#031E49]/10 bg-[#031E49] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[#F5F2EB]/50 text-sm">© 2026 Rizik Global. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isControlPlane = pathname?.startsWith('/admin') || pathname?.startsWith('/portal');

  return (
    <main
      className={isControlPlane ? "min-h-screen bg-[#F9F9F9]" : "min-h-screen"}
      style={isControlPlane ? undefined : { paddingTop: "var(--marketing-nav-height, 8rem)" }}
    >
      {children}
    </main>
  );
}
