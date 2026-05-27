"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** إخفاء زر الإغلاق — مثلاً للإقرار الإلزامي */
  preventClose?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  preventClose = false,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, preventClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="modal-title"
          aria-modal="true"
          className={cn(
            "fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(100%,32rem)]",
            "rounded-2xl border-0 bg-transparent p-0 backdrop:bg-slate-900/60",
            className
          )}
          onClose={preventClose ? undefined : onClose}
          onCancel={(e) => {
            if (preventClose) e.preventDefault();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl",
              "border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md",
              "dark:border-slate-600/80 dark:bg-slate-900/95"
            )}
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-50">
                {title}
              </h2>
              {!preventClose ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="!p-2"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              ) : null}
            </header>
            <div className="overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </dialog>
      ) : null}
    </AnimatePresence>
  );
}
