"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, MonitorSmartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS Safari
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => {
        if (!dismissed) setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show custom prompt if not already installed
    if (iOS && !dismissed) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Show again after 7 days
    setTimeout(() => setDismissed(false), 7 * 24 * 60 * 60 * 1000);
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 inset-x-4 z-50 lg:bottom-4 lg:left-4 lg:right-auto lg:w-80"
        >
          <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-elevated border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-primary text-white">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isIOS ? "تثبيت التطبيق" : "نصّب نبض الطيبات"}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {isIOS
                    ? "اضغط مشاركة → أضف إلى الشاشة الرئيسية"
                    : "نصّب التطبيق على جهازك لسهولة الوصول"}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {isIOS ? (
                <button
                  onClick={handleDismiss}
                  className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                >
                  حسناً
                </button>
              ) : (
                <>
                  <button
                    onClick={handleInstall}
                    className="flex-1 rounded-xl gradient-primary py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20"
                  >
                    <Download className="inline h-4 w-4 ml-1" />
                    تثبيت
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    لاحقاً
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function InstallMeta() {
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
      <link rel="apple-touch-icon" href="/icons/icon.svg" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="نبض الطيبات" />
      <meta name="mobile-web-app-capable" content="yes" />
    </>
  );
}
