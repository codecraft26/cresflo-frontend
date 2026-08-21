import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--signal)] text-white shadow-sm hover:bg-[var(--signal-hover)]",
  secondary:
    "bg-white text-[var(--ink)] ring-1 ring-inset ring-[var(--line)] hover:bg-[var(--panel)]",
  ghost:
    "bg-transparent text-[var(--ink-soft)] ring-1 ring-transparent hover:bg-[var(--panel)]",
};

function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
