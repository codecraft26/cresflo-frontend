import { StepCard } from "@/components/advisor/step-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { OrganizationProfile, OrganizationSession } from "@/lib/types";

function OrganizationSessionPanel({
  email,
  password,
  session,
  profile,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onFetchProfile,
  onClear,
}: {
  email: string;
  password: string;
  session: OrganizationSession | null;
  profile: OrganizationProfile | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onFetchProfile: () => void;
  onClear?: () => void;
}) {
  return (
    <StepCard
      eyebrow="Organization"
      title="Workspace access"
      description={
        session
          ? "Your organization session is active. This workspace now uses your tenant and role for advisor chat."
          : "Log in as an organization user to open advisor chat for your tenant."
      }
      status={session ? "Ready" : "Pending"}
    >
      {!session ? (
        <>
          <div className="grid gap-4">
            <Field label="Organization email">
              <Input value={email} onChange={(event) => onEmailChange(event.target.value)} />
            </Field>
            <Field label="Organization password">
              <Input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isSubmitting} onClick={onLogin}>
              Login as organization user
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" disabled={isSubmitting} onClick={onFetchProfile}>
            Check organization profile
          </Button>
          {onClear ? (
            <Button variant="ghost" onClick={onClear}>
              Log out
            </Button>
          ) : null}
        </div>
      )}
      {session ? (
        <Card className="bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {session.organization.name}
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                {session.user.email} · {session.organization.slug}
              </p>
            </div>
            <Badge tone="success">{session.user.role}</Badge>
          </div>
          {profile ? (
            <div className="mt-3 grid gap-2 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              <p>User ID: {profile.userId ?? "unknown"}</p>
              <p>Tenant: {profile.tenantId ?? "unknown"}</p>
              <p>Lender: {profile.lenderId ?? "unknown"}</p>
              <p>Email: {profile.email ?? "unknown"}</p>
            </div>
          ) : null}
        </Card>
      ) : null}
    </StepCard>
  );
}

export { OrganizationSessionPanel };
