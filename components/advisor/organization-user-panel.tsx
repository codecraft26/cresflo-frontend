import { StepCard } from "@/components/advisor/step-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { OrganizationRecord, OrganizationUserRecord } from "@/lib/types";

function OrganizationUserPanel({
  organizations,
  selectedOrganizationId,
  users,
  form,
  isSubmitting,
  canManage,
  onOrganizationSelect,
  onFormChange,
  onCreateUser,
  onUseForLogin,
}: {
  organizations: OrganizationRecord[];
  selectedOrganizationId: string;
  users: OrganizationUserRecord[];
  form: {
    email: string;
    fullName: string;
    password: string;
    role: "admin" | "analyst" | "servicer";
  };
  isSubmitting: boolean;
  canManage: boolean;
  onOrganizationSelect: (organizationId: string) => void;
  onFormChange: (
    field: "email" | "fullName" | "password" | "role",
    value: string,
  ) => void;
  onCreateUser: () => void;
  onUseForLogin: (user: OrganizationUserRecord) => void;
}) {
  return (
    <StepCard
      eyebrow="Users"
      title="Manage organization users"
      description="Create organization users for the selected organization and reuse credentials for workspace login."
      status={users.length > 0 ? "Ready" : "Pending"}
    >
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-[var(--ink)]">Add a team member</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">Create credentials and assign access within an organization.</p>
          </div>
          <Field label="Organization">
            <Select value={selectedOrganizationId} onChange={(event) => onOrganizationSelect(event.target.value)}>
              <option value="">Select organization</option>
              {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Full name">
              <Input value={form.fullName} onChange={(event) => onFormChange("fullName", event.target.value)} placeholder="Jordan Lee" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(event) => onFormChange("email", event.target.value)} placeholder="jordan@company.com" />
            </Field>
            <Field label="Role">
              <Select value={form.role} onChange={(event) => onFormChange("role", event.target.value)}>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="servicer">Servicer</option>
              </Select>
            </Field>
            <Field label="Temporary password" hint="At least 8 characters">
              <Input type="password" value={form.password} onChange={(event) => onFormChange("password", event.target.value)} placeholder="Enter a secure password" />
            </Field>
          </div>
          <Button className="w-full" disabled={isSubmitting || !canManage || !selectedOrganizationId} onClick={onCreateUser}>
            {isSubmitting ? "Creating user..." : "Create user"}
          </Button>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)]">Organization members</h3>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">{users.length} users in the selected workspace</p>
            </div>
          </div>
          {users.length > 0 ? users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3.5 transition hover:border-[#cbd3de]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--panel-strong)] text-xs font-bold uppercase text-[var(--ink-soft)]">{user.fullName.slice(0, 2)}</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--ink)]">{user.fullName}</p>
                  <p className="truncate text-xs text-[var(--ink-muted)]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--panel)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--ink-soft)]">{user.role}</span>
                <Button variant="ghost" onClick={() => onUseForLogin(user)}>Use login</Button>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-12 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">No users to show</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">Select an organization or create its first team member.</p>
            </div>
          )}
        </div>
      </div>
    </StepCard>
  );
}

export { OrganizationUserPanel };
