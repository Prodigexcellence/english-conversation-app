import { useColorScheme } from "react-native";

// Charte validée le 6 novembre 2026 : bleu, gris, bleu clair ; police Lexend.
const light = {
  background: "#F1F3F6",
  surface: "#FFFFFF",
  text: "#1A1F2B",
  textMuted: "#5D6676",
  border: "#E4E8EE",
  primary: "#2A5BD7",
  onPrimary: "#FFFFFF",
  aiBubble: "#DDE8FC",
  accentSoft: "#A9C3F8",
  stage: "#E3ECFC",
  field: "#F1F3F6",
};

const dark: typeof light = {
  background: "#12161D",
  surface: "#1B212B",
  text: "#E8ECF2",
  textMuted: "#9AA4B4",
  border: "#2B3340",
  primary: "#6E97F2",
  onPrimary: "#0E1420",
  aiBubble: "#233352",
  accentSoft: "#3D5A94",
  stage: "#1A2538",
  field: "#1F2631",
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
