"use client";

import { useEffect, useEffectEvent } from "react";

import { DocumentIngestionPanel } from "@/components/advisor/document-ingestion-panel";
import {
  ingestOrganizationDocument,
  ingestOrganizationPdfDocument,
  ingestOwnOrganizationDocument,
  ingestOwnOrganizationPdfDocument,
} from "@/lib/api";
import type { OrganizationSession } from "@/lib/types";

import { useDashboardContext } from "../context";
import { RoleGuard } from "../shell";

function DashboardDocumentsPage() {
  const {
    activeDocumentJob,
    appendLog,
    backendUrl,
    documentContent,
    documentFile,
    documentJobs,
    documents,
    documentLoanId,
    documentSixMonthExtensionAllowed,
    documentSummary,
    documentTitle,
    documentType,
    isSubmitting,
    isSuperadminView,
    organizationSession,
    organizations,
    refreshDocumentJobs,
    refreshOrganizationDocuments,
    refreshOwnDocumentJobs,
    refreshOwnOrganizationDocuments,
    selectedOrganizationId,
    setChatMessage,
    setDocumentContent,
    setDocumentFile,
    setDocumentLoanId,
    setDocumentSixMonthExtensionAllowed,
    setDocumentSummary,
    setDocumentTitle,
    setDocumentType,
    setSelectedOrganizationId,
    startJobPolling,
    submitWithState,
    superadminSession,
  } = useDashboardContext();

  const isOrganizationAdmin = organizationSession?.user.role === "admin";
  const isActingAsOrganizationAdmin = isOrganizationAdmin && !isSuperadminView;
  const canManageDocuments = isSuperadminView || isOrganizationAdmin;
  const availableOrganizations =
    isSuperadminView
      ? organizations
      : organizationSession
        ? [organizationSession.organization]
        : [];
  const effectiveOrganizationId =
    isSuperadminView ? selectedOrganizationId : organizationSession?.organization.id ?? "";

  const loadOrganizationAdminDocuments = useEffectEvent(
    async (session: OrganizationSession) => {
      await submitWithState(async () => {
        await refreshOwnOrganizationDocuments(session.accessToken);
        await refreshOwnDocumentJobs(session.accessToken);
        appendLog("Loaded organization admin documents");
      });
    },
  );

  useEffect(() => {
    if (!isActingAsOrganizationAdmin || !organizationSession) {
      return;
    }

    const organizationId = organizationSession.organization.id;

    if (selectedOrganizationId !== organizationId) {
      setSelectedOrganizationId(organizationId);
    }

    void loadOrganizationAdminDocuments(organizationSession);
  }, [
    isActingAsOrganizationAdmin,
    organizationSession,
    selectedOrganizationId,
    setSelectedOrganizationId,
  ]);

  const loadSuperadminOrganizationDocuments = useEffectEvent(
    async (token: string, organizationId: string) => {
      await submitWithState(async () => {
        await refreshOrganizationDocuments(token, organizationId);
        await refreshDocumentJobs(token, organizationId);
        appendLog("Loaded organization documents");
      });
    },
  );

  useEffect(() => {
    if (!isSuperadminView || !superadminSession || !selectedOrganizationId) {
      return;
    }

    void loadSuperadminOrganizationDocuments(
      superadminSession.accessToken,
      selectedOrganizationId,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperadminView, superadminSession?.accessToken, selectedOrganizationId]);

  if (!canManageDocuments) {
    return (
      <RoleGuard
        allow={false}
        title="Document ingestion is available for superadmins and organization admins."
        description="Use a superadmin session or log in as an organization admin to upload PDFs and manage RAG knowledge."
      />
    );
  }

  return (
      <DocumentIngestionPanel
        organizations={availableOrganizations}
        selectedOrganizationId={effectiveOrganizationId}
        documents={documents}
        ingestionJobs={documentJobs}
        activeJob={activeDocumentJob}
        form={{
          title: documentTitle,
          type: documentType,
          loanId: documentLoanId,
          summary: documentSummary,
          content: documentContent,
          fileName: documentFile?.name ?? "",
          sixMonthExtensionAllowed: documentSixMonthExtensionAllowed,
        }}
        isSubmitting={isSubmitting}
        canManage={canManageDocuments}
        isOrganizationLocked={isActingAsOrganizationAdmin}
        onOrganizationSelect={(organizationId) => {
          if (isActingAsOrganizationAdmin) {
            return;
          }

          setSelectedOrganizationId(organizationId);
        }}
        onFormChange={(field, value) => {
          if (field === "title") setDocumentTitle(value as string);
          if (field === "type") {
            const nextType = value as
              | "loan_agreement"
              | "policy"
              | "servicing_procedure"
              | "general";
            setDocumentType(nextType);

            if (nextType !== "loan_agreement") {
              setDocumentLoanId("");
              setDocumentSixMonthExtensionAllowed(false);
            }
          }
          if (field === "loanId") setDocumentLoanId(value as string);
          if (field === "summary") setDocumentSummary(value as string);
          if (field === "content") setDocumentContent(value as string);
          if (field === "sixMonthExtensionAllowed") {
            setDocumentSixMonthExtensionAllowed(value as boolean);
          }
        }}
        onIngest={() =>
          void submitWithState(async () => {
            if (!effectiveOrganizationId) {
              throw new Error("Choose an organization first.");
            }

            const job = isSuperadminView
              ? await ingestOrganizationDocument(
                  backendUrl,
                  superadminSession!.accessToken,
                  effectiveOrganizationId,
                  {
                    title: documentTitle,
                    type: documentType,
                    content: documentContent,
                    summary: documentSummary || undefined,
                    loanId: documentLoanId || undefined,
                    sixMonthExtensionAllowed: documentSixMonthExtensionAllowed,
                  },
                )
              : await ingestOwnOrganizationDocument(backendUrl, organizationSession!.accessToken, {
                  title: documentTitle,
                  type: documentType,
                  content: documentContent,
                  summary: documentSummary || undefined,
                  loanId: documentLoanId || undefined,
                  sixMonthExtensionAllowed: documentSixMonthExtensionAllowed,
                });

            if (isSuperadminView) {
              await refreshDocumentJobs(superadminSession!.accessToken, effectiveOrganizationId);
              startJobPolling(
                superadminSession!.accessToken,
                effectiveOrganizationId,
                job.id,
                "superadmin",
              );
            } else {
              await refreshOwnDocumentJobs(organizationSession!.accessToken);
              startJobPolling(
                organizationSession!.accessToken,
                effectiveOrganizationId,
                job.id,
                "organization",
              );
            }
            setChatMessage(
              documentLoanId
                ? `Does the ${documentTitle || job.title} document for loan ${documentLoanId} allow a six-month extension?`
                : `What do our organization documents say about ${documentTitle || job.title}?`,
            );
            appendLog(`Queued document ingestion for ${job.title}`);
          })
        }
        onIngestPdf={() =>
          void submitWithState(async () => {
            if (!effectiveOrganizationId) {
              throw new Error("Choose an organization first.");
            }

            if (!documentFile) {
              throw new Error("Choose a PDF file first.");
            }

            const job = isSuperadminView
              ? await ingestOrganizationPdfDocument(
                  backendUrl,
                  superadminSession!.accessToken,
                  effectiveOrganizationId,
                  {
                    file: documentFile,
                    title: documentTitle || undefined,
                    type: documentType,
                    summary: documentSummary || undefined,
                    loanId: documentLoanId || undefined,
                    sixMonthExtensionAllowed: documentSixMonthExtensionAllowed,
                  },
                )
              : await ingestOwnOrganizationPdfDocument(
                  backendUrl,
                  organizationSession!.accessToken,
                  {
                    file: documentFile,
                    title: documentTitle || undefined,
                    type: documentType,
                    summary: documentSummary || undefined,
                    loanId: documentLoanId || undefined,
                    sixMonthExtensionAllowed: documentSixMonthExtensionAllowed,
                  },
                );

            if (isSuperadminView) {
              await refreshDocumentJobs(superadminSession!.accessToken, effectiveOrganizationId);
              startJobPolling(
                superadminSession!.accessToken,
                effectiveOrganizationId,
                job.id,
                "superadmin",
              );
            } else {
              await refreshOwnDocumentJobs(organizationSession!.accessToken);
              startJobPolling(
                organizationSession!.accessToken,
                effectiveOrganizationId,
                job.id,
                "organization",
              );
            }
            setDocumentFile(null);
            setChatMessage(
              documentLoanId
                ? `Does the ${documentTitle || job.title} document for loan ${documentLoanId} allow a six-month extension?`
                : `What do our organization documents say about ${documentTitle || job.title}?`,
            );
            appendLog(`Queued PDF ingestion for ${job.title}`);
          })
        }
        onRefresh={() =>
          void submitWithState(async () => {
            if (!effectiveOrganizationId) {
              throw new Error("Choose an organization first.");
            }

            if (isSuperadminView) {
              await refreshOrganizationDocuments(
                superadminSession!.accessToken,
                effectiveOrganizationId,
              );
              await refreshDocumentJobs(superadminSession!.accessToken, effectiveOrganizationId);
            } else {
              await refreshOwnOrganizationDocuments(organizationSession!.accessToken);
              await refreshOwnDocumentJobs(organizationSession!.accessToken);
            }
            appendLog("Refreshed organization documents");
          })
        }
        onApplyPromptFromDocument={(document) => {
          setChatMessage(
            document.loanId
              ? `Does the ${document.title} document for loan ${document.loanId} allow a six-month extension?`
              : `What do our organization documents say about ${document.title}?`,
          );
          appendLog(`Prepared advisor prompt from ${document.title}`);
        }}
        onPdfSelect={setDocumentFile}
      />
  );
}

export { DashboardDocumentsPage };
