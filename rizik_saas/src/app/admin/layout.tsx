import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/session";
import { canAccessAdminRole } from "@/lib/auth/policy";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, role } = await getCurrentUserContext();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!canAccessAdminRole(role)) {
    redirect("/?error=unauthorized_admin");
  }

  return <>{children}</>;
}
