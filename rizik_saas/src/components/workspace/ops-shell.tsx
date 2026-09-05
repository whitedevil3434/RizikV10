"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  BellAlertIcon,
  Bars3Icon,
  BoltIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CpuChipIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  QrCodeIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import RizikLogo from "@/components/brand/rizik-logo";
import type { WorkspaceIconKey, WorkspaceNavItem } from "@/lib/workspace/nav";

type QuickLink = {
  href: string;
  label: string;
  tone?: "primary" | "neutral";
};

interface OpsShellProps {
  title: string;
  subtitle: string;
  activeHref: string;
  scopeLabel: string;
  roleLabel: string;
  navItems: WorkspaceNavItem[];
  quickLinks?: QuickLink[];
  fullScreen?: boolean;
  hideHeader?: boolean;
  children: ReactNode;
}

const iconMap: Record<WorkspaceIconKey, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  home: HomeIcon,
  orders: TruckIcon,
  products: CubeIcon,
  crm: ChatBubbleLeftRightIcon,
  notifications: BellAlertIcon,
  production: WrenchScrewdriverIcon,
  inventory: RectangleStackIcon,
  qr: QrCodeIcon,
  team: UserGroupIcon,
  analytics: ChartBarIcon,
  fair: BoltIcon,
  squads: UsersIcon,
  community: ChatBubbleLeftRightIcon,
  tasks: ClipboardDocumentCheckIcon,
  requests: ClipboardDocumentListIcon,
  knowledge: BookOpenIcon,
  logistics: TruckIcon,
  finance: BanknotesIcon,
  hr: UserGroupIcon,
  checkin: ClockIcon,
  report: ExclamationTriangleIcon,
  ziny: CpuChipIcon,
};


function isActivePath(activeHref: string, itemHref: string): boolean {
  if (itemHref === "/admin" || itemHref === "/portal") {
    return activeHref === itemHref;
  }
  return activeHref === itemHref || activeHref.startsWith(`${itemHref}/`);
}

export default function OpsShell({
  title,
  subtitle,
  activeHref,
  scopeLabel,
  roleLabel,
  navItems,
  quickLinks = [],
  fullScreen = false,
  hideHeader = false,
  children,
}: OpsShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const publicSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  const customerSurfaceHref = publicSiteUrl ? `${publicSiteUrl}/` : "/";

  const mobileQuickLinks = useMemo(() => {
    if (quickLinks.length > 0) return quickLinks.slice(0, 3);
    return navItems.slice(0, 3).map((item) => ({ href: item.href, label: item.label, tone: "neutral" as const }));
  }, [quickLinks, navItems]);

  return (
    <div className={`min-h-screen w-full bg-[#F5F2EB] text-[#031E49] ${fullScreen ? "h-screen overflow-hidden" : ""}`}>
      {isNavOpen && (
        <button
          aria-label="Close workspace sidebar"
          className="fixed inset-0 z-40 bg-[#031E49]/45 md:hidden"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <div className={`flex ${fullScreen ? "h-screen" : "min-h-screen"}`}>
        <aside
          className={`fixed md:static top-0 left-0 z-50 h-screen w-72 md:w-72 bg-[#031E49] text-white border-r border-white/10 transform transition-transform duration-300 ${isNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
        >
          <div className="h-full flex flex-col">
            <div className="px-5 py-6 border-b border-white/10">
              <Link href={customerSurfaceHref} className="inline-flex items-center gap-3">
                <RizikLogo tone="light" className="h-8 w-auto" />
                <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#00B16A]">{scopeLabel}</span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || Squares2X2Icon;
                const active = isActivePath(activeHref, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${active ? "bg-white/18 text-white shadow-inner" : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    onClick={() => setIsNavOpen(false)}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 ${active ? "text-[#00B16A]" : "text-white/50 group-hover:text-white/80"}`} />
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold ${active ? "text-white" : "text-white/80"}`}>{item.label}</span>
                      {item.description && (
                        <span className={`block text-[11px] ${active ? "text-white/70" : "text-white/45"}`}>{item.description}</span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 px-5 py-4">
              <p className="text-xs font-semibold text-white">{roleLabel}</p>
              <p className="text-[11px] text-white/50">Rizik internal workspace</p>
            </div>
          </div>
        </aside>

        <main className={`flex-1 md:ml-0 flex flex-col ${fullScreen ? "h-screen pb-0 overflow-hidden" : "pb-24 md:pb-8"}`}>
          {!hideHeader && (
            <div className="sticky top-0 z-30 border-b border-[#031E49]/10 bg-[#F5F2EB]/90 backdrop-blur-md">
              <div className="px-4 md:px-8 py-2.5 md:py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setIsNavOpen((v) => !v)}
                    className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg border border-[#031E49]/15 bg-white"
                    aria-label="Toggle workspace menu"
                  >
                    {isNavOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                  </button>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#031E49]/45 font-semibold truncate">{scopeLabel}</p>
                    <h1 className="text-base md:text-xl font-bold truncate">{title}</h1>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${item.tone === "primary"
                        ? "bg-[#031E49] text-white hover:bg-[#0A2D6C]"
                        : "border border-[#031E49]/15 bg-white text-[#031E49] hover:bg-[#F5F2EB]"
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={`flex-1 flex flex-col ${fullScreen ? "p-0 overflow-hidden" : "px-4 md:px-8 pt-6"}`}>
            {!fullScreen && subtitle && <p className="text-sm text-[#0A2D6C]/70 mb-6">{subtitle}</p>}
            {children}
          </div>

          {!fullScreen && (
            <div className="md:hidden fixed bottom-3 left-0 right-0 px-3 z-30">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#031E49]/15 bg-white/95 backdrop-blur p-2 shadow-lg">
                {mobileQuickLinks.map((item) => {
                  const isPrimary = item.tone === "primary";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-center py-2 rounded-lg text-xs font-bold ${isPrimary
                        ? "bg-[#031E49] text-white"
                        : "border border-[#031E49]/15 text-[#031E49]"
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
