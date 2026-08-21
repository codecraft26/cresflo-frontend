import { AuthPortal } from "@/components/advisor/auth-portal";

export default function LoginPage() {
  return <AuthPortal initialMode="organization" lockedMode="organization" />;
}
