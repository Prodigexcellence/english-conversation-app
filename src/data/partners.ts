export type Accent = "us" | "uk";

export type Partner = {
  id: "leo" | "marcus";
  name: string;
  // L'accent dépend du partenaire : il règle la voix et l'anglais de l'IA (orthographe, vocabulaire).
  accent: Accent;
  image: number;
  // Variante bouche ouverte, alternée avec `image` pendant que le personnage parle.
  talkImage?: number;
  // Yeux, en pixels de l'image (560 × 488) : des paupières couleur de peau s'y posent pour le clignement.
  eyes?: Eye[];
};

export type Eye = { x: number; y: number; w: number; h: number; skin: string };

export const PARTNER_IMAGE_SIZE = { width: 560, height: 488 };

// Noms provisoires. Images Canva (environ 560 × 490 px), rognées à l'identique pour que les variantes se superposent.
export const partners: Partner[] = [
  {
    id: "leo",
    name: "Leo",
    accent: "uk",
    image: require("@/assets/images/partners/leo.png"),
    talkImage: require("@/assets/images/partners/leo-talk.png"),
    eyes: [
      { x: 234, y: 151, w: 30, h: 16, skin: "#CD703F" },
      { x: 294, y: 136, w: 28, h: 14, skin: "#CF7541" },
    ],
  },
  {
    id: "marcus",
    name: "Marcus",
    accent: "us",
    image: require("@/assets/images/partners/marcus.png"),
    talkImage: require("@/assets/images/partners/marcus-talk.png"),
    eyes: [
      { x: 224, y: 153, w: 31, h: 14, skin: "#92532E" },
      { x: 294, y: 139, w: 30, h: 13, skin: "#8F4E29" },
    ],
  },
];

export function accentLabel(accent: Accent) {
  return accent === "uk" ? "britannique" : "américain";
}
