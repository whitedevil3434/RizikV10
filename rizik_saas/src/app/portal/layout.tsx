import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/session";
import { canAccessPortalRole } from "@/lib/auth/policy";

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, role } = await getCurrentUserContext();

  if (!user) {
    redirect("/login?next=/portal");
  }

  if (!canAccessPortalRole(role)) {
    redirect("/store?error=unauthorized_portal");
  }

  return <>{children}</>;
}
