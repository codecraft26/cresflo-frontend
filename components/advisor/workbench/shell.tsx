"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import type { PropsWithChildren, ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import type { DashboardRole } from "@/lib/session-storage";

import { sectionConfig, useDashboardContext, type DashboardSectionKey } from "./context";

function DashboardSection({
  description,
  children,
}: PropsWithChildren<{
  description?: string;
}>) {
  return (
    <section className="space-y-5">
      {description ? (
        <p className="max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">{description}</p>
      ) : null}
      {children}
    </section>
  );
}

function DashboardSidebar() {
  const {
    isSuperadminView,
    organizationLogout,
    organizationSession,
    superadminLogout,
    superadminSession,
  } = useDashboardContext();
  const activeSection = (useSelectedLayoutSegment() ?? "overview") as DashboardSectionKey;
  const isOrganizationAdmin = organizationSession?.user.role === "admin";

  const sidebarItems: DashboardSectionKey[] = isSuperadminView
    ? ["overview", "access", "organizations", "users", "documents", "diagnostics"]
    : isOrganizationAdmin
      ? ["overview", "advisor-chat", "documents", "access", "diagnostics"]
      : ["overview", "advisor-chat", "access", "diagnostics"];

  const identity = isSuperadminView
    ? superadminSession?.user.email
    : organizationSession?.organization.name;

  return (
    <aside className="bg-[var(--nav)] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 lg:h-20">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--signal)] text-white shadow-lg shadow-black/20">
          <Icon name="spark" className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold tracking-tight">Cresflo</p>
          <p className="text-[11px] text-white/50">AI Advisor</p>
        </div>
      </div>

      <div className="overflow-x-auto px-3 py-3 lg:flex lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-6">
        <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 lg:block">
          Workspace
        </p>
        <nav className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item;
            const config = sectionConfig[item];

            return (
              <Link
                key={item}
                href={`/dashboard/${item}`}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${
                  isActive
                    ? "bg-white text-[var(--nav)] shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon
                  name={config.icon as IconName}
                  className={`h-[18px] w-[18px] ${isActive ? "text-[var(--signal)]" : "text-white/45 group-hover:text-white/75"}`}
                />
                {config.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden border-t border-white/10 p-4 lg:block">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white">
            {(identity ?? "U").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{identity ?? "Signed in"}</p>
            <p className="mt-0.5 text-[10px] capitalize text-white/45">
              {isSuperadminView ? "Superadmin" : organizationSession?.user.role ?? "User"}
            </p>
          </div>
          <button
            type="button"
            onClick={isSuperadminView ? superadminLogout : organizationLogout}
            aria-label="Log out"
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardHeader() {
  const {
    isAuthenticated,
    isOrganizationView,
    isSuperadminView,
    superadminSession,
    organizationSession,
    setActiveRole,
  } = useDashboardContext();
  const router = useRouter();
  const activeSection = (useSelectedLayoutSegment() ?? "overview") as DashboardSectionKey;
  const page = sectionConfig[activeSection] ?? sectionConfig.overview;

  const goToRoleHome = (role: DashboardRole) => {
    setActiveRole(role);
    router.push("/dashboard/overview");
  };

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-white px-4 sm:px-6 lg:min-h-20 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[var(--ink)]">{page.title}</p>
        <p className="hidden text-xs text-[var(--ink-muted)] sm:block">{page.description}</p>
      </div>
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            API connected
          </span>
          <div className="hidden h-6 w-px bg-[var(--line)] sm:block" />
          <div className="text-right">
            <p className="text-xs font-semibold text-[var(--ink)]">
              {isSuperadminView ? "Superadmin" : organizationSession?.user.fullName ?? "Organization user"}
            </p>
            <p className="text-[10px] text-[var(--ink-muted)]">
              {isSuperadminView ? "Platform workspace" : organizationSession?.organization.name}
            </p>
          </div>
          {superadminSession && organizationSession ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => goToRoleHome("superadmin")}
                className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                  isSuperadminView
                    ? "bg-[var(--nav)] text-white"
                    : "border border-[var(--line)] bg-white text-[var(--ink)]"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => goToRoleHome("organization")}
                className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                  isOrganizationView
                    ? "bg-[var(--nav)] text-white"
                    : "border border-[var(--line)] bg-white text-[var(--ink)]"
                }`}
              >
                Organization
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function DashboardUnauthenticatedState() {
  return (
    <Card className="bg-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--signal)]">
            Authentication required
          </p>
          <h2 className="text-2xl font-semibold text-[var(--ink)]">
            This dashboard only becomes actionable after login.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Go through the login page first, then return here as either a superadmin or an
            organization user.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--ink)] px-4 text-sm font-semibold text-[var(--paper)] shadow-[0_12px_30px_rgba(22,34,51,0.2)] transition hover:bg-[var(--ink-strong)]"
        >
          Open login
        </Link>
      </div>
    </Card>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { errorMessage, isAuthenticated } = useDashboardContext();

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {isAuthenticated ? <DashboardSidebar /> : null}
      <div className={isAuthenticated ? "lg:pl-64" : "flex min-h-screen flex-col"}>
        <DashboardHeader />
        <div
          className={
            isAuthenticated
              ? "mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
              : "mx-auto flex w-full max-w-[1500px] flex-1 items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          }
        >
          {!isAuthenticated ? <DashboardUnauthenticatedState /> : null}
          {isAuthenticated ? (
            <main className="min-w-0">
              {errorMessage ? (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </div>
              ) : null}
              {children}
            </main>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoleGuard({
  allow,
  title,
  description,
}: {
  allow: boolean;
  title: string;
  description: string;
}) {
  if (allow) {
    return null;
  }

  return (
    <Card className="bg-white">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--signal)]">
          Route unavailable
        </p>
        <h2 className="text-2xl font-semibold text-[var(--ink)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--ink-muted)]">{description}</p>
      </div>
    </Card>
  );
}

export { DashboardSection, DashboardShell, RoleGuard };
