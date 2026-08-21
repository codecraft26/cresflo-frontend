import { StepCard } from "@/components/advisor/step-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SuperadminProfile, SuperadminSession } from "@/lib/types";

function SuperadminPanel({
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
  session: SuperadminSession | null;
  profile: SuperadminProfile | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onFetchProfile: () => void;
  onClear: () => void;
}) {
  return (
    <StepCard
      eyebrow="Superadmin"
      title="Admin access"
      description={
        session
          ? "Your superadmin session is active. Use it to manage organizations, users, and organization-level documents."
          : "Authenticate as superadmin to unlock organization management."
      }
      status={session ? "Ready" : "Pending"}
    >
      {!session ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <Input value={email} onChange={(event) => onEmailChange(event.target.value)} />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isSubmitting} onClick={onLogin}>
              Login as superadmin
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" disabled={isSubmitting} onClick={onFetchProfile}>
            Check profile
          </Button>
          <Button variant="ghost" onClick={onClear}>
              Log out
          </Button>
        </div>
      )}
      {session ? (
        <Card className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">{session.user.email}</p>
              <p className="text-xs text-[var(--ink-muted)]">
                Token TTL: {session.expiresInSeconds} seconds
              </p>
            </div>
            <Badge tone="success">{session.user.role}</Badge>
          </div>
          {profile ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Verified profile: {profile.email ?? "unknown"} · {profile.role ?? "unknown"}
            </p>
          ) : null}
        </Card>
      ) : null}
    </StepCard>
  );
}

export { SuperadminPanel };
