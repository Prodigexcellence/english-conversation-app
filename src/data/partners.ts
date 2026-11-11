export type Accent = "us" | "uk";

export type Partner = {
  id: "leo" | "marcus";
  name: string;
  // L'accent dépend du partenaire : il règle la voix et l'anglais de l'IA (orthographe, vocabulaire).
  accent: Accent;
  image: number;
  // Variante bouche ouverte, alternée avec `image` pendant que le personnage parle.
  talkImage?: number;
};

// Noms provisoires. Images Canva (environ 560 × 490 px), rognées à l'identique pour que les variantes se superposent.
export const partners: Partner[] = [
  {
    id: "leo",
    name: "Leo",
    accent: "uk",
    image: require("@/assets/images/partners/leo.png"),
    talkImage: require("@/assets/images/partners/leo-talk.png"),
  },
  {
    id: "marcus",
    name: "Marcus",
    accent: "us",
    image: require("@/assets/images/partners/marcus.png"),
  },
];

export function accentLabel(accent: Accent) {
  return accent === "uk" ? "britannique" : "américain";
}
