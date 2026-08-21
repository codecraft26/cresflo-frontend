import type { PropsWithChildren } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function StepCard({
  children,
  eyebrow,
  title,
  description,
  status,
  compact = false,
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  compact?: boolean;
}>) {
  return (
    <Card className={`flex flex-col overflow-hidden p-0 ${compact ? "gap-0" : "gap-6"}`}>
      <div className={`flex flex-wrap items-start justify-between border-b border-[var(--line)] ${compact ? "gap-2 px-4 py-3" : "gap-3 px-5 py-4 sm:px-6"}`}>
        <div className={compact ? "space-y-1" : "space-y-2"}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--signal)]">
            {eyebrow}
          </p>
          <div className="space-y-1">
            <h2 className={`${compact ? "text-base" : "text-lg"} font-semibold text-[var(--ink)]`}>{title}</h2>
            <p className={`max-w-2xl text-[var(--ink-muted)] ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
              {description}
            </p>
          </div>
        </div>
        <Badge tone={status === "Ready" ? "success" : "neutral"}>{status}</Badge>
      </div>
      <div className={compact ? "flex flex-col gap-3 px-4 py-3" : "flex flex-col gap-6 px-5 pb-5 sm:px-6 sm:pb-6"}>{children}</div>
    </Card>
  );
}

export { StepCard };
