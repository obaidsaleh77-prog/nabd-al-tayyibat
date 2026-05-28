"use client";

import { useEffect } from "react";
import { InstallPrompt, InstallMeta } from "./InstallPrompt";
export { InstallMeta };

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore in dev */
      });
    }
  }, []);

  return <InstallPrompt />;
}
