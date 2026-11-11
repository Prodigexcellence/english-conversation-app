import { useColorScheme } from "react-native";

// Charte validée le 6 novembre 2026 : bleu, gris, bleu clair ; police Lexend.
// Bleu principal : le bleu maya clair du logo, le même en mode clair et sombre.
// Le texte posé dessus est bleu nuit : du blanc serait presque illisible sur ce bleu clair.
const LOGO_BLUE = "#8FB0FA";
const NIGHT_BLUE = "#1A1F2B";

const light = {
  background: "#F1F3F6",
  surface: "#FFFFFF",
  text: "#1A1F2B",
  textMuted: "#5D6676",
  border: "#E4E8EE",
  primary: LOGO_BLUE,
  onPrimary: NIGHT_BLUE,
  aiBubble: "#DDE8FC",
  accentSoft: "#A9C3F8",
  stage: "#E3ECFC",
  field: "#F1F3F6",
  danger: "#C2372D",
};

const dark: typeof light = {
  background: "#12161D",
  surface: "#1B212B",
  text: "#E8ECF2",
  textMuted: "#9AA4B4",
  border: "#2B3340",
  primary: LOGO_BLUE,
  onPrimary: NIGHT_BLUE,
  aiBubble: "#233352",
  accentSoft: "#3D5A94",
  stage: "#1A2538",
  field: "#1F2631",
  danger: "#F0776C",
};

export type Colors = typeof light;

export const fonts = {
  regular: "Lexend_400Regular",
  medium: "Lexend_500Medium",
  semibold: "Lexend_600SemiBold",
};

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}
