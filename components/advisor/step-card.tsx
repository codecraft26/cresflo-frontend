import type { PropsWithChildren } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function StepCard({
  children,
  eyebrow,
  title,
  description,
  status,
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  status: string;
}>) {
  return (
    <Card className="flex flex-col gap-6 p-0 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--signal)]">
            {eyebrow}
          </p>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
              {description}
            </p>
          </div>
        </div>
        <Badge tone={status === "Ready" ? "success" : "neutral"}>{status}</Badge>
      </div>
      <div className="flex flex-col gap-6 px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
    </Card>
  );
}

export { StepCard };
