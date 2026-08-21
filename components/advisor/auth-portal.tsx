"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { organizationLogin, superadminLogin } from "@/lib/api";
import {
  readStoredBackendUrl,
  writeStoredOrganizationSession,
  writeStoredRole,
  writeStoredSuperadminSession,
} from "@/lib/session-storage";

const defaultBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

function AuthPortal({
  initialMode = "superadmin",
  lockedMode,
}: {
  initialMode?: "superadmin" | "organization";
  lockedMode?: "superadmin" | "organization";
}) {
  const router = useRouter();
  const [backendUrl] = useState(() => readStoredBackendUrl(defaultBackendUrl));
  const [mode, setMode] = useState<"superadmin" | "organization">(initialMode);
  const [superadminEmail, setSuperadminEmail] = useState("superadmin@cresflo.local");
  const [superadminPassword, setSuperadminPassword] = useState("change-me");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [organizationPassword, setOrganizationPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resolvedMode = lockedMode ?? mode;

  const submitSuperadminLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const session = await superadminLogin(
        backendUrl,
        superadminEmail,
        superadminPassword,
      );
      writeStoredSuperadminSession(session);
      writeStoredRole("superadmin");
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOrganizationLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const session = await organizationLogin(
        backendUrl,
        organizationEmail,
        organizationPassword,
      );
      writeStoredOrganizationSession(session);
      writeStoredRole("organization");
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f5f8]">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,#101b2d_0%,#172943_70%,#243c5d_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10 sm:px-6">
        <section className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(16,27,45,0.18)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative overflow-hidden bg-[var(--nav)] p-8 text-white sm:p-10">
            <div className="absolute -bottom-32 -right-28 h-80 w-80 rounded-full border-[60px] border-white/[0.035]" />
            <div className="relative flex h-full min-h-64 flex-col justify-between lg:min-h-[520px]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--signal)] shadow-lg shadow-black/20">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4Z" />
                    <path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold tracking-tight">Cresflo</p>
                  <p className="text-xs text-white/50">AI Advisor</p>
                </div>
              </div>

              <div className="mt-12 space-y-4 lg:mt-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Secure workspace</p>
                <h1 className="max-w-sm text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {lockedMode === "superadmin"
                    ? "Manage every organization from one place."
                    : lockedMode === "organization"
                      ? "Your lending intelligence, in context."
                      : "One workspace. Every answer in context."}
                </h1>
                <p className="max-w-sm text-sm leading-6 text-white/60">
                  {lockedMode === "superadmin"
                    ? "Create tenants, manage access, and curate the knowledge behind every answer."
                    : lockedMode === "organization"
                      ? "Ask questions, review evidence, and work with knowledge scoped to your organization."
                      : "Sign in to continue to your Cresflo workspace."}
                </p>
              </div>
              <p className="mt-10 text-xs text-white/35">Private by design · Organization scoped</p>
            </div>
          </div>

          <div className="flex items-center p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md space-y-7">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[var(--ink)]">
                  {resolvedMode === "superadmin" ? "Superadmin sign in" : "Welcome back"}
                </h2>
                <p className="text-sm leading-6 text-[var(--ink-muted)]">
                  Enter your credentials to continue.
                </p>
              </div>

              {!lockedMode ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMode("superadmin")}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      resolvedMode === "superadmin"
                        ? "border-[var(--signal)] bg-[var(--signal-soft)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    <p className="font-semibold text-[var(--ink)]">Superadmin</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("organization")}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      resolvedMode === "organization"
                        ? "border-[var(--signal)] bg-[var(--signal-soft)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    <p className="font-semibold text-[var(--ink)]">Organization user</p>
                  </button>
                </div>
              ) : null}

              {resolvedMode === "superadmin" ? (
                <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void submitSuperadminLogin(); }}>
                  <Field label="Superadmin email">
                    <Input
                      value={superadminEmail}
                      onChange={(event) => setSuperadminEmail(event.target.value)}
                    />
                  </Field>
                  <Field label="Superadmin password">
                    <Input
                      type="password"
                      value={superadminPassword}
                      onChange={(event) => setSuperadminPassword(event.target.value)}
                    />
                  </Field>
                  <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              ) : (
                <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void submitOrganizationLogin(); }}>
                  <Field label="Organization email">
                    <Input
                      value={organizationEmail}
                      onChange={(event) => setOrganizationEmail(event.target.value)}
                    />
                  </Field>
                  <Field label="Organization password">
                    <Input
                      type="password"
                      value={organizationPassword}
                      onChange={(event) => setOrganizationPassword(event.target.value)}
                    />
                  </Field>
                  <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              )}

              {errorMessage ? (
                <p role="alert" className="rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-faint)] px-4 py-3 text-sm text-[var(--danger)]">
                  {errorMessage}
                </p>
              ) : null}

              {lockedMode === "organization" ? (
                <p className="text-sm text-[var(--ink-muted)]">
                  Superadmin?{" "}
                  <Link
                    href="/superadmin/login"
                    className="font-semibold text-[var(--signal)]"
                  >
                    Use the admin login
                  </Link>
                </p>
              ) : null}
              {lockedMode === "superadmin" ? (
                <p className="text-sm text-[var(--ink-muted)]">
                  Organization user?{" "}
                  <Link href="/login" className="font-semibold text-[var(--signal)]">
                    Use the organization login
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export { AuthPortal };
