import { StepCard } from "@/components/advisor/step-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  OrganizationDocumentIngestionJobRecord,
  OrganizationDocumentRecord,
  OrganizationRecord,
} from "@/lib/types";

function DocumentIngestionPanel({
  organizations,
  selectedOrganizationId,
  documents,
  ingestionJobs,
  activeJob,
  form,
  isSubmitting,
  canManage,
  onOrganizationSelect,
  onFormChange,
  onIngest,
  onIngestPdf,
  onRefresh,
  onApplyPromptFromDocument,
  onPdfSelect,
}: {
  organizations: OrganizationRecord[];
  selectedOrganizationId: string;
  documents: OrganizationDocumentRecord[];
  ingestionJobs: OrganizationDocumentIngestionJobRecord[];
  activeJob: OrganizationDocumentIngestionJobRecord | null;
  form: {
    title: string;
    type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
    loanId: string;
    summary: string;
    content: string;
    fileName: string;
    sixMonthExtensionAllowed: boolean;
  };
  isSubmitting: boolean;
  canManage: boolean;
  onOrganizationSelect: (organizationId: string) => void;
  onFormChange: (
    field:
      | "title"
      | "type"
      | "loanId"
      | "summary"
      | "content"
      | "sixMonthExtensionAllowed",
    value: string | boolean,
  ) => void;
  onIngest: () => void;
  onIngestPdf: () => void;
  onRefresh: () => void;
  onApplyPromptFromDocument: (document: OrganizationDocumentRecord) => void;
  onPdfSelect: (file: File | null) => void;
}) {
  const activeProgress = activeJob?.progressPercentage ?? 0;

  return (
    <StepCard
      eyebrow="Documents"
      title="Organization knowledge"
      description="Upload organization-scoped policy, procedure, or agreement content for retrieval in advisor chat."
      status={documents.length > 0 ? "Ready" : "Pending"}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Organization">
          <Select
            value={selectedOrganizationId}
            onChange={(event) => onOrganizationSelect(event.target.value)}
          >
            <option value="">Select organization</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Document type">
          <Select
            value={form.type}
            onChange={(event) => onFormChange("type", event.target.value)}
          >
            <option value="policy">policy</option>
            <option value="servicing_procedure">servicing_procedure</option>
            <option value="loan_agreement">loan_agreement</option>
            <option value="general">general</option>
          </Select>
        </Field>
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(event) => onFormChange("title", event.target.value)}
            placeholder="Lending policy - renewals"
          />
        </Field>
        <Field label="Loan ID (optional)">
          <Input
            value={form.loanId}
            onChange={(event) => onFormChange("loanId", event.target.value)}
            placeholder="loan-123 if this is loan specific"
          />
        </Field>
      </div>
      <div className="grid gap-4">
        <Field label="Summary (optional)">
          <Textarea
            value={form.summary}
            onChange={(event) => onFormChange("summary", event.target.value)}
            placeholder="Short summary used in retrieval previews."
            className="min-h-24"
          />
        </Field>
        <Field label="Document content">
          <Textarea
            value={form.content}
            onChange={(event) => onFormChange("content", event.target.value)}
            placeholder="Paste the document text here for indexing."
            className="min-h-48"
          />
        </Field>
        <Field label="PDF upload" hint="Text-based PDFs work best. Scanned files require OCR support.">
          <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#cbd3de] bg-[var(--panel)] px-4 py-5 transition hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--signal)] shadow-sm ring-1 ring-[var(--line)]">
              <Icon name="document" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                {form.fileName || "Choose a PDF file"}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                {form.fileName ? "Ready to upload" : "Click to browse from your computer"}
              </span>
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => onPdfSelect(event.target.files?.[0] ?? null)}
            />
          </label>
        </Field>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium text-[var(--ink-soft)]">
        <input
          type="checkbox"
          checked={form.sixMonthExtensionAllowed}
          onChange={(event) =>
            onFormChange("sixMonthExtensionAllowed", event.target.checked)
          }
          className="h-4 w-4 rounded border-[var(--line)]"
        />
        Mark six-month extension as allowed
      </label>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={isSubmitting || !canManage || !selectedOrganizationId}
          onClick={onIngest}
        >
          Ingest text document
        </Button>
        <Button
          variant="secondary"
          disabled={isSubmitting || !canManage || !selectedOrganizationId || !form.fileName}
          onClick={onIngestPdf}
        >
          Upload PDF
        </Button>
        <Button
          variant="ghost"
          disabled={isSubmitting || !canManage || !selectedOrganizationId}
          onClick={onRefresh}
        >
          Refresh documents
        </Button>
      </div>
      {activeJob ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--ink)]">
                Ingestion in progress: {activeJob.title}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {activeJob.sourceKind.toUpperCase()} · {activeJob.status} ·{" "}
                {activeJob.statusMessage}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--signal)]">
              {activeProgress}%
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-[var(--signal)] transition-all duration-300"
              style={{ width: `${activeProgress}%` }}
            />
          </div>
          {activeJob.errorMessage ? (
            <p className="mt-3 text-sm text-[var(--danger)]">{activeJob.errorMessage}</p>
          ) : null}
        </div>
      ) : null}
      {ingestionJobs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Recent ingestion jobs
            </p>
          </div>
          {ingestionJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{job.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {job.type} · {job.sourceKind.toUpperCase()} · {job.status}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--signal)]">
                  {job.progressPercentage}%
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {job.statusMessage}
              </p>
              {job.errorMessage ? (
                <p className="mt-2 text-sm text-[var(--danger)]">{job.errorMessage}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {documents.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--ink)]">Knowledge library</p>
            <span className="text-xs text-[var(--ink-muted)]">{documents.length} documents</span>
          </div>
          {documents.map((document) => (
            <div
              key={document.id}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-4 transition hover:border-[#cbd3de] hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{document.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {document.type}
                    {document.loanId ? ` · loan ${document.loanId}` : " · organization level"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => onApplyPromptFromDocument(document)}
                >
                  Ask advisor
                </Button>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {document.summary}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-9 text-center">
          <p className="text-sm font-semibold text-[var(--ink)]">No knowledge indexed yet</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Upload a PDF or paste document text to build this organization&apos;s knowledge base.</p>
        </div>
      )}
    </StepCard>
  );
}

export { DocumentIngestionPanel };
