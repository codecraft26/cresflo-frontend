export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type SuperadminSession = {
  accessToken: string;
  expiresInSeconds: number;
  user: {
    email: string;
    role: "superadmin";
  };
};

export type SuperadminProfile = {
  email: string | null;
  role: "superadmin" | null;
};

export type OrganizationRecord = {
  id: string;
  name: string;
  slug: string;
  lenderId: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type OrganizationDocumentRecord = {
  id: string;
  tenantId: string;
  loanId?: string | null;
  title: string;
  type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
  summary: string;
  sixMonthExtensionAllowed: boolean;
};

export type OrganizationDocumentIngestionJobRecord = {
  id: string;
  tenantId: string;
  title: string;
  type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
  sourceKind: "text" | "pdf";
  status:
    | "queued"
    | "extracting"
    | "chunking"
    | "embedding"
    | "indexing"
    | "completed"
    | "failed";
  progressPercentage: number;
  statusMessage: string;
  errorMessage?: string | null;
  documentId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationUserRecord = {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: "admin" | "analyst" | "servicer";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type OrganizationSession = {
  accessToken: string;
  expiresInSeconds: number;
  user: {
    id: string;
    organizationId: string;
    email: string;
    fullName: string;
    role: "admin" | "analyst" | "servicer";
  };
  organization: OrganizationRecord;
};

export type OrganizationProfile = {
  userId: string | null;
  tenantId: string | null;
  lenderId: string | null;
  email: string | null;
  role: "admin" | "analyst" | "servicer" | null;
};

export type AdvisorConversation = {
  id: string;
  context: {
    tenantId: string;
    userId: string;
    role: "admin" | "analyst" | "servicer";
    lenderId: string;
  };
  messages: {
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }[];
  queryHistory: {
    label: string;
    constraints: unknown[];
    resultLoanIds: string[];
  }[];
  createdAt: string;
  updatedAt: string;
};

export type AdvisorAnswer = {
  summary: string;
  data?: Record<string, unknown>;
  evidence: {
    type: "loan" | "definition" | "document" | "system";
    id: string;
    label: string;
    detail: string;
  }[];
  warnings: string[];
  followUpSuggestions: string[];
};

export type AdvisorSocketEvent =
  | {
      type: "connected";
      user: {
        userId: string;
        tenantId: string;
        lenderId: string;
        email: string;
        role: string;
      };
    }
  | {
      type: "conversation_created";
      conversation: AdvisorConversation;
    }
  | {
      type: "conversation_loaded";
      conversation: AdvisorConversation;
    }
  | {
      type: "planning_started";
      conversationId: string;
    }
  | {
      type: "plan_ready";
      conversationId: string;
      planKind: string;
    }
  | {
      type: "message_chunk";
      conversationId: string;
      chunk: string;
    }
  | {
      type: "message_complete";
      conversationId: string;
      answer: AdvisorAnswer;
      message: string;
      conversation: AdvisorConversation;
      provider: string;
    }
  | {
      type: "error";
      message: string;
    };
