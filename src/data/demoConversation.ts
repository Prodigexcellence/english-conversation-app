// Conversation simulée pour la maquette : aucune IA n'est encore branchée.

export type Correction = { said: string; better: string };

export type AiTurn = { text: string; correction?: Correction };

export function openingLine(partnerName: string): AiTurn {
  return { text: `Hi, I'm ${partnerName}! What did you do this weekend?` };
}

// Ce que « dit » l'utilisateur quand il maintient le bouton micro.
export const demoUserLines = [
  "I go to the cinema with my sister.",
  "We watched a comedy. It was very funny.",
  "I prefer comedies than action films.",
  "Maybe a film with Jim Carrey.",
];

export const demoAiTurns: AiTurn[] = [
  {
    text: "Nice, you went to the cinema with your sister! What did you watch?",
    correction: { said: "I go", better: "I went" },
  },
  { text: "A comedy, great choice! Do you usually prefer comedies?" },
  {
    text: "Me too, I prefer comedies to action films. What's the funniest film you've ever seen?",
    correction: { said: "prefer … than", better: "prefer … to" },
  },
  { text: "Jim Carrey is hilarious! Which of his films would you recommend to a friend?" },
];
