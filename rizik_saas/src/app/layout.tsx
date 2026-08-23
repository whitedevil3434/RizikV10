import type { Metadata } from 'next';
import { getCurrentUserContext } from '@/lib/auth/session';
import { canAccessAdminRole, canAccessPortalRole } from '@/lib/auth/policy';
import { 
  MarketingNav, 
  MarketingFooter, 
  MainLayoutWrapper 
} from '@/components/layout/MarketingLayoutComponents';
import './globals.css';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Rizik Global | Engineering the Future of Eco-Tech & Food Safety',
  description: 'Rizik Global is the holding company for enterprise manufacturing, packaging, and supply operations.',
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

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[var(--color-brand-background)] text-[var(--color-brand-primary)]">
        
        {/* Conditional Global Marketing Navbar */}
        <MarketingNav 
          user={user} 
          role={role} 
          canAccessPortal={canAccessPortal} 
          canAccessAdmin={canAccessAdmin} 
          workspaceLabel={workspaceLabel} 
        />

        {/* Outer conditional wrapper for public pages */}
        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>

        {/* Conditional Global Marketing Footer */}
        <MarketingFooter />

      </body>
    </html>
  );
}
