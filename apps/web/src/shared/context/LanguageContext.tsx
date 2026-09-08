"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  translations,
  type AppTranslations,
  type Language,
} from "../constants/translations";

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
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
    t: translations[language],
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
      t: translations.vi,
      isEn: false,
      isVi: true,
    };
  }
  return context;
}
