import React from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent dark:bg-accent-dark text-white hover:bg-accent-hover dark:hover:bg-accent-dark-hover border border-accent dark:border-accent-dark",
  outline:
    "bg-transparent text-brand-dark dark:text-accent-dark-fg hover:bg-stone-100 dark:hover:bg-slate-700 border border-stone-300 dark:border-slate-600",
};

export function Button({
  variant = "outline",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-accent-dark-fg dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
