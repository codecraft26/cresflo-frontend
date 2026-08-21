import { AuthPortal } from "@/components/advisor/auth-portal";

export default function SuperadminLoginPage() {
  return <AuthPortal initialMode="superadmin" lockedMode="superadmin" />;
}
