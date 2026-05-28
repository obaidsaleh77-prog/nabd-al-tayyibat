"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** BottomSheet — نافذة منزلقة من الأسفل مع خلفية شفافة ومقبض إغلاق */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end lg:items-center lg:justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* الورقة */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="relative w-full max-w-lg rounded-[28px] bg-white p-5 pb-8 shadow-elevated dark:bg-slate-900 lg:max-h-[80vh] lg:overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "نافذة"}
          >
            {/* مقبض السحب */}
            <div className="flex justify-center mb-4">
              <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* رأس الورقة */}
            {title ? (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {/* المحتوى */}
            <div className="max-h-[70vh] overflow-y-auto scrollbar-none">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
