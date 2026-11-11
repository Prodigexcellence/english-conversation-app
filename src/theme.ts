import { useColorScheme } from "react-native";

// Charte validée le 6 novembre 2026 : bleu, gris, bleu clair ; police Lexend.
// Bleu principal : bleu maya, le même en mode clair et sombre, avec du texte blanc dessus.
const MAYA_BLUE = "#4372F6";

const light = {
  background: "#F1F3F6",
  surface: "#FFFFFF",
  text: "#1A1F2B",
  textMuted: "#5D6676",
  border: "#E4E8EE",
  primary: MAYA_BLUE,
  onPrimary: "#FFFFFF",
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
  primary: MAYA_BLUE,
  onPrimary: "#FFFFFF",
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
