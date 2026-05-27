import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-card",
        "dark:border-slate-700 dark:bg-slate-800 dark:shadow-card-dark",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 text-center">
      <h1 className="text-2xl font-bold text-text-dark dark:text-slate-50">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-text-light dark:text-slate-400">{description}</p>
      ) : null}
    </header>
  );
}
