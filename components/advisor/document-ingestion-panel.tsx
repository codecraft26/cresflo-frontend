import { useMemo, useState } from "react";

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

const documentTypeFilters = [
  { value: "all", label: "All types" },
  { value: "policy", label: "policy" },
  { value: "servicing_procedure", label: "servicing_procedure" },
  { value: "loan_agreement", label: "loan_agreement" },
  { value: "general", label: "general" },
] as const;

function DocumentIngestionPanel({
  organizations,
  selectedOrganizationId,
  documents,
  ingestionJobs,
  activeJob,
  form,
  isSubmitting,
  canManage,
  isOrganizationLocked,
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
  isOrganizationLocked: boolean;
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
  const isLoanAgreement = form.type === "loan_agreement";

  const [documentSearch, setDocumentSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] =
    useState<(typeof documentTypeFilters)[number]["value"]>("all");

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = documentSearch.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesType =
        documentTypeFilter === "all" || document.type === documentTypeFilter;
      const matchesQuery =
        !normalizedQuery ||
        document.title.toLowerCase().includes(normalizedQuery) ||
        document.summary.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [documents, documentSearch, documentTypeFilter]);

  return (
    <StepCard
      eyebrow="Documents"
      title="Organization knowledge"
      description="Upload organization-scoped policy, procedure, or agreement content for retrieval in advisor chat."
      status={documents.length > 0 ? "Ready" : "Pending"}
      compact
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Organization">
          <Select
            className="h-9 rounded-lg px-3 text-xs"
            value={selectedOrganizationId}
            disabled={isOrganizationLocked}
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
            className="h-9 rounded-lg px-3 text-xs"
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
            className="h-9 rounded-lg px-3 text-xs"
            value={form.title}
            onChange={(event) => onFormChange("title", event.target.value)}
            placeholder="Lending policy - renewals"
          />
        </Field>
        {isLoanAgreement ? (
          <Field
            label="Loan ID (optional)"
            hint="Leave blank to index this agreement at organization level."
          >
            <Input
              className="h-9 rounded-lg px-3 text-xs"
              value={form.loanId}
              onChange={(event) => onFormChange("loanId", event.target.value)}
              placeholder="Enter an existing loan ID"
            />
          </Field>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Summary (optional)">
          <Textarea
            value={form.summary}
            onChange={(event) => onFormChange("summary", event.target.value)}
            placeholder="Short summary used in retrieval previews."
            className="min-h-20 rounded-lg px-3 py-2 text-xs leading-5"
          />
        </Field>
        <Field label="Document content">
          <Textarea
            value={form.content}
            onChange={(event) => onFormChange("content", event.target.value)}
            placeholder="Paste the document text here for indexing."
            className="min-h-20 rounded-lg px-3 py-2 text-xs leading-5"
          />
        </Field>
        <Field label="PDF upload" hint="Text-based PDFs work best. Scanned files require OCR support.">
          <label className="group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#cbd3de] bg-[var(--panel)] px-3 py-3 transition hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--signal)] shadow-sm ring-1 ring-[var(--line)]">
              <Icon name="document" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-[var(--ink)]">
                {form.fileName || "Choose a PDF file"}
              </span>
              <span className="mt-0.5 block text-[10px] text-[var(--ink-muted)]">
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
      {isLoanAgreement ? (
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
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          className="h-8 rounded-lg px-3 text-xs"
          disabled={isSubmitting || !canManage || !selectedOrganizationId}
          onClick={onIngest}
        >
          Ingest text document
        </Button>
        <Button
          className="h-8 rounded-lg px-3 text-xs"
          variant="secondary"
          disabled={isSubmitting || !canManage || !selectedOrganizationId || !form.fileName}
          onClick={onIngestPdf}
        >
          Upload PDF
        </Button>
        <Button
          className="h-8 rounded-lg px-3 text-xs"
          variant="ghost"
          disabled={isSubmitting || !canManage || !selectedOrganizationId}
          onClick={onRefresh}
        >
          Refresh documents
        </Button>
      </div>
      {activeJob ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                Ingestion in progress: {activeJob.title}
              </p>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                {activeJob.sourceKind.toUpperCase()} · {activeJob.status} ·{" "}
                {activeJob.statusMessage}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--signal)]">
              {activeProgress}%
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
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
      <div className="grid gap-3 lg:grid-cols-2">
      {ingestionJobs.length > 0 ? (
        <div className={`space-y-3 ${documents.length === 0 ? "lg:col-span-2" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Recent ingestion jobs
            </p>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {ingestionJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{job.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                    {job.type} · {job.sourceKind.toUpperCase()} · {job.status}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--signal)]">
                  {job.progressPercentage}%
                </p>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-[var(--ink-soft)]">
                {job.statusMessage}
              </p>
              {job.errorMessage ? (
                <p className="mt-2 text-sm text-[var(--danger)]">{job.errorMessage}</p>
              ) : null}
            </div>
          ))}
          </div>
        </div>
      ) : null}
      {documents.length > 0 ? (
        <div className={`space-y-3 ${ingestionJobs.length === 0 ? "lg:col-span-2" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--ink)]">Knowledge library</p>
            <span className="text-xs text-[var(--ink-muted)]">
              {filteredDocuments.length === documents.length
                ? `${documents.length} documents`
                : `${filteredDocuments.length} of ${documents.length} documents`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Icon
                name="search"
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-muted)]"
              />
              <Input
                className="h-8 rounded-lg pl-8 pr-3 text-xs"
                value={documentSearch}
                onChange={(event) => setDocumentSearch(event.target.value)}
                placeholder="Search title or summary"
              />
            </div>
            <Select
              className="h-8 w-auto min-w-[160px] rounded-lg px-2.5 text-xs"
              value={documentTypeFilter}
              onChange={(event) =>
                setDocumentTypeFilter(
                  event.target.value as (typeof documentTypeFilters)[number]["value"],
                )
              }
            >
              {documentTypeFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          {filteredDocuments.length > 0 ? (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 transition hover:border-[#cbd3de] hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">{document.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                      {document.type}
                      {document.loanId ? ` · loan ${document.loanId}` : " · organization level"}
                    </p>
                  </div>
                  <Button
                    className="h-8 rounded-lg px-2.5 text-xs"
                    variant="ghost"
                    onClick={() => onApplyPromptFromDocument(document)}
                  >
                    Ask advisor
                  </Button>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--ink-soft)]">
                  {document.summary}
                </p>
              </div>
            ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">No documents match your filters</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">Try a different search term or document type.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-6 text-center ${ingestionJobs.length === 0 ? "lg:col-span-2" : ""}`}>
          <p className="text-sm font-semibold text-[var(--ink)]">No knowledge indexed yet</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Upload a PDF or paste document text to build this organization&apos;s knowledge base.</p>
        </div>
      )}
      </div>
    </StepCard>
  );
}

export { DocumentIngestionPanel };
