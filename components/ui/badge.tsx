function Badge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
        : "bg-[var(--panel)] text-[var(--ink-soft)] ring-1 ring-inset ring-[var(--line)]";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${toneClasses}`}>
      {children}
    </span>
  );
}

export { Badge };
