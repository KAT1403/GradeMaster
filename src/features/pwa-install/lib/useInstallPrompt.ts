import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt: () => Promise<void>;
}

const DISMISSED_KEY = "gradeMasterInstallDismissedAt";
const VISITS_KEY = "gradeMasterVisits";
const SNOOZE_MS = 5 * 24 * 60 * 60 * 1000; 
const ENGAGEMENT_MS = 45_000;

export type InstallMode = "prompt" | "ios";

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* empty */
  }
};

const readVisits = (): number => {
  const stored = Number(readStorage(VISITS_KEY) ?? "0");
  return Number.isFinite(stored) ? stored : 0;
};

let visitCounted = false;

const countVisit = (): void => {
  if (visitCounted) return;
  visitCounted = true;
  writeStorage(VISITS_KEY, String(readVisits() + 1));
};

const isSnoozed = (): boolean => {
  const stored = Number(readStorage(DISMISSED_KEY) ?? "0");
  if (!Number.isFinite(stored) || stored <= 0) return false;
  return Date.now() - stored < SNOOZE_MS;
};

const isStandalone = (): boolean => {
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    iosStandalone === true
  );
};

const isIOSDevice = (): boolean =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1);

interface UseInstallPrompt {
  visible: boolean;
  mode: InstallMode;
  install: () => Promise<void>;
  dismiss: () => void;
}

export const useInstallPrompt = (): UseInstallPrompt => {
  const deferredEvent = useRef<BeforeInstallPromptEvent | null>(null);

  const [canPrompt, setCanPrompt] = useState(false);
  const [hidden, setHidden] = useState(() => isSnoozed() || isStandalone());
  const [mode] = useState<InstallMode>(() =>
    isIOSDevice() ? "ios" : "prompt",
  );
  const [engaged, setEngaged] = useState(() => readVisits() >= 1);

  useEffect(() => {
    if (hidden) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredEvent.current = event as BeforeInstallPromptEvent;
      setCanPrompt(true);
    };

    const onInstalled = () => {
      deferredEvent.current = null;
      setHidden(true);
      writeStorage(DISMISSED_KEY, String(Date.now()));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [hidden]);

  useEffect(() => {
    countVisit();
  }, []);

  useEffect(() => {
    if (hidden || engaged) return;

    const timer = window.setTimeout(() => setEngaged(true), ENGAGEMENT_MS);
    return () => window.clearTimeout(timer);
  }, [hidden, engaged]);

  const dismiss = useCallback(() => {
    setHidden(true);
    writeStorage(DISMISSED_KEY, String(Date.now()));
  }, []);

  const install = useCallback(async () => {
    const event = deferredEvent.current;
    if (!event) return;

    deferredEvent.current = null;
    setCanPrompt(false);

    await event.prompt();
    const { outcome } = await event.userChoice;
    setHidden(true);
    if (outcome === "dismissed") {
      writeStorage(DISMISSED_KEY, String(Date.now()));
    }
  }, []);

  const visible =
    !hidden && engaged && (mode === "ios" ? !isStandalone() : canPrompt);
  return { visible, mode, install, dismiss };
};
