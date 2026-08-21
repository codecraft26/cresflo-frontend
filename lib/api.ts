import type {
  AdvisorConversation,
  ApiEnvelope,
  OrganizationDocumentIngestionJobRecord,
  OrganizationDocumentRecord,
  OrganizationProfile,
  OrganizationRecord,
  OrganizationSession,
  OrganizationUserRecord,
  SuperadminProfile,
  SuperadminSession,
} from "@/lib/types";

const parseJson = async <T>(response: Response) => {
  const body = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Request failed.");
  }

  return body.data;
};

const createHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const superadminLogin = async (baseUrl: string, email: string, password: string) => {
  const response = await fetch(`${baseUrl}/api/superadmin/login`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  });

  return parseJson<SuperadminSession>(response);
};

const listOrganizations = async (baseUrl: string, token: string) => {
  const response = await fetch(`${baseUrl}/api/superadmin/organizations`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<OrganizationRecord[]>(response);
};

const getSuperadminProfile = async (baseUrl: string, token: string) => {
  const response = await fetch(`${baseUrl}/api/superadmin/me`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<SuperadminProfile>(response);
};

const createOrganization = async (
  baseUrl: string,
  token: string,
  payload: {
    name: string;
    slug: string;
    lenderId: string;
    overdueDaysThreshold: number;
    highRiskScoreThreshold: number;
  },
) => {
  const response = await fetch(`${baseUrl}/api/superadmin/organizations`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJson<OrganizationRecord>(response);
};

const createOrganizationUser = async (
  baseUrl: string,
  token: string,
  organizationId: string,
  payload: {
    email: string;
    fullName: string;
    password: string;
    role: "admin" | "analyst" | "servicer";
  },
) => {
  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/users`,
    {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(payload),
    },
  );

  return parseJson<OrganizationUserRecord>(response);
};

const listOrganizationUsers = async (
  baseUrl: string,
  token: string,
  organizationId: string,
) => {
  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/users`,
    {
      method: "GET",
      headers: createHeaders(token),
    },
  );

  return parseJson<OrganizationUserRecord[]>(response);
};

const listOrganizationDocuments = async (
  baseUrl: string,
  token: string,
  organizationId: string,
) => {
  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/documents`,
    {
      method: "GET",
      headers: createHeaders(token),
    },
  );

  return parseJson<OrganizationDocumentRecord[]>(response);
};

const ingestOrganizationDocument = async (
  baseUrl: string,
  token: string,
  organizationId: string,
  payload: {
    title: string;
    type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
    content: string;
    summary?: string;
    loanId?: string;
    sixMonthExtensionAllowed?: boolean;
  },
  ) => {
  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/documents`,
    {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(payload),
    },
  );

  return parseJson<OrganizationDocumentIngestionJobRecord>(response);
};

const ingestOrganizationPdfDocument = async (
  baseUrl: string,
  token: string,
  organizationId: string,
  payload: {
    file: File;
    title?: string;
    type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
    summary?: string;
    loanId?: string;
    sixMonthExtensionAllowed?: boolean;
  },
) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("type", payload.type);

  if (payload.title) {
    formData.append("title", payload.title);
  }

  if (payload.summary) {
    formData.append("summary", payload.summary);
  }

  if (payload.loanId) {
    formData.append("loanId", payload.loanId);
  }

  if (payload.sixMonthExtensionAllowed !== undefined) {
    formData.append(
      "sixMonthExtensionAllowed",
      String(payload.sixMonthExtensionAllowed),
    );
  }

  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/documents/pdf`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
  );

  return parseJson<OrganizationDocumentIngestionJobRecord>(response);
};

const listOrganizationDocumentIngestionJobs = async (
  baseUrl: string,
  token: string,
  organizationId: string,
) => {
  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/documents/jobs`,
    {
      method: "GET",
      headers: createHeaders(token),
    },
  );

  return parseJson<OrganizationDocumentIngestionJobRecord[]>(response);
};

const getOrganizationDocumentIngestionJob = async (
  baseUrl: string,
  token: string,
  organizationId: string,
  jobId: string,
) => {
  const response = await fetch(
    `${baseUrl}/api/superadmin/organizations/${organizationId}/documents/jobs/${jobId}`,
    {
      method: "GET",
      headers: createHeaders(token),
    },
  );

  return parseJson<OrganizationDocumentIngestionJobRecord>(response);
};

const organizationLogin = async (
  baseUrl: string,
  email: string,
  password: string,
) => {
  const response = await fetch(`${baseUrl}/api/organization-auth/login`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  });

  return parseJson<OrganizationSession>(response);
};

const getOrganizationProfile = async (baseUrl: string, token: string) => {
  const response = await fetch(`${baseUrl}/api/organization-auth/me`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<OrganizationProfile>(response);
};

const listAdvisorConversations = async (baseUrl: string, token: string) => {
  const response = await fetch(`${baseUrl}/api/advisor/conversations`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<AdvisorConversation[]>(response);
};

const listOwnOrganizationDocuments = async (baseUrl: string, token: string) => {
  const response = await fetch(`${baseUrl}/api/organization/documents`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<OrganizationDocumentRecord[]>(response);
};

const ingestOwnOrganizationDocument = async (
  baseUrl: string,
  token: string,
  payload: {
    title: string;
    type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
    content: string;
    summary?: string;
    loanId?: string;
    sixMonthExtensionAllowed?: boolean;
  },
) => {
  const response = await fetch(`${baseUrl}/api/organization/documents`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseJson<OrganizationDocumentIngestionJobRecord>(response);
};

const ingestOwnOrganizationPdfDocument = async (
  baseUrl: string,
  token: string,
  payload: {
    file: File;
    title?: string;
    type: "loan_agreement" | "policy" | "servicing_procedure" | "general";
    summary?: string;
    loanId?: string;
    sixMonthExtensionAllowed?: boolean;
  },
) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("type", payload.type);

  if (payload.title) {
    formData.append("title", payload.title);
  }

  if (payload.summary) {
    formData.append("summary", payload.summary);
  }

  if (payload.loanId) {
    formData.append("loanId", payload.loanId);
  }

  if (payload.sixMonthExtensionAllowed !== undefined) {
    formData.append(
      "sixMonthExtensionAllowed",
      String(payload.sixMonthExtensionAllowed),
    );
  }

  const response = await fetch(`${baseUrl}/api/organization/documents/pdf`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  return parseJson<OrganizationDocumentIngestionJobRecord>(response);
};

const listOwnOrganizationDocumentIngestionJobs = async (
  baseUrl: string,
  token: string,
) => {
  const response = await fetch(`${baseUrl}/api/organization/documents/jobs`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<OrganizationDocumentIngestionJobRecord[]>(response);
};

const getOwnOrganizationDocumentIngestionJob = async (
  baseUrl: string,
  token: string,
  jobId: string,
) => {
  const response = await fetch(`${baseUrl}/api/organization/documents/jobs/${jobId}`, {
    method: "GET",
    headers: createHeaders(token),
  });

  return parseJson<OrganizationDocumentIngestionJobRecord>(response);
};

export {
  createOrganization,
  createOrganizationUser,
  getOrganizationProfile,
  getOrganizationDocumentIngestionJob,
  getOwnOrganizationDocumentIngestionJob,
  getSuperadminProfile,
  ingestOrganizationDocument,
  ingestOrganizationPdfDocument,
  ingestOwnOrganizationDocument,
  ingestOwnOrganizationPdfDocument,
  listAdvisorConversations,
  listOrganizations,
  listOrganizationDocumentIngestionJobs,
  listOrganizationDocuments,
  listOrganizationUsers,
  listOwnOrganizationDocumentIngestionJobs,
  listOwnOrganizationDocuments,
  organizationLogin,
  superadminLogin,
};
