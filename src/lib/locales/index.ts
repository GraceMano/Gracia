import { fr, LocaleDict } from "./fr";
import { en } from "./en";
import { es } from "./es";

export type SupportedLocale = "fr" | "en" | "es";

export const locales: Record<SupportedLocale, LocaleDict> = {
  fr,
  en,
  es,
};

export const defaultLocale: SupportedLocale = "fr";

export function getTranslation(locale: SupportedLocale, path: string): string {
  const dict = locales[locale] || locales[defaultLocale];
  const keys = path.split(".");
  let current: unknown = dict;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}
