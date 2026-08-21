"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";

import { useDashboardContext } from "../context";
import { DashboardSection } from "../shell";

function DashboardOverviewPage() {
  const {
    completedJobsCount,
    connectionState,
    conversation,
    documents,
    isSuperadminView,
    lastProvider,
    organizationSession,
    organizations,
    organizationUsers,
    selectedOrganization,
  } = useDashboardContext();

  const metrics: Array<{
    label: string;
    value: string | number;
    detail: string;
    icon: IconName;
    href: string;
  }> = isSuperadminView
    ? [
        { label: "Organizations", value: organizations.length, detail: selectedOrganization ? `Managing ${selectedOrganization.name}` : "Select a workspace", icon: "building", href: "/dashboard/organizations" },
        { label: "Users", value: organizationUsers.length, detail: "In the selected organization", icon: "users", href: "/dashboard/users" },
        { label: "Knowledge", value: documents.length, detail: "Documents ready for retrieval", icon: "document", href: "/dashboard/documents" },
        { label: "Ingestions", value: completedJobsCount, detail: "Successfully completed", icon: "activity", href: "/dashboard/documents" },
      ]
    : [
        { label: "Organization", value: organizationSession?.organization.name ?? "Not connected", detail: "Current tenant workspace", icon: "building", href: "/dashboard/access" },
        { label: "Connection", value: connectionState, detail: "Live advisor streaming", icon: "activity", href: "/dashboard/advisor-chat" },
        { label: "Conversation", value: conversation ? "Active" : "Not started", detail: "Current advisor thread", icon: "chat", href: "/dashboard/advisor-chat" },
        { label: "AI provider", value: lastProvider ?? "Pending", detail: "Most recent response", icon: "spark", href: "/dashboard/advisor-chat" },
      ];

  return (
    <DashboardSection
      description={
        isSuperadminView
          ? "A quick summary of the organizations, users, and knowledge currently loaded in this dashboard."
          : "A quick summary of your organization session, chat connection, and active workspace state."
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href} className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_1px_2px_rgba(16,27,45,0.04)] transition hover:-translate-y-0.5 hover:border-[#cbd3de] hover:shadow-[0_8px_24px_rgba(16,27,45,0.08)]">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel)] text-[var(--ink-soft)] group-hover:bg-[var(--signal-soft)] group-hover:text-[var(--signal)]">
                <Icon name={metric.icon} className="h-5 w-5" />
              </span>
              <Icon name="chevron" className="h-4 w-4 text-[#b5bdc9] transition group-hover:translate-x-0.5 group-hover:text-[var(--signal)]" />
            </div>
            <p className="mt-5 text-xs font-semibold text-[var(--ink-muted)]">{metric.label}</p>
            <p className="mt-1 truncate text-2xl font-bold text-[var(--ink)]">{metric.value}</p>
            <p className="mt-2 truncate text-xs text-[var(--ink-muted)]">{metric.detail}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h3 className="text-sm font-bold text-[var(--ink)]">Get started</h3>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">Continue with the most useful next action.</p>
          </div>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-3">
            {(isSuperadminView
              ? [
                  ["Create an organization", "Set up a new lender workspace", "/dashboard/organizations", "building"],
                  ["Invite a user", "Provision organization access", "/dashboard/users", "users"],
                  ["Add knowledge", "Upload a policy or agreement", "/dashboard/documents", "document"],
                ]
              : [
                  ["Ask the advisor", "Start a grounded conversation", "/dashboard/advisor-chat", "chat"],
                  ["Review access", "Check your workspace profile", "/dashboard/access", "key"],
                  ["View activity", "Inspect connection events", "/dashboard/diagnostics", "activity"],
                ]
            ).map(([label, detail, href, icon]) => (
              <Link key={label} href={href} className="group bg-white p-5 transition hover:bg-[var(--panel)]">
                <Icon name={icon as IconName} className="h-5 w-5 text-[var(--signal)]" />
                <p className="mt-4 text-sm font-semibold text-[var(--ink)]">{label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{detail}</p>
              </Link>
            ))}
          </div>
        </Card>
        <Card className="bg-[var(--nav)] text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Workspace status</p>
          <p className="mt-4 text-lg font-bold">Everything is ready</p>
          <p className="mt-2 text-sm leading-6 text-white/55">Your session is active and the dashboard is connected to the backend.</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Operational</div>
        </Card>
      </div>
    </DashboardSection>
  );
}

export { DashboardOverviewPage };
