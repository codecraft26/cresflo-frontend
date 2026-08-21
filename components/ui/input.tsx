import type { InputHTMLAttributes } from "react";

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#9aa3b1] hover:border-[#cbd3de] focus:border-[var(--signal)] focus:ring-3 focus:ring-[var(--signal-soft)] ${className}`}
      {...props}
    />
  );
}

export { Input };
