// Langue de l'interface, offerte aux écrans par `useT()`.
//
// Ordre de décision :
//   1. le choix de l'utilisateur, enregistré dans `profiles.native_language` ;
//   2. sinon la langue de l'appareil, si l'app la parle ;
//   3. sinon l'anglais.
//
// La même valeur servira à l'étape 4a pour dire à l'IA dans quelle langue expliquer
// les fautes : c'est la langue maternelle de l'utilisateur, pas celle qu'il apprend.
//
// L'écriture de droite à gauche (arabe, hébreu) est active par défaut depuis le SDK 58
// d'Expo, y compris dans Expo Go : rien à configurer le jour où l'on ajoutera ces langues.

import { useLocales } from "expo-localization";
import { createContext, createElement, type ReactNode, useContext } from "react";

import type { Translations } from "@/i18n/fr";
import { type Language, languageFromLocales, languages } from "@/i18n/languages";
import { useProfile } from "@/state/profile";

export type { Language, Translations };
export { FALLBACK_LANGUAGE, LANGUAGE_NAMES, PLANNED_LANGUAGES, deviceLanguage, isLanguage } from "@/i18n/languages";

type I18n = { t: Translations; language: Language };

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // `useLocales` réaffiche l'app si l'utilisateur change la langue de son appareil.
  const locales = useLocales();
  const { profile } = useProfile();
  const language = profile.nativeLanguage ?? languageFromLocales(locales);

  return createElement(I18nContext.Provider, { value: { t: languages[language], language } }, children);
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n doit être utilisé sous <I18nProvider>");
  return value;
}

// Raccourci : la plupart des écrans n'ont besoin que des textes.
export function useT(): Translations {
  return useI18n().t;
}
