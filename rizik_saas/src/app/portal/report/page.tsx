import { getCurrentUserContext } from "@/lib/auth/session";
import { getFilteredNavItems, portalNavItems } from "@/lib/workspace/nav";
import ReportClient from "./ReportClient";

export default async function PortalReportPage() {
    const { role } = await getCurrentUserContext();
    const navItems = getFilteredNavItems(role, portalNavItems);

    return <ReportClient navItems={navItems} />;
}
