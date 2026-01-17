import React from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-dark dark:bg-brand-light text-white dark:text-brand-dark hover:bg-gray-800 dark:hover:bg-gray-200 border border-brand-dark dark:border-brand-light",
  outline:
    "bg-transparent text-brand-dark dark:text-brand-light hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600",
};

export function Button({
  variant = "outline",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark dark:focus:ring-brand-light dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
