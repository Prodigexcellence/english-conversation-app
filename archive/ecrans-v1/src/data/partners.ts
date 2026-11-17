export type Partner = {
  id: "leo" | "marcus";
  name: string;
  image: number;
  // Variante bouche ouverte, alternée avec `image` pendant que le personnage parle.
  talkImage?: number;
};

// Noms provisoires. Les images sont les aperçus Canva en attendant les originaux.
export const partners: Partner[] = [
  {
    id: "leo",
    name: "Leo",
    image: require("@/assets/images/partners/leo.png"),
    talkImage: require("@/assets/images/partners/leo-talk.png"),
  },
  {
    id: "marcus",
    name: "Marcus",
    image: require("@/assets/images/partners/marcus.png"),
  },
];
