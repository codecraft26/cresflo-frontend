"use client";

import { OrganizationSessionPanel } from "@/components/advisor/organization-session-panel";
import { SuperadminPanel } from "@/components/advisor/superadmin-panel";
import {
  getOrganizationProfile,
  getSuperadminProfile,
  organizationLogin,
  superadminLogin,
} from "@/lib/api";

import { useDashboardContext } from "../context";
import { DashboardSection } from "../shell";

function DashboardAccessSection() {
  const {
    appendLog,
    backendUrl,
    connectSocket,
    isOrganizationView,
    isSubmitting,
    isSuperadminView,
    organizationEmail,
    organizationPassword,
    organizationProfile,
    organizationSession,
    setActiveRole,
    setOrganizationEmail,
    setOrganizationPassword,
    setOrganizationProfile,
    setOrganizationSession,
    setSuperadminProfile,
    setSuperadminSession,
    setSuperadminEmail,
    setSuperadminPassword,
    submitWithState,
    superadminEmail,
    superadminLogout,
    superadminPassword,
    superadminProfile,
    superadminSession,
    organizationLogout,
  } = useDashboardContext();

  return (
    <>
      {isSuperadminView ? (
        <DashboardSection description="Manage the active superadmin session used for organization operations.">
          <SuperadminPanel
            email={superadminEmail}
            password={superadminPassword}
            session={superadminSession}
            profile={superadminProfile}
            isSubmitting={isSubmitting}
            onEmailChange={setSuperadminEmail}
            onPasswordChange={setSuperadminPassword}
            onLogin={() =>
              void submitWithState(async () => {
                const session = await superadminLogin(
                  backendUrl,
                  superadminEmail,
                  superadminPassword,
                );
                setSuperadminSession(session);
                setActiveRole("superadmin");
                setSuperadminProfile(null);
                appendLog(`Superadmin logged in as ${session.user.email}`);
              })
            }
            onFetchProfile={() =>
              void submitWithState(async () => {
                if (!superadminSession) {
                  throw new Error("Login as superadmin first.");
                }

                const profile = await getSuperadminProfile(
                  backendUrl,
                  superadminSession.accessToken,
                );
                setSuperadminProfile(profile);
                appendLog("Fetched superadmin profile");
              })
            }
            onClear={superadminLogout}
          />
        </DashboardSection>
      ) : null}
      {isOrganizationView ? (
        <DashboardSection description="Manage the active organization session used to authorize advisor chat.">
          <OrganizationSessionPanel
            email={organizationEmail}
            password={organizationPassword}
            session={organizationSession}
            profile={organizationProfile}
            isSubmitting={isSubmitting}
            onEmailChange={setOrganizationEmail}
            onPasswordChange={setOrganizationPassword}
            onLogin={() =>
              void submitWithState(async () => {
                const session = await organizationLogin(
                  backendUrl,
                  organizationEmail,
                  organizationPassword,
                );

                setOrganizationSession(session);
                setActiveRole("organization");
                setOrganizationProfile(null);
                await connectSocket(session);
                appendLog(`Organization user logged in for ${session.organization.name}`);
              })
            }
            onFetchProfile={() =>
              void submitWithState(async () => {
                if (!organizationSession) {
                  throw new Error("Login as organization user first.");
                }

                const profile = await getOrganizationProfile(
                  backendUrl,
                  organizationSession.accessToken,
                );
                setOrganizationProfile(profile);
                appendLog("Fetched organization profile");
              })
            }
            onClear={organizationLogout}
          />
        </DashboardSection>
      ) : null}
    </>
  );
}

export { DashboardAccessSection };
