export const LOCALES = ["az", "en", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "az";

export const STORAGE_KEY = "uf-locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "az" || value === "en" || value === "ru";
}
