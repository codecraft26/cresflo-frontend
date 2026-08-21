import type { ReactNode } from "react";

import { DashboardRouteLayout } from "@/components/advisor/workbench";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardRouteLayout activeSection="overview">{children}</DashboardRouteLayout>;
}
