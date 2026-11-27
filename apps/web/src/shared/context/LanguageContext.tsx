"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AppTranslations, Language } from "../constants/translations";
import { vi } from "../constants/translations/vi";

/*
 * Vietnamese ships with every page; English is fetched the first time a reader
 * needs it, so the large majority who read Vietnamese never download it. Until
 * it has arrived the whole interface stays Vietnamese - `language`, `isVi` and
 * `t` move to English together - rather than showing a mix of the two.
 */
let english: AppTranslations | null = null;
let englishLoading: Promise<AppTranslations> | null = null;

/**
 * Fetches English ahead of need, e.g. in tests that render in English from the
 * first frame. The provider calls the same thing when English is chosen.
 */
export function preloadEnglish(): Promise<AppTranslations> {
  return loadEnglish();
}

function loadEnglish(): Promise<AppTranslations> {
  englishLoading ??= import("../constants/translations/en").then(
    (module) => (english = module.en),
  );
  return englishLoading;
}

const STORAGE_KEY = "englow3_lang";

let memoryLang: Language = "vi";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && (e.newValue === "vi" || e.newValue === "en")) {
      memoryLang = e.newValue;
      listener();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot(): Language {
  if (typeof window === "undefined") return "vi";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "vi" || saved === "en") {
      memoryLang = saved;
      return saved;
    }
  } catch {
    // Ignore restricted localStorage
  }
  return memoryLang;
}

/**
 * The stored language, read directly. For the few places that render outside
 * `LanguageProvider` - the account provider above it, and the global error page
 * that replaces the whole layout.
 */
export function readStoredLanguage(): Language {
  return getSnapshot();
}

function getServerSnapshot(): Language {
  return "vi";
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: AppTranslations;
  isEn: boolean;
  isVi: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const chosen = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  // Set once English has loaded, to render again with it.
  const [englishReady, setEnglishReady] = useState(english !== null);
  // Synchronising with the network: fetch English when it is chosen and not
  // here yet. The state changes in the callback, not in the effect itself.
  useEffect(() => {
    if (chosen !== "en" || english) return;
    let current = true;
    loadEnglish()
      .then(() => {
        if (current) setEnglishReady(true);
      })
      .catch(() => {
        // Offline or the chunk failed: stay in Vietnamese; the next choice of
        // English tries again.
        englishLoading = null;
      });
    return () => {
      current = false;
    };
  }, [chosen]);
  const language: Language =
    chosen === "en" && (englishReady || english) ? "en" : "vi";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
    memoryLang = lang;
    document.documentElement.lang = lang;
    listeners.forEach((l) => l());
  }, []);

  const toggleLanguage = useCallback(() => {
    const next: Language = language === "vi" ? "en" : "vi";
    setLanguage(next);
  }, [language, setLanguage]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    toggleLanguage,
    t: language === "en" && english ? english : vi,
    isEn: language === "en",
    isVi: language === "vi",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for SSR or usage outside provider
    return {
      language: "vi",
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: vi,
      isEn: false,
      isVi: true,
    };
  }
  return context;
}
