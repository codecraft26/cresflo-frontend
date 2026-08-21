"use client";

import type { PropsWithChildren } from "react";

import { DashboardProvider, type DashboardSectionKey } from "./context";
import { DashboardShell } from "./shell";

function DashboardRouteLayout({
  activeSection,
  children,
}: PropsWithChildren<{
  activeSection: DashboardSectionKey;
}>) {
  return (
    <DashboardProvider activeSection={activeSection}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}

export { DashboardRouteLayout };
