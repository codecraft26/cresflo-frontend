"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import { useRouter } from "next/navigation";

import {
  getOrganizationDocumentIngestionJob,
  getOwnOrganizationDocumentIngestionJob,
  listAdvisorConversations,
  listOrganizationDocumentIngestionJobs,
  listOrganizationDocuments,
  listOrganizations,
  listOrganizationUsers,
  listOwnOrganizationDocumentIngestionJobs,
  listOwnOrganizationDocuments,
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

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const isOrganizationTokenExpired = (token: string) => {
  try {
    const encodedPayload = token.split(".")[0];

    if (!encodedPayload) {
      return true;
    }

    const normalizedPayload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );
    const payload = JSON.parse(window.atob(paddedPayload)) as { exp?: number };

    return typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

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
  conversationHistory: AdvisorConversation[];
  isConversationHistoryLoading: boolean;
  chatMessage: string;
  pendingChatMessage: string;
  chatActivity: string | null;
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
  setPendingChatMessage: (value: string) => void;
  setChatActivity: (value: string | null) => void;
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
  refreshConversationHistory: (token: string) => Promise<void>;
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

function DashboardProvider({
  activeSection,
  children,
}: PropsWithChildren<{
  activeSection: DashboardSectionKey;
}>) {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [backendUrl] = useState(() => readStoredBackendUrl(defaultBackendUrl));
  const router = useRouter();
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
  const [conversationHistory, setConversationHistory] = useState<AdvisorConversation[]>([]);
  const [isConversationHistoryLoading, setIsConversationHistoryLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [pendingChatMessage, setPendingChatMessage] = useState("");
  const [chatActivity, setChatActivity] = useState<string | null>(null);
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

  const refreshConversationHistory = async (token: string) => {
    setIsConversationHistoryLoading(true);

    try {
      const items = await listAdvisorConversations(backendUrl, token);
      setConversationHistory(items);
    } finally {
      setIsConversationHistoryLoading(false);
    }
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
        setErrorMessage("");
        appendLog(`Socket connected for ${event.user.email}`);
        break;
      case "conversation_created":
        setConversation(event.conversation);
        setConversationHistory((current) => [
          event.conversation,
          ...current.filter((item) => item.id !== event.conversation.id),
        ]);
        setStreamedAnswer("");
        setLastAnswer(null);
        setChatActivity(null);
        appendLog(`Conversation ${event.conversation.id} created`);
        break;
      case "conversation_loaded":
        setConversation(event.conversation);
        setConversationHistory((current) => [
          event.conversation,
          ...current.filter((item) => item.id !== event.conversation.id),
        ]);
        setStreamedAnswer("");
        setLastAnswer(null);
        setPendingChatMessage("");
        setChatActivity(null);
        appendLog(`Conversation ${event.conversation.id} loaded`);
        break;
      case "planning_started":
        setStreamedAnswer("");
        setChatActivity("Understanding your request");
        appendLog(`Planning started for ${event.conversationId}`);
        break;
      case "plan_ready":
        setChatActivity(
          event.planKind === "document-check"
            ? "Searching organization documents"
            : event.planKind === "portfolio-search" || event.planKind === "portfolio-breakdown"
              ? "Checking trusted portfolio data"
              : "Running the trusted advisor capability",
        );
        appendLog(`Planner chose ${event.planKind}`);
        break;
      case "message_chunk":
        setChatActivity("Writing a grounded answer");
        setStreamedAnswer((current) => current + event.chunk);
        break;
      case "message_complete":
        setConversation(event.conversation);
        setConversationHistory((current) => [
          event.conversation,
          ...current.filter((item) => item.id !== event.conversation.id),
        ]);
        setStreamedAnswer(event.message || event.answer.summary);
        setLastAnswer(event.answer);
        setLastProvider(event.provider);
        setPendingChatMessage("");
        setChatActivity(null);
        appendLog(`Completed message with ${event.provider}`);
        break;
      case "error":
        setPendingChatMessage("");
        setChatActivity(null);
        setErrorMessage(event.message);
        if (event.message.toLowerCase().includes("token")) {
          setConnectionState("Session expired");
        }
        appendLog(`Socket error: ${event.message}`);
        break;
    }
  };

  const connectSocket = async (session: OrganizationSession) => {
    const previousSocket = socketRef.current;
    socketRef.current = null;
    previousSocket?.close();

    if (isOrganizationTokenExpired(session.accessToken)) {
      setConnectionState("Session expired");
      setErrorMessage("Your organization session has expired. Sign in again to use advisor chat.");
      return;
    }

    const wsUrl = backendUrl.replace("http://", "ws://").replace("https://", "wss://");
    const socket = new WebSocket(
      `${wsUrl}/ws/advisor?token=${encodeURIComponent(session.accessToken)}`,
    );

    setConnectionState("Connecting");
    setErrorMessage("");
    socketRef.current = socket;

    socket.onopen = () => {
      if (socketRef.current !== socket) {
        socket.close();
        return;
      }

      appendLog("WebSocket opened");
    };

    socket.onmessage = (messageEvent) => {
      if (socketRef.current !== socket) {
        return;
      }

      const payload = JSON.parse(messageEvent.data) as AdvisorSocketEvent;
      handleSocketEvent(payload);
    };

    socket.onclose = () => {
      if (socketRef.current !== socket) {
        return;
      }

      socketRef.current = null;
      setConnectionState("Disconnected");
      setPendingChatMessage("");
      setChatActivity(null);
      appendLog("WebSocket closed");
    };

    socket.onerror = () => {
      if (socketRef.current !== socket) {
        return;
      }

      setConnectionState("Error");
      setPendingChatMessage("");
      setChatActivity(null);
      setErrorMessage(
        `Could not connect to advisor streaming at ${wsUrl}/ws/advisor. Check that the backend is running and try reconnecting.`,
      );
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
      void refreshConversationHistory(organizationSession.accessToken).catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load conversation history.",
        );
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationSession?.accessToken]);

  const superadminLogout = () => {
    clearStoredSuperadminSession();
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
    router.replace("/superadmin/login");
  };

  const organizationLogout = () => {
    clearStoredOrganizationSession();
    socketRef.current?.close();
    setOrganizationSession(null);
    setOrganizationProfile(null);
    setConversation(null);
    setConversationHistory([]);
    setLastAnswer(null);
    setLastProvider(null);
    setStreamedAnswer("");
    setPendingChatMessage("");
    setChatActivity(null);
    setConnectionState("Disconnected");
    if (!superadminSession) {
      setActiveRole(null);
    }
    appendLog("Cleared organization session");
    router.replace("/login");
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
    conversationHistory,
    isConversationHistoryLoading,
    chatMessage,
    pendingChatMessage,
    chatActivity,
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
    setPendingChatMessage,
    setChatActivity,
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
    refreshConversationHistory,
    startJobPolling,
    connectSocket,
    sendSocketMessage,
    setErrorMessage,
  };

  return (
    <DashboardContext.Provider value={value}>
      {hasHydrated ? children : <DashboardHydrationFallback />}
    </DashboardContext.Provider>
  );
}

function DashboardHydrationFallback() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="h-16 border-b border-[var(--line)] bg-white lg:h-20" />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-5" aria-label="Loading dashboard">
          <div className="h-8 w-48 rounded-lg bg-[var(--panel-strong)]" />
          <div className="h-4 w-80 max-w-full rounded bg-[var(--panel-strong)]" />
          <div className="grid gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-36 rounded-2xl border border-[var(--line)] bg-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  DashboardContext,
  DashboardProvider,
  sectionConfig,
  useDashboardContext,
  type DashboardContextValue,
  type DashboardSectionKey,
};
