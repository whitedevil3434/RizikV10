import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import ZinyClient from "./ziny-client";

export const metadata = {
  title: "Ziny — Personal AI | Rizik Admin",
  description: "Cortex-powered personal AI assistant with SNN memory",
};

export default function ZinyPage() {
  return (
    <OpsShell
      title="Ziny"
      subtitle=""
      activeHref="/admin/ziny"
      scopeLabel="Cortex AI"
      roleLabel="Personal Assistant"
      navItems={adminNavItems}
      fullScreen={true}
    >
      <ZinyClient />
    </OpsShell>
  );
}
