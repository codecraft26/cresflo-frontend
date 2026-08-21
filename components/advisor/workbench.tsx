"use client";

import Link from "next/link";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";

import { AdvisorChatPanel } from "@/components/advisor/advisor-chat-panel";
import { DocumentIngestionPanel } from "@/components/advisor/document-ingestion-panel";
import { OrganizationPanel } from "@/components/advisor/organization-panel";
import { OrganizationSessionPanel } from "@/components/advisor/organization-session-panel";
import { OrganizationUserPanel } from "@/components/advisor/organization-user-panel";
import { RunLogPanel } from "@/components/advisor/run-log-panel";
import { SuperadminPanel } from "@/components/advisor/superadmin-panel";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  createOrganization,
  createOrganizationUser,
  getOrganizationDocumentIngestionJob,
  getOwnOrganizationDocumentIngestionJob,
  getOrganizationProfile,
  getSuperadminProfile,
  ingestOrganizationDocument,
  ingestOrganizationPdfDocument,
  ingestOwnOrganizationDocument,
  ingestOwnOrganizationPdfDocument,
  listOrganizationDocumentIngestionJobs,
  listOrganizationDocuments,
  listOrganizations,
  listOrganizationUsers,
  listOwnOrganizationDocumentIngestionJobs,
  listOwnOrganizationDocuments,
  organizationLogin,
  superadminLogin,
} from "@/lib/api";
import {
  clearStoredOrganizationSession,
  clearStoredRole,
  clearStoredSuperadminSession,
  readStoredBackendUrl,
  readStoredOrganizationSession,
  readStoredRole,
  readStoredSuperadminSession,
  writeStoredOrganizationSession,
  writeStoredRole,
  writeStoredSuperadminSession,
  type DashboardRole,
} from "@/lib/session-storage";
import type {
  AdvisorAnswer,
  AdvisorConversation,
  AdvisorSocketEvent,
  OrganizationDocumentIngestionJobRecord,
  OrganizationDocumentRecord,
  OrganizationProfile,
  OrganizationRecord,
  OrganizationSession,
  OrganizationUserRecord,
  SuperadminProfile,
  SuperadminSession,
} from "@/lib/types";

const defaultBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const sectionConfig = {
  overview: {
    label: "Overview",
    title: "Overview",
    description: "Workspace performance at a glance",
    icon: "grid",
  },
  access: {
    label: "Access",
    title: "Access",
    description: "Session and profile settings",
    icon: "key",
  },
  organizations: {
    label: "Organizations",
    title: "Organizations",
    description: "Manage lender workspaces",
    icon: "building",
  },
  users: {
    label: "Users",
    title: "Users",
    description: "Provision organization access",
    icon: "users",
  },
  documents: {
    label: "Documents",
    title: "Documents",
    description: "Manage retrieval knowledge",
    icon: "document",
  },
  "advisor-chat": {
    label: "Advisor Chat",
    title: "Advisor Chat",
    description: "Ask questions with grounded context",
    icon: "chat",
  },
  diagnostics: {
    label: "Diagnostics",
    title: "Diagnostics",
    description: "Review system activity",
    icon: "activity",
  },
} as const;

type DashboardSectionKey = keyof typeof sectionConfig;

type DashboardContextValue = {
  backendUrl: string;
  activeRole: DashboardRole | null;
  activeSection: DashboardSectionKey;
  isAuthenticated: boolean;
  isOrganizationView: boolean;
  isSuperadminView: boolean;
  superadminEmail: string;
  superadminPassword: string;
  superadminSession: SuperadminSession | null;
  superadminProfile: SuperadminProfile | null;
  organizations: OrganizationRecord[];
  selectedOrganizationId: string;
  organizationUsers: OrganizationUserRecord[];
  organizationSession: OrganizationSession | null;
  organizationProfile: OrganizationProfile | null;
  documents: OrganizationDocumentRecord[];
  documentJobs: OrganizationDocumentIngestionJobRecord[];
  activeDocumentJob: OrganizationDocumentIngestionJobRecord | null;
  organizationEmail: string;
  organizationPassword: string;
  organizationName: string;
  organizationSlug: string;
  organizationLenderId: string;
  overdueDaysThreshold: string;
  highRiskScoreThreshold: string;
  newUserEmail: string;
  newUserName: string;
  newUserPassword: string;
  newUserRole: "admin" | "analyst" | "servicer";
  documentTitle: string;
  documentType: "loan_agreement" | "policy" | "servicing_procedure" | "general";
  documentLoanId: string;
  documentSummary: string;
  documentContent: string;
  documentFile: File | null;
  documentSixMonthExtensionAllowed: boolean;
  conversation: AdvisorConversation | null;
  chatMessage: string;
  streamedAnswer: string;
  lastAnswer: AdvisorAnswer | null;
  lastProvider: string | null;
  connectionState: string;
  activityLog: string[];
  isSubmitting: boolean;
  errorMessage: string;
  selectedOrganization: OrganizationRecord | undefined;
  completedJobsCount: number;
  setSuperadminEmail: (value: string) => void;
  setSuperadminPassword: (value: string) => void;
  setSuperadminSession: (value: SuperadminSession | null) => void;
  setSuperadminProfile: (value: SuperadminProfile | null) => void;
  setOrganizationEmail: (value: string) => void;
  setOrganizationPassword: (value: string) => void;
  setOrganizationSession: (value: OrganizationSession | null) => void;
  setOrganizationProfile: (value: OrganizationProfile | null) => void;
  setOrganizationName: (value: string) => void;
  setOrganizationSlug: (value: string) => void;
  setOrganizationLenderId: (value: string) => void;
  setOverdueDaysThreshold: (value: string) => void;
  setHighRiskScoreThreshold: (value: string) => void;
  setNewUserEmail: (value: string) => void;
  setNewUserName: (value: string) => void;
  setNewUserPassword: (value: string) => void;
  setNewUserRole: (value: "admin" | "analyst" | "servicer") => void;
  setDocumentTitle: (value: string) => void;
  setDocumentType: (
    value: "loan_agreement" | "policy" | "servicing_procedure" | "general",
  ) => void;
  setDocumentLoanId: (value: string) => void;
  setDocumentSummary: (value: string) => void;
  setDocumentContent: (value: string) => void;
  setDocumentFile: (value: File | null) => void;
  setDocumentSixMonthExtensionAllowed: (value: boolean) => void;
  setChatMessage: (value: string) => void;
  setStreamedAnswer: (value: string) => void;
  setLastAnswer: (value: AdvisorAnswer | null) => void;
  setActiveRole: (role: DashboardRole | null) => void;
  setSelectedOrganizationId: (value: string) => void;
  submitWithState: (work: () => Promise<void>) => Promise<void>;
  appendLog: (message: string) => void;
  superadminLogout: () => void;
  organizationLogout: () => void;
  refreshOrganizations: (token: string) => Promise<OrganizationRecord[]>;
  refreshOrganizationUsers: (token: string, organizationId: string) => Promise<void>;
  refreshOrganizationDocuments: (token: string, organizationId: string) => Promise<void>;
  refreshDocumentJobs: (token: string, organizationId: string) => Promise<void>;
  refreshOwnOrganizationDocuments: (token: string) => Promise<void>;
  refreshOwnDocumentJobs: (token: string) => Promise<void>;
  startJobPolling: (
    token: string,
    organizationId: string,
    jobId: string,
    scope?: "superadmin" | "organization",
  ) => void;
  connectSocket: (session: OrganizationSession) => Promise<void>;
  sendSocketMessage: (payload: Record<string, unknown>) => void;
  setErrorMessage: (message: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("Dashboard context is not available.");
  }

  return context;
}

function DashboardSection({
  title,
  description,
  children,
}: PropsWithChildren<{
  title: string;
  description: string;
}>) {
  return (
    <section className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold text-[var(--ink)] sm:text-[28px]">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function DashboardProvider({
  activeSection,
  children,
}: PropsWithChildren<{
  activeSection: DashboardSectionKey;
}>) {
  const [backendUrl] = useState(() => readStoredBackendUrl(defaultBackendUrl));
  const [activeRole, setActiveRole] = useState<DashboardRole | null>(() =>
    readStoredRole(),
  );
  const [superadminEmail, setSuperadminEmail] = useState("superadmin@cresflo.local");
  const [superadminPassword, setSuperadminPassword] = useState("change-me");
  const [superadminSession, setSuperadminSession] = useState<SuperadminSession | null>(
    () => readStoredSuperadminSession(),
  );
  const [superadminProfile, setSuperadminProfile] = useState<SuperadminProfile | null>(
    null,
  );
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUserRecord[]>([]);
  const [organizationSession, setOrganizationSession] =
    useState<OrganizationSession | null>(() => readStoredOrganizationSession());
  const [organizationProfile, setOrganizationProfile] =
    useState<OrganizationProfile | null>(null);
  const [documents, setDocuments] = useState<OrganizationDocumentRecord[]>([]);
  const [documentJobs, setDocumentJobs] = useState<OrganizationDocumentIngestionJobRecord[]>(
    [],
  );
  const [activeDocumentJob, setActiveDocumentJob] =
    useState<OrganizationDocumentIngestionJobRecord | null>(null);
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [organizationPassword, setOrganizationPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [organizationLenderId, setOrganizationLenderId] = useState("");
  const [overdueDaysThreshold, setOverdueDaysThreshold] = useState("30");
  const [highRiskScoreThreshold, setHighRiskScoreThreshold] = useState("75");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "analyst" | "servicer">(
    "admin",
  );
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentType, setDocumentType] = useState<
    "loan_agreement" | "policy" | "servicing_procedure" | "general"
  >("policy");
  const [documentLoanId, setDocumentLoanId] = useState("");
  const [documentSummary, setDocumentSummary] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentSixMonthExtensionAllowed, setDocumentSixMonthExtensionAllowed] =
    useState(false);
  const [conversation, setConversation] = useState<AdvisorConversation | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [lastAnswer, setLastAnswer] = useState<AdvisorAnswer | null>(null);
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState("Disconnected");
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const ingestionPollerRef = useRef<number | null>(null);

  const appendLog = (message: string) => {
    startTransition(() => {
      setActivityLog((current) => [
        `${new Date().toLocaleTimeString()}  ${message}`,
        ...current,
      ].slice(0, 14));
    });
  };

  const refreshOrganizations = async (token: string) => {
    const items = await listOrganizations(backendUrl, token);
    setOrganizations(items);
    if (!selectedOrganizationId && items[0]) {
      setSelectedOrganizationId(items[0].id);
    }
    return items;
  };

  const refreshOrganizationUsers = async (token: string, organizationId: string) => {
    const items = await listOrganizationUsers(backendUrl, token, organizationId);
    setOrganizationUsers(items);
  };

  const refreshOrganizationDocuments = async (token: string, organizationId: string) => {
    const items = await listOrganizationDocuments(backendUrl, token, organizationId);
    setDocuments(items);
  };

  const refreshDocumentJobs = async (token: string, organizationId: string) => {
    const items = await listOrganizationDocumentIngestionJobs(
      backendUrl,
      token,
      organizationId,
    );
    setDocumentJobs(items);
    setActiveDocumentJob((current) => {
      if (!current) {
        return (
          items.find((item) => item.status !== "completed" && item.status !== "failed") ?? null
        );
      }

      return items.find((item) => item.id === current.id) ?? null;
    });
  };

  const refreshOwnOrganizationDocuments = async (token: string) => {
    const items = await listOwnOrganizationDocuments(backendUrl, token);
    setDocuments(items);
  };

  const refreshOwnDocumentJobs = async (token: string) => {
    const items = await listOwnOrganizationDocumentIngestionJobs(backendUrl, token);
    setDocumentJobs(items);
    setActiveDocumentJob((current) => {
      if (!current) {
        return (
          items.find((item) => item.status !== "completed" && item.status !== "failed") ?? null
        );
      }

      return items.find((item) => item.id === current.id) ?? null;
    });
  };

  const stopJobPolling = () => {
    if (ingestionPollerRef.current !== null) {
      window.clearInterval(ingestionPollerRef.current);
      ingestionPollerRef.current = null;
    }
  };

  const startJobPolling = (
    token: string,
    organizationId: string,
    jobId: string,
    scope: "superadmin" | "organization" = "superadmin",
  ) => {
    stopJobPolling();

    const poll = async () => {
      const job =
        scope === "superadmin"
          ? await getOrganizationDocumentIngestionJob(
              backendUrl,
              token,
              organizationId,
              jobId,
            )
          : await getOwnOrganizationDocumentIngestionJob(backendUrl, token, jobId);

      setActiveDocumentJob(job);
      setDocumentJobs((current) => {
        const next = [job, ...current.filter((item) => item.id !== job.id)];
        return next.slice(0, 8);
      });

      if (job.status === "completed") {
        stopJobPolling();
        if (scope === "superadmin") {
          await refreshOrganizationDocuments(token, organizationId);
          await refreshDocumentJobs(token, organizationId);
        } else {
          await refreshOwnOrganizationDocuments(token);
          await refreshOwnDocumentJobs(token);
        }
        appendLog(`Document ingestion completed for ${job.title}`);
      }

      if (job.status === "failed") {
        stopJobPolling();
        if (scope === "superadmin") {
          await refreshDocumentJobs(token, organizationId);
        } else {
          await refreshOwnDocumentJobs(token);
        }
        appendLog(`Document ingestion failed for ${job.title}`);
      }
    };

    void poll();

    ingestionPollerRef.current = window.setInterval(() => {
      void poll();
    }, 1500);
  };

  const submitWithState = async (work: () => Promise<void>) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await work();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocketEvent = (event: AdvisorSocketEvent) => {
    switch (event.type) {
      case "connected":
        setConnectionState("Connected");
        appendLog(`Socket connected for ${event.user.email}`);
        break;
      case "conversation_created":
        setConversation(event.conversation);
        setStreamedAnswer("");
        appendLog(`Conversation ${event.conversation.id} created`);
        break;
      case "conversation_loaded":
        setConversation(event.conversation);
        appendLog(`Conversation ${event.conversation.id} loaded`);
        break;
      case "planning_started":
        setStreamedAnswer("");
        appendLog(`Planning started for ${event.conversationId}`);
        break;
      case "plan_ready":
        appendLog(`Planner chose ${event.planKind}`);
        break;
      case "message_chunk":
        setStreamedAnswer((current) => current + event.chunk);
        break;
      case "message_complete":
        setConversation(event.conversation);
        setStreamedAnswer(event.answer.summary);
        setLastAnswer(event.answer);
        setLastProvider(event.provider);
        appendLog(`Completed message with ${event.provider}`);
        break;
      case "error":
        setErrorMessage(event.message);
        appendLog(`Socket error: ${event.message}`);
        break;
    }
  };

  const connectSocket = async (session: OrganizationSession) => {
    socketRef.current?.close();

    const wsUrl = backendUrl.replace("http://", "ws://").replace("https://", "wss://");
    const socket = new WebSocket(
      `${wsUrl}/ws/advisor?token=${encodeURIComponent(session.accessToken)}`,
    );

    setConnectionState("Connecting");
    socketRef.current = socket;

    socket.onopen = () => {
      appendLog("WebSocket opened");
    };

    socket.onmessage = (messageEvent) => {
      const payload = JSON.parse(messageEvent.data) as AdvisorSocketEvent;
      handleSocketEvent(payload);
    };

    socket.onclose = () => {
      setConnectionState("Disconnected");
      appendLog("WebSocket closed");
    };

    socket.onerror = () => {
      setConnectionState("Error");
      setErrorMessage("WebSocket connection failed.");
    };
  };

  const sendSocketMessage = (payload: Record<string, unknown>) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected.");
    }

    socket.send(JSON.stringify(payload));
  };

  useEffect(() => {
    return () => {
      stopJobPolling();
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (superadminSession) {
      writeStoredSuperadminSession(superadminSession);
    } else {
      clearStoredSuperadminSession();
    }
  }, [superadminSession]);

  useEffect(() => {
    if (organizationSession) {
      writeStoredOrganizationSession(organizationSession);
    } else {
      clearStoredOrganizationSession();
    }
  }, [organizationSession]);

  useEffect(() => {
    if (activeRole) {
      writeStoredRole(activeRole);
    } else {
      clearStoredRole();
    }
  }, [activeRole]);

  useEffect(() => {
    if (!superadminSession) {
      return;
    }

    queueMicrotask(() => {
      void (async () => {
        try {
          const items = await refreshOrganizations(superadminSession.accessToken);
          if (selectedOrganizationId) {
            await refreshOrganizationUsers(
              superadminSession.accessToken,
              selectedOrganizationId,
            );
            await refreshOrganizationDocuments(
              superadminSession.accessToken,
              selectedOrganizationId,
            );
            await refreshDocumentJobs(
              superadminSession.accessToken,
              selectedOrganizationId,
            );
          } else if (items[0]) {
            setSelectedOrganizationId(items[0].id);
            await refreshOrganizationUsers(superadminSession.accessToken, items[0].id);
            await refreshOrganizationDocuments(superadminSession.accessToken, items[0].id);
            await refreshDocumentJobs(superadminSession.accessToken, items[0].id);
          }
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not restore superadmin dashboard.",
          );
        }
      })();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [superadminSession?.accessToken]);

  useEffect(() => {
    if (!organizationSession) {
      return;
    }

    queueMicrotask(() => {
      void connectSocket(organizationSession);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationSession?.accessToken]);

  const superadminLogout = () => {
    setSuperadminSession(null);
    setSuperadminProfile(null);
    setOrganizations([]);
    setOrganizationUsers([]);
    setDocuments([]);
    setDocumentJobs([]);
    setActiveDocumentJob(null);
    setSelectedOrganizationId("");
    stopJobPolling();
    if (!organizationSession) {
      setActiveRole(null);
    }
    appendLog("Cleared superadmin session");
  };

  const organizationLogout = () => {
    socketRef.current?.close();
    setOrganizationSession(null);
    setOrganizationProfile(null);
    setConversation(null);
    setLastAnswer(null);
    setLastProvider(null);
    setStreamedAnswer("");
    setConnectionState("Disconnected");
    if (!superadminSession) {
      setActiveRole(null);
    }
    appendLog("Cleared organization session");
  };

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId,
  );
  const completedJobsCount = documentJobs.filter(
    (job) => job.status === "completed",
  ).length;
  const isAuthenticated = Boolean(superadminSession || organizationSession);
  const isSuperadminView =
    activeRole === "superadmin" || (!activeRole && Boolean(superadminSession));
  const isOrganizationView =
    activeRole === "organization" || (!activeRole && Boolean(organizationSession));

  const value: DashboardContextValue = {
    backendUrl,
    activeRole,
    activeSection,
    isAuthenticated,
    isOrganizationView,
    isSuperadminView,
    superadminEmail,
    superadminPassword,
    superadminSession,
    superadminProfile,
    organizations,
    selectedOrganizationId,
    organizationUsers,
    organizationSession,
    organizationProfile,
    documents,
    documentJobs,
    activeDocumentJob,
    organizationEmail,
    organizationPassword,
    organizationName,
    organizationSlug,
    organizationLenderId,
    overdueDaysThreshold,
    highRiskScoreThreshold,
    newUserEmail,
    newUserName,
    newUserPassword,
    newUserRole,
    documentTitle,
    documentType,
    documentLoanId,
    documentSummary,
    documentContent,
    documentFile,
    documentSixMonthExtensionAllowed,
    conversation,
    chatMessage,
    streamedAnswer,
    lastAnswer,
    lastProvider,
    connectionState,
    activityLog,
    isSubmitting,
    errorMessage,
    selectedOrganization,
    completedJobsCount,
    setSuperadminEmail,
    setSuperadminPassword,
    setSuperadminSession,
    setSuperadminProfile,
    setOrganizationEmail,
    setOrganizationPassword,
    setOrganizationSession,
    setOrganizationProfile,
    setOrganizationName,
    setOrganizationSlug,
    setOrganizationLenderId,
    setOverdueDaysThreshold,
    setHighRiskScoreThreshold,
    setNewUserEmail,
    setNewUserName,
    setNewUserPassword,
    setNewUserRole,
    setDocumentTitle,
    setDocumentType,
    setDocumentLoanId,
    setDocumentSummary,
    setDocumentContent,
    setDocumentFile,
    setDocumentSixMonthExtensionAllowed,
    setChatMessage,
    setStreamedAnswer,
    setLastAnswer,
    setActiveRole,
    setSelectedOrganizationId,
    submitWithState,
    appendLog,
    superadminLogout,
    organizationLogout,
    refreshOrganizations,
    refreshOrganizationUsers,
    refreshOrganizationDocuments,
    refreshDocumentJobs,
    refreshOwnOrganizationDocuments,
    refreshOwnDocumentJobs,
    startJobPolling,
    connectSocket,
    sendSocketMessage,
    setErrorMessage,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

function DashboardSidebar() {
  const {
    isSuperadminView,
    organizationLogout,
    organizationSession,
    superadminLogout,
    superadminSession,
  } = useDashboardContext();
  const activeSection = (useSelectedLayoutSegment() ?? "overview") as DashboardSectionKey;
  const isOrganizationAdmin = organizationSession?.user.role === "admin";

  const sidebarItems: DashboardSectionKey[] = isSuperadminView
    ? ["overview", "access", "organizations", "users", "documents", "diagnostics"]
    : isOrganizationAdmin
      ? ["overview", "advisor-chat", "documents", "access", "diagnostics"]
      : ["overview", "advisor-chat", "access", "diagnostics"];

  const identity = isSuperadminView
    ? superadminSession?.user.email
    : organizationSession?.organization.name;

  return (
    <aside className="bg-[var(--nav)] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 lg:h-20">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--signal)] text-white shadow-lg shadow-black/20">
          <Icon name="spark" className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold tracking-tight">Cresflo</p>
          <p className="text-[11px] text-white/50">AI Advisor</p>
        </div>
      </div>

      <div className="overflow-x-auto px-3 py-3 lg:flex lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-6">
        <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 lg:block">
          Workspace
        </p>
        <nav className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item;
            const config = sectionConfig[item];

            return (
              <Link
                key={item}
                href={`/dashboard/${item}`}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${
                  isActive
                    ? "bg-white text-[var(--nav)] shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon
                  name={config.icon as IconName}
                  className={`h-[18px] w-[18px] ${isActive ? "text-[var(--signal)]" : "text-white/45 group-hover:text-white/75"}`}
                />
                {config.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden border-t border-white/10 p-4 lg:block">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white">
            {(identity ?? "U").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{identity ?? "Signed in"}</p>
            <p className="mt-0.5 text-[10px] capitalize text-white/45">
              {isSuperadminView ? "Superadmin" : organizationSession?.user.role ?? "User"}
            </p>
          </div>
          <button
            type="button"
            onClick={isSuperadminView ? superadminLogout : organizationLogout}
            aria-label="Log out"
            className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardHeader() {
  const {
    isOrganizationView,
    isSuperadminView,
    superadminSession,
    organizationSession,
    setActiveRole,
  } = useDashboardContext();
  const router = useRouter();
  const activeSection = (useSelectedLayoutSegment() ?? "overview") as DashboardSectionKey;
  const page = sectionConfig[activeSection] ?? sectionConfig.overview;

  const goToRoleHome = (role: DashboardRole) => {
    setActiveRole(role);
    router.push("/dashboard/overview");
  };

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-white px-4 sm:px-6 lg:min-h-20 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[var(--ink)]">{page.title}</p>
        <p className="hidden text-xs text-[var(--ink-muted)] sm:block">{page.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          API connected
        </span>
        <div className="hidden h-6 w-px bg-[var(--line)] sm:block" />
        <div className="text-right">
          <p className="text-xs font-semibold text-[var(--ink)]">
            {isSuperadminView ? "Superadmin" : organizationSession?.user.fullName ?? "Organization user"}
          </p>
          <p className="text-[10px] text-[var(--ink-muted)]">
            {isSuperadminView ? "Platform workspace" : organizationSession?.organization.name}
          </p>
        </div>
        {superadminSession && organizationSession ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goToRoleHome("superadmin")}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                isSuperadminView
                  ? "bg-[var(--nav)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink)]"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => goToRoleHome("organization")}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                isOrganizationView
                  ? "bg-[var(--nav)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink)]"
              }`}
            >
              Organization
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function DashboardUnauthenticatedState() {
  return (
    <Card className="bg-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--signal)]">
            Authentication required
          </p>
          <h2 className="text-2xl font-semibold text-[var(--ink)]">
            This dashboard only becomes actionable after login.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Go through the login page first, then return here as either a superadmin or an
            organization user.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--ink)] px-4 text-sm font-semibold text-[var(--paper)] shadow-[0_12px_30px_rgba(22,34,51,0.2)] transition hover:bg-[var(--ink-strong)]"
        >
          Open login
        </Link>
      </div>
    </Card>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { errorMessage, isAuthenticated } = useDashboardContext();

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {isAuthenticated ? <DashboardSidebar /> : null}
      <div className={isAuthenticated ? "lg:pl-64" : ""}>
        <DashboardHeader />
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!isAuthenticated ? <DashboardUnauthenticatedState /> : null}
          {isAuthenticated ? (
            <main className="min-w-0">
              {errorMessage ? (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </div>
              ) : null}
              {children}
            </main>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoleGuard({
  allow,
  title,
  description,
}: {
  allow: boolean;
  title: string;
  description: string;
}) {
  if (allow) {
    return null;
  }

  return (
    <Card className="bg-white">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--signal)]">
          Route unavailable
        </p>
        <h2 className="text-2xl font-semibold text-[var(--ink)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--ink-muted)]">{description}</p>
      </div>
    </Card>
  );
}

function DashboardOverviewPage() {
  const {
    completedJobsCount,
    connectionState,
    conversation,
    documents,
    isSuperadminView,
    lastProvider,
    organizationSession,
    organizations,
    organizationUsers,
    selectedOrganization,
  } = useDashboardContext();

  const metrics: Array<{
    label: string;
    value: string | number;
    detail: string;
    icon: IconName;
    href: string;
  }> = isSuperadminView
    ? [
        { label: "Organizations", value: organizations.length, detail: selectedOrganization ? `Managing ${selectedOrganization.name}` : "Select a workspace", icon: "building", href: "/dashboard/organizations" },
        { label: "Users", value: organizationUsers.length, detail: "In the selected organization", icon: "users", href: "/dashboard/users" },
        { label: "Knowledge", value: documents.length, detail: "Documents ready for retrieval", icon: "document", href: "/dashboard/documents" },
        { label: "Ingestions", value: completedJobsCount, detail: "Successfully completed", icon: "activity", href: "/dashboard/documents" },
      ]
    : [
        { label: "Organization", value: organizationSession?.organization.name ?? "Not connected", detail: "Current tenant workspace", icon: "building", href: "/dashboard/access" },
        { label: "Connection", value: connectionState, detail: "Live advisor streaming", icon: "activity", href: "/dashboard/advisor-chat" },
        { label: "Conversation", value: conversation ? "Active" : "Not started", detail: "Current advisor thread", icon: "chat", href: "/dashboard/advisor-chat" },
        { label: "AI provider", value: lastProvider ?? "Pending", detail: "Most recent response", icon: "spark", href: "/dashboard/advisor-chat" },
      ];

  return (
    <DashboardSection
      title="Overview"
      description={
        isSuperadminView
          ? "A quick summary of the organizations, users, and knowledge currently loaded in this dashboard."
          : "A quick summary of your organization session, chat connection, and active workspace state."
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href} className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_1px_2px_rgba(16,27,45,0.04)] transition hover:-translate-y-0.5 hover:border-[#cbd3de] hover:shadow-[0_8px_24px_rgba(16,27,45,0.08)]">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel)] text-[var(--ink-soft)] group-hover:bg-[var(--signal-soft)] group-hover:text-[var(--signal)]">
                <Icon name={metric.icon} className="h-5 w-5" />
              </span>
              <Icon name="chevron" className="h-4 w-4 text-[#b5bdc9] transition group-hover:translate-x-0.5 group-hover:text-[var(--signal)]" />
            </div>
            <p className="mt-5 text-xs font-semibold text-[var(--ink-muted)]">{metric.label}</p>
            <p className="mt-1 truncate text-2xl font-bold text-[var(--ink)]">{metric.value}</p>
            <p className="mt-2 truncate text-xs text-[var(--ink-muted)]">{metric.detail}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h3 className="text-sm font-bold text-[var(--ink)]">Get started</h3>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">Continue with the most useful next action.</p>
          </div>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-3">
            {(isSuperadminView
              ? [
                  ["Create an organization", "Set up a new lender workspace", "/dashboard/organizations", "building"],
                  ["Invite a user", "Provision organization access", "/dashboard/users", "users"],
                  ["Add knowledge", "Upload a policy or agreement", "/dashboard/documents", "document"],
                ]
              : [
                  ["Ask the advisor", "Start a grounded conversation", "/dashboard/advisor-chat", "chat"],
                  ["Review access", "Check your workspace profile", "/dashboard/access", "key"],
                  ["View activity", "Inspect connection events", "/dashboard/diagnostics", "activity"],
                ]
            ).map(([label, detail, href, icon]) => (
              <Link key={label} href={href} className="group bg-white p-5 transition hover:bg-[var(--panel)]">
                <Icon name={icon as IconName} className="h-5 w-5 text-[var(--signal)]" />
                <p className="mt-4 text-sm font-semibold text-[var(--ink)]">{label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{detail}</p>
              </Link>
            ))}
          </div>
        </Card>
        <Card className="bg-[var(--nav)] text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Workspace status</p>
          <p className="mt-4 text-lg font-bold">Everything is ready</p>
          <p className="mt-2 text-sm leading-6 text-white/55">Your session is active and the dashboard is connected to the backend.</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Operational</div>
        </Card>
      </div>
    </DashboardSection>
  );
}

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
        <DashboardSection
          title="Admin Access"
          description="Manage the active superadmin session used for organization operations."
        >
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
        <DashboardSection
          title="Workspace Access"
          description="Manage the active organization session used to authorize advisor chat."
        >
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

function DashboardOrganizationsPage() {
  const {
    backendUrl,
    activeRole,
    appendLog,
    isSubmitting,
    isSuperadminView,
    organizationLenderId,
    organizationName,
    organizations,
    organizationSlug,
    overdueDaysThreshold,
    highRiskScoreThreshold,
    refreshDocumentJobs,
    refreshOrganizationDocuments,
    refreshOrganizationUsers,
    refreshOrganizations,
    selectedOrganizationId,
    setHighRiskScoreThreshold,
    setOrganizationLenderId,
    setOrganizationName,
    setOrganizationSlug,
    setOverdueDaysThreshold,
    setSelectedOrganizationId,
    submitWithState,
    superadminSession,
  } = useDashboardContext();

  if (!isSuperadminView) {
    return (
      <RoleGuard
        allow={false}
        title="Organizations are managed from the superadmin view."
        description="Switch to the superadmin workspace to create organizations, refresh the list, and select the tenant you want to work on."
      />
    );
  }

  void activeRole;

  return (
    <DashboardSection
      title="Organizations"
      description="Create organizations, refresh the list, and select the one you want to work on."
    >
      <OrganizationPanel
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        form={{
          name: organizationName,
          slug: organizationSlug,
          lenderId: organizationLenderId,
          overdueDaysThreshold,
          highRiskScoreThreshold,
        }}
        isSubmitting={isSubmitting}
        canManage={Boolean(superadminSession)}
        onFormChange={(field, value) => {
          if (field === "name") setOrganizationName(value);
          if (field === "slug") setOrganizationSlug(value);
          if (field === "lenderId") setOrganizationLenderId(value);
          if (field === "overdueDaysThreshold") setOverdueDaysThreshold(value);
          if (field === "highRiskScoreThreshold") setHighRiskScoreThreshold(value);
        }}
        onCreate={() =>
          void submitWithState(async () => {
            if (!superadminSession) {
              throw new Error("Login as superadmin first.");
            }

            const organization = await createOrganization(
              backendUrl,
              superadminSession.accessToken,
              {
                name: organizationName,
                slug: organizationSlug,
                lenderId: organizationLenderId,
                overdueDaysThreshold: Number(overdueDaysThreshold),
                highRiskScoreThreshold: Number(highRiskScoreThreshold),
              },
            );

            await refreshOrganizations(superadminSession.accessToken);
            setSelectedOrganizationId(organization.id);
            appendLog(`Created organization ${organization.name}`);
          })
        }
        onRefresh={() =>
          void submitWithState(async () => {
            if (!superadminSession) {
              throw new Error("Login as superadmin first.");
            }

            await refreshOrganizations(superadminSession.accessToken);
            appendLog("Refreshed organizations");
          })
        }
        onSelect={(organizationId) => {
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
      />
    </DashboardSection>
  );
}

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
    <DashboardSection
      title="Users"
      description="Provision organization users and prepare credentials for workspace validation."
    >
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
    if (!isOrganizationAdmin || !organizationSession) {
      return;
    }

    const organizationId = organizationSession.organization.id;

    if (selectedOrganizationId !== organizationId) {
      setSelectedOrganizationId(organizationId);
    }

    void loadOrganizationAdminDocuments(organizationSession);
  }, [
    isOrganizationAdmin,
    organizationSession,
    selectedOrganizationId,
    setSelectedOrganizationId,
  ]);

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
    <DashboardSection
      title="Documents"
      description={
        isSuperadminView
          ? "Upload and track organization knowledge that the advisor can retrieve later."
          : "Upload PDFs and text documents for your organization so advisor responses can use RAG against tenant-scoped knowledge."
      }
    >
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
        onOrganizationSelect={(organizationId) => {
          if (isOrganizationAdmin) {
            return;
          }

          setSelectedOrganizationId(organizationId);

          if (superadminSession && organizationId) {
            void submitWithState(async () => {
              await refreshOrganizationDocuments(superadminSession.accessToken, organizationId);
              await refreshDocumentJobs(superadminSession.accessToken, organizationId);
              appendLog("Loaded organization documents");
            });
          }
        }}
        onFormChange={(field, value) => {
          if (field === "title") setDocumentTitle(value as string);
          if (field === "type") {
            setDocumentType(
              value as "loan_agreement" | "policy" | "servicing_procedure" | "general",
            );
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
    </DashboardSection>
  );
}

function DashboardAdvisorChatPage() {
  const {
    conversation,
    connectionState,
    isOrganizationView,
    lastAnswer,
    lastProvider,
    organizationSession,
    sendSocketMessage,
    setChatMessage,
    setErrorMessage,
    setLastAnswer,
    setStreamedAnswer,
    streamedAnswer,
    chatMessage,
    connectSocket,
  } = useDashboardContext();

  if (!isOrganizationView) {
    return (
      <RoleGuard
        allow={false}
        title="Advisor chat belongs to the organization workspace."
        description="Switch to the organization view to create conversations and stream tenant-scoped answers."
      />
    );
  }

  return (
    <DashboardSection
      title="Advisor Chat"
      description="Create conversations, stream grounded answers, and review the evidence behind them."
    >
      <AdvisorChatPanel
        session={organizationSession}
        connectionState={connectionState}
        conversation={conversation}
        chatMessage={chatMessage}
        streamedAnswer={streamedAnswer}
        lastAnswer={lastAnswer}
        lastProvider={lastProvider}
        onCreateConversation={() => {
          try {
            sendSocketMessage({ type: "create_conversation" });
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Could not create conversation.",
            );
          }
        }}
        onReconnect={() => {
          if (organizationSession) {
            void connectSocket(organizationSession);
          }
        }}
        onChatMessageChange={setChatMessage}
        onSendMessage={() => {
          if (!conversation) {
            setErrorMessage("Create a conversation first.");
            return;
          }

          try {
            setStreamedAnswer("");
            setLastAnswer(null);
            sendSocketMessage({
              type: "send_message",
              conversationId: conversation.id,
              message: chatMessage,
            });
            setChatMessage("");
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Could not send message.",
            );
          }
        }}
        onApplyPrompt={setChatMessage}
        onLoadConversation={() => {
          if (!conversation) {
            setErrorMessage("Create a conversation first.");
            return;
          }

          try {
            sendSocketMessage({
              type: "get_conversation",
              conversationId: conversation.id,
            });
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Could not reload conversation.",
            );
          }
        }}
      />
    </DashboardSection>
  );
}

function DashboardDiagnosticsPage() {
  const {
    activityLog,
    errorMessage,
    isSuperadminView,
    organizationSession,
  } = useDashboardContext();

  return (
    <DashboardSection
      title="Diagnostics"
      description="Keep an eye on request flow, errors, and runtime activity while you exercise the dashboard."
    >
      {isSuperadminView && !organizationSession ? (
        <Card className="bg-white">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--signal)]">
              Organization access
            </p>
            <h2 className="text-2xl font-semibold text-[var(--ink)]">
              Log in as an organization user to validate chat behavior.
            </h2>
            <p className="text-sm leading-6 text-[var(--ink-muted)]">
              After superadmin creates an organization user, use those credentials here to
              open the advisor workspace and verify tenant-scoped answers.
            </p>
          </div>
        </Card>
      ) : null}

      <RunLogPanel errorMessage={errorMessage} activityLog={activityLog} />
    </DashboardSection>
  );
}

function DashboardRouteLayout({
  activeSection,
  children,
}: PropsWithChildren<{
  activeSection: DashboardSectionKey;
}>) {
  return (
    <DashboardProvider activeSection={activeSection}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}

export {
  DashboardAccessSection,
  DashboardAdvisorChatPage,
  DashboardDiagnosticsPage,
  DashboardDocumentsPage,
  DashboardOrganizationsPage,
  DashboardOverviewPage,
  DashboardRouteLayout,
  DashboardUsersPage,
};
