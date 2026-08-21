import type { PropsWithChildren } from "react";

function Field({
  children,
  label,
  hint,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-[var(--ink-soft)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--ink-muted)]">{hint}</span> : null}
    </label>
  );
}

export { Field };
