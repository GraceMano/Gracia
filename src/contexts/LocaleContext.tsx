"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SupportedLocale, defaultLocale, getTranslation, locales } from "@/lib/locales";
import { LocaleDict } from "@/lib/locales/fr";

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  t: (path: string) => string;
  dict: LocaleDict;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>(defaultLocale);

  const t = (path: string): string => {
    return getTranslation(locale, path);
  };

  const dict = locales[locale] || locales[defaultLocale];

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
