import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // ignore - banner just won't remember the dismissal this time
  }
}

export function InstallPrompt() {
  const [mode, setMode] = useState<"none" | "android" | "ios">("none");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // localStorage unavailable - treat as not dismissed
    }
    if (dismissed || isStandalone()) return;

    if (isIos()) {
      setMode("ios");
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setMode("android");
    };
    const onInstalled = () => setMode("none");

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "none") return null;

  const hide = () => {
    dismiss();
    setMode("none");
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    dismiss();
    setMode("none");
  };

  return (
    <div className="mx-auto mt-4 max-w-6xl px-4">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3">
        <img src="/__grok/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium text-ink">Install Barata</p>
          {mode === "ios" ? (
            <p className="text-muted">
              Tap <Share size={13} strokeWidth={2} className="mb-0.5 inline" />, then "Add to Home Screen".
            </p>
          ) : (
            <p className="text-muted">Add it to your home screen for quick, full-screen access.</p>
          )}
        </div>
        {mode === "android" && (
          <button
            type="button"
            onClick={install}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-fg"
          >
            <Download size={16} strokeWidth={2} />
            Install
          </button>
        )}
        <button
          type="button"
          onClick={hide}
          aria-label="Dismiss"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-faint hover:bg-bg hover:text-ink"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
