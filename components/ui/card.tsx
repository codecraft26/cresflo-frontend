import type { PropsWithChildren } from "react";

function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_1px_2px_rgba(16,27,45,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export { Card };
