"use client";

import { OrganizationPanel } from "@/components/advisor/organization-panel";
import { createOrganization } from "@/lib/api";

import { useDashboardContext } from "../context";
import { DashboardSection, RoleGuard } from "../shell";

function DashboardOrganizationsPage() {
  const {
    backendUrl,
    activeRole,
    appendLog,
    isSubmitting,
    isSuperadminView,
    organizationLenderId,
    organizationName,
    organizations,
    organizationSlug,
    overdueDaysThreshold,
    highRiskScoreThreshold,
    refreshDocumentJobs,
    refreshOrganizationDocuments,
    refreshOrganizationUsers,
    refreshOrganizations,
    selectedOrganizationId,
    setHighRiskScoreThreshold,
    setOrganizationLenderId,
    setOrganizationName,
    setOrganizationSlug,
    setOverdueDaysThreshold,
    setSelectedOrganizationId,
    submitWithState,
    superadminSession,
  } = useDashboardContext();

  if (!isSuperadminView) {
    return (
      <RoleGuard
        allow={false}
        title="Organizations are managed from the superadmin view."
        description="Switch to the superadmin workspace to create organizations, refresh the list, and select the tenant you want to work on."
      />
    );
  }

  void activeRole;

  return (
    <DashboardSection description="Create organizations, refresh the list, and select the one you want to work on.">
      <OrganizationPanel
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        form={{
          name: organizationName,
          slug: organizationSlug,
          lenderId: organizationLenderId,
          overdueDaysThreshold,
          highRiskScoreThreshold,
        }}
        isSubmitting={isSubmitting}
        canManage={Boolean(superadminSession)}
        onFormChange={(field, value) => {
          if (field === "name") setOrganizationName(value);
          if (field === "slug") setOrganizationSlug(value);
          if (field === "lenderId") setOrganizationLenderId(value);
          if (field === "overdueDaysThreshold") setOverdueDaysThreshold(value);
          if (field === "highRiskScoreThreshold") setHighRiskScoreThreshold(value);
        }}
        onCreate={() =>
          void submitWithState(async () => {
            if (!superadminSession) {
              throw new Error("Login as superadmin first.");
            }

            const organization = await createOrganization(
              backendUrl,
              superadminSession.accessToken,
              {
                name: organizationName,
                slug: organizationSlug,
                lenderId: organizationLenderId,
                overdueDaysThreshold: Number(overdueDaysThreshold),
                highRiskScoreThreshold: Number(highRiskScoreThreshold),
              },
            );

            await refreshOrganizations(superadminSession.accessToken);
            setSelectedOrganizationId(organization.id);
            appendLog(`Created organization ${organization.name}`);
          })
        }
        onRefresh={() =>
          void submitWithState(async () => {
            if (!superadminSession) {
              throw new Error("Login as superadmin first.");
            }

            await refreshOrganizations(superadminSession.accessToken);
            appendLog("Refreshed organizations");
          })
        }
        onSelect={(organizationId) => {
          setSelectedOrganizationId(organizationId);

          if (superadminSession && organizationId) {
            void submitWithState(async () => {
              await refreshOrganizationUsers(superadminSession.accessToken, organizationId);
              await refreshOrganizationDocuments(superadminSession.accessToken, organizationId);
              await refreshDocumentJobs(superadminSession.accessToken, organizationId);
              appendLog("Loaded organization users");
            });
          }
        }}
      />
    </DashboardSection>
  );
}

export { DashboardOrganizationsPage };
