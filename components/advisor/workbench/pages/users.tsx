"use client";

import { OrganizationUserPanel } from "@/components/advisor/organization-user-panel";
import { createOrganizationUser } from "@/lib/api";

import { useDashboardContext } from "../context";
import { DashboardSection, RoleGuard } from "../shell";

function DashboardUsersPage() {
  const {
    appendLog,
    backendUrl,
    isSubmitting,
    isSuperadminView,
    newUserEmail,
    newUserName,
    newUserPassword,
    newUserRole,
    organizationUsers,
    organizations,
    refreshDocumentJobs,
    refreshOrganizationDocuments,
    refreshOrganizationUsers,
    selectedOrganizationId,
    setNewUserEmail,
    setNewUserName,
    setNewUserPassword,
    setNewUserRole,
    setOrganizationEmail,
    setOrganizationPassword,
    setSelectedOrganizationId,
    submitWithState,
    superadminSession,
  } = useDashboardContext();

  if (!isSuperadminView) {
    return (
      <RoleGuard
        allow={false}
        title="User management lives in the superadmin workspace."
        description="Switch to the superadmin view to provision organization admins, analysts, and servicers."
      />
    );
  }

  return (
    <DashboardSection description="Provision organization users and prepare credentials for workspace validation.">
      <OrganizationUserPanel
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        users={organizationUsers}
        form={{
          email: newUserEmail,
          fullName: newUserName,
          password: newUserPassword,
          role: newUserRole,
        }}
        isSubmitting={isSubmitting}
        canManage={Boolean(superadminSession)}
        onOrganizationSelect={(organizationId) => {
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
        onFormChange={(field, value) => {
          if (field === "email") setNewUserEmail(value);
          if (field === "fullName") setNewUserName(value);
          if (field === "password") setNewUserPassword(value);
          if (field === "role") {
            setNewUserRole(value as "admin" | "analyst" | "servicer");
          }
        }}
        onCreateUser={() =>
          void submitWithState(async () => {
            if (!superadminSession || !selectedOrganizationId) {
              throw new Error("Choose an organization first.");
            }

            const user = await createOrganizationUser(
              backendUrl,
              superadminSession.accessToken,
              selectedOrganizationId,
              {
                email: newUserEmail,
                fullName: newUserName,
                password: newUserPassword,
                role: newUserRole,
              },
            );

            setOrganizationEmail(user.email);
            setOrganizationPassword(newUserPassword);
            await refreshOrganizationUsers(superadminSession.accessToken, selectedOrganizationId);
            appendLog(`Created organization user ${user.email}`);
          })
        }
        onUseForLogin={(user) => {
          setOrganizationEmail(user.email);
          appendLog(`Loaded ${user.email} into org login form`);
        }}
      />
    </DashboardSection>
  );
}

export { DashboardUsersPage };
