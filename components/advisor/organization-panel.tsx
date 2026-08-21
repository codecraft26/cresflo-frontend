import { StepCard } from "@/components/advisor/step-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { OrganizationRecord } from "@/lib/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

function OrganizationPanel({
  organizations,
  selectedOrganizationId,
  form,
  isSubmitting,
  canManage,
  onFormChange,
  onCreate,
  onRefresh,
  onSelect,
}: {
  organizations: OrganizationRecord[];
  selectedOrganizationId: string;
  form: {
    name: string;
    slug: string;
    lenderId: string;
    overdueDaysThreshold: string;
    highRiskScoreThreshold: string;
  };
  isSubmitting: boolean;
  canManage: boolean;
  onFormChange: (field: keyof OrganizationPanelProps["form"], value: string) => void;
  onCreate: () => void;
  onRefresh: () => void;
  onSelect: (organizationId: string) => void;
}) {
  const selectedOrganization =
    organizations.find((organization) => organization.id === selectedOrganizationId) ?? null;

  return (
    <StepCard
      eyebrow="Organizations"
      title="Organization control center"
      description="Create lender workspaces, keep thresholds consistent, and switch into the tenant you want to manage next."
      status={organizations.length > 0 ? "Ready" : "Pending"}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
        <Card className="bg-white">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--signal)]">
                  New workspace
                </p>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[var(--ink)]">
                    Create a new organization
                  </h3>
                  <p className="text-sm leading-6 text-[var(--ink-muted)]">
                    Set the tenant identity and the default risk thresholds your advisor flows
                    should use.
                  </p>
                </div>
              </div>
              <Badge tone={canManage ? "success" : "neutral"}>
                {canManage ? "Ready to create" : "Login required"}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Organization name">
                <Input
                  value={form.name}
                  onChange={(event) => onFormChange("name", event.target.value)}
                  placeholder="Northbridge Capital"
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(event) => onFormChange("slug", event.target.value)}
                  placeholder="northbridge-capital"
                />
              </Field>
              <Field label="Lender ID">
                <Input
                  value={form.lenderId}
                  onChange={(event) => onFormChange("lenderId", event.target.value)}
                  placeholder="lender-northbridge"
                />
              </Field>
              <Field label="Overdue days threshold">
                <Input
                  value={form.overdueDaysThreshold}
                  onChange={(event) => onFormChange("overdueDaysThreshold", event.target.value)}
                  placeholder="30"
                />
              </Field>
              <Field label="High risk score threshold">
                <Input
                  value={form.highRiskScoreThreshold}
                  onChange={(event) => onFormChange("highRiskScoreThreshold", event.target.value)}
                  placeholder="75"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Total orgs
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {organizations.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Overdue rule
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {form.overdueDaysThreshold || "--"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Risk rule
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {form.highRiskScoreThreshold || "--"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button disabled={isSubmitting || !canManage} onClick={onCreate}>
                Create organization
              </Button>
              <Button
                variant="secondary"
                disabled={isSubmitting || !canManage}
                onClick={onRefresh}
              >
                Refresh organizations
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--signal)]">
                  Tenant directory
                </p>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[var(--ink)]">
                    Browse and select organizations
                  </h3>
                  <p className="text-sm leading-6 text-[var(--ink-muted)]">
                    Pick an organization to load its users, documents, and downstream admin tools.
                  </p>
                </div>
              </div>
              {selectedOrganization ? (
                <Badge tone="warning">Selected</Badge>
              ) : (
                <Badge tone="neutral">No selection</Badge>
              )}
            </div>

            {selectedOrganization ? (
              <div className="rounded-[24px] border border-[rgba(224,106,92,0.22)] bg-[linear-gradient(135deg,rgba(224,106,92,0.12),rgba(255,255,255,0.88))] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-[var(--ink)]">
                      {selectedOrganization.name}
                    </p>
                    <p className="text-sm text-[var(--ink-muted)]">
                      {selectedOrganization.slug} · {selectedOrganization.lenderId}
                    </p>
                  </div>
                  <Badge
                    tone={selectedOrganization.status === "active" ? "success" : "neutral"}
                  >
                    {selectedOrganization.status}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Created
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {formatDate(selectedOrganization.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Updated
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {formatDate(selectedOrganization.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {organizations.length > 0 ? (
              <div className="grid gap-3">
                {organizations.map((organization) => {
                  const isSelected = selectedOrganizationId === organization.id;

                  return (
                    <button
                      key={organization.id}
                      type="button"
                      onClick={() => onSelect(organization.id)}
                      className={`group rounded-[24px] border p-4 text-left transition ${
                        isSelected
                          ? "border-[rgba(224,106,92,0.32)] bg-[rgba(224,106,92,0.12)] shadow-[0_18px_40px_rgba(224,106,92,0.12)]"
                          : "border-[var(--line)] bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] hover:border-[rgba(224,106,92,0.28)] hover:shadow-[0_14px_28px_rgba(25,44,71,0.08)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--ink)]">{organization.name}</p>
                          <p className="text-sm text-[var(--ink-muted)]">
                            {organization.slug} · {organization.lenderId}
                          </p>
                        </div>
                        <Badge tone={organization.status === "active" ? "success" : "neutral"}>
                          {organization.status}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
                        <p>Created {formatDate(organization.createdAt)}</p>
                        <p
                          className={`font-semibold transition ${
                            isSelected
                              ? "text-[var(--ink)]"
                              : "text-[var(--signal)] group-hover:text-[var(--ink)]"
                          }`}
                        >
                          {isSelected ? "Currently selected" : "Open workspace"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-10 text-center">
                <p className="text-lg font-semibold text-[var(--ink)]">No organizations yet</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
                  Create the first organization from the form on the left to start provisioning
                  users and documents.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </StepCard>
  );
}

type OrganizationPanelProps = Parameters<typeof OrganizationPanel>[0];

export { OrganizationPanel };
