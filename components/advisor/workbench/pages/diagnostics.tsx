"use client";

import { RunLogPanel } from "@/components/advisor/run-log-panel";
import { Card } from "@/components/ui/card";

import { useDashboardContext } from "../context";
import { DashboardSection } from "../shell";

function DashboardDiagnosticsPage() {
  const {
    activityLog,
    errorMessage,
    isSuperadminView,
    organizationSession,
  } = useDashboardContext();

  return (
    <DashboardSection description="Keep an eye on request flow, errors, and runtime activity while you exercise the dashboard.">
      {isSuperadminView && !organizationSession ? (
        <Card className="bg-white">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--signal)]">
              Organization access
            </p>
            <h2 className="text-2xl font-semibold text-[var(--ink)]">
              Log in as an organization user to validate chat behavior.
            </h2>
            <p className="text-sm leading-6 text-[var(--ink-muted)]">
              After superadmin creates an organization user, use those credentials here to
              open the advisor workspace and verify tenant-scoped answers.
            </p>
          </div>
        </Card>
      ) : null}

      <RunLogPanel errorMessage={errorMessage} activityLog={activityLog} />
    </DashboardSection>
  );
}

export { DashboardDiagnosticsPage };
