import { az, type Dictionary } from "./translations/az";
import { en } from "./translations/en";
import { ru } from "./translations/ru";
import type { Locale } from "./config";

export const DICTIONARIES: Record<Locale, Dictionary> = { az, en, ru };

export type { Dictionary };
export * from "./config";
