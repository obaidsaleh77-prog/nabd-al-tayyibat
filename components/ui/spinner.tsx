import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "جاري التحميل" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-3", className)}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}
