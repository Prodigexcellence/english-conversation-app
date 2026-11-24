// Catalogue des langues de l'interface.
//
// Ce fichier ne dépend ni de React ni de l'état de l'app : il peut donc être importé
// partout, y compris par `state/profile.tsx`, sans créer de boucle d'imports.
//
// POUR AJOUTER UNE LANGUE : traduire une copie de `fr.ts`, puis ajouter deux lignes ici
// (dans `languages` et dans `LANGUAGE_NAMES`) et retirer son nom de `PLANNED_LANGUAGES`.
// Aucun écran n'est à modifier.

import { getLocales } from "expo-localization";

import en from "./en";
import fr from "./fr";

export const languages = { fr, en };

export type Language = keyof typeof languages;

// Langue de repli quand l'appareil est dans une langue pas encore traduite.
// L'anglais, et non le français : l'app est faite pour le monde entier.
export const FALLBACK_LANGUAGE: Language = "en";

// Chaque langue est écrite dans sa propre langue : un hispanophone cherche « Español »,
// pas « Espagnol ». Ces noms ne se traduisent donc jamais.
export const LANGUAGE_NAMES: Record<Language, string> = {
  fr: "Français",
  en: "English",
};

// Langues prévues mais pas encore traduites : affichées « Bientôt » dans l'onboarding.
export const PLANNED_LANGUAGES = ["Español", "Deutsch", "Italiano", "Português"];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && value in languages;
}

type LocaleLike = { languageCode: string | null };

// `getLocales()` rend les langues de l'appareil dans l'ordre choisi par l'utilisateur :
// on retient la première que l'app sait parler.
export function languageFromLocales(locales: readonly LocaleLike[]): Language {
  for (const locale of locales) {
    if (isLanguage(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}

export function deviceLanguage(): Language {
  return languageFromLocales(getLocales());
}
