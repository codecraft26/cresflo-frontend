import type { SelectHTMLAttributes } from "react";

function Select({
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 text-sm text-[var(--ink)] outline-none transition hover:border-[#cbd3de] focus:border-[var(--signal)] focus:ring-3 focus:ring-[var(--signal-soft)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
