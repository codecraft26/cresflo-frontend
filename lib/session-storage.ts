import type { OrganizationSession, SuperadminSession } from "@/lib/types";

type DashboardRole = "superadmin" | "organization";

const storageKeys = {
  backendUrl: "cresflo.backendUrl",
  activeRole: "cresflo.activeRole",
  superadminSession: "cresflo.superadminSession",
  organizationSession: "cresflo.organizationSession",
} as const;

const canUseStorage = () => typeof window !== "undefined";

const readStoredValue = (key: string, fallback = "") => {
  if (!canUseStorage()) {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
};

const writeStoredValue = (key: string, value: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
};

const removeStoredValue = (key: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
};

const readStoredJson = <T>(key: string): T | null => {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const writeStoredJson = (key: string, value: unknown) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const readStoredBackendUrl = (fallback: string) =>
  fallback;

const writeStoredBackendUrl = (value: string) => {
  void value;
};

const readStoredRole = (): DashboardRole | null => {
  const value = readStoredValue(storageKeys.activeRole);

  if (value === "superadmin" || value === "organization") {
    return value;
  }

  return null;
};

const writeStoredRole = (role: DashboardRole) =>
  writeStoredValue(storageKeys.activeRole, role);

const clearStoredRole = () => removeStoredValue(storageKeys.activeRole);

const readStoredSuperadminSession = () =>
  readStoredJson<SuperadminSession>(storageKeys.superadminSession);

const writeStoredSuperadminSession = (session: SuperadminSession) =>
  writeStoredJson(storageKeys.superadminSession, session);

const clearStoredSuperadminSession = () =>
  removeStoredValue(storageKeys.superadminSession);

const readStoredOrganizationSession = () =>
  readStoredJson<OrganizationSession>(storageKeys.organizationSession);

const writeStoredOrganizationSession = (session: OrganizationSession) =>
  writeStoredJson(storageKeys.organizationSession, session);

const clearStoredOrganizationSession = () =>
  removeStoredValue(storageKeys.organizationSession);

export type { DashboardRole };
export {
  clearStoredOrganizationSession,
  clearStoredRole,
  clearStoredSuperadminSession,
  readStoredBackendUrl,
  readStoredOrganizationSession,
  readStoredRole,
  readStoredSuperadminSession,
  writeStoredBackendUrl,
  writeStoredOrganizationSession,
  writeStoredRole,
  writeStoredSuperadminSession,
};
