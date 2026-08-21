import type { TextareaHTMLAttributes } from "react";

function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full resize-y rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition placeholder:text-[#9aa3b1] hover:border-[#cbd3de] focus:border-[var(--signal)] focus:ring-3 focus:ring-[var(--signal-soft)] ${className}`}
      {...props}
    />
  );
}

export { Textarea };
