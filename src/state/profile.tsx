import { createContext, type ReactNode, useContext, useState } from "react";

import type { Correction } from "@/data/demoConversation";
import type { Partner } from "@/data/partners";

export type Goal = "travail" | "voyage" | "examen" | "plaisir" | "autre";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type VoiceSpeed = "lente" | "normale" | "rapide";
export type InputMode = "voix" | "texte";

export type Profile = {
  // L'accent n'est pas stocké : il se déduit du partenaire (voir `partners`).
  partnerId: Partner["id"];
  goal: Goal | null;
  // Précision facultative quand l'objectif est « Autre ».
  goalNote: string;
  level: Level | null;
  levelSource: "test" | "declare" | null;
  voiceSpeed: VoiceSpeed;
  defaultInput: InputMode;
};

export type SessionSummary = { durationSec: number; corrections: Correction[]; userTurns: number };

const defaultProfile: Profile = {
  partnerId: "leo",
  goal: null,
  goalNote: "",
  level: null,
  levelSource: null,
  voiceSpeed: "normale",
  defaultInput: "voix",
};

type Store = {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  reset: () => void;
  lastSession: SessionSummary | null;
  setLastSession: (s: SessionSummary) => void;
};

const ProfileContext = createContext<Store | null>(null);

// Maquette : le profil vit en mémoire le temps de la visite. Il ira dans Supabase à l'étape 3.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [lastSession, setLastSession] = useState<SessionSummary | null>(null);

  const store: Store = {
    profile,
    update: (patch) => setProfile((p) => ({ ...p, ...patch })),
    reset: () => {
      setProfile(defaultProfile);
      setLastSession(null);
    },
    lastSession,
    setLastSession,
  };

  return <ProfileContext.Provider value={store}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const store = useContext(ProfileContext);
  if (!store) throw new Error("useProfile doit être utilisé sous <ProfileProvider>");
  return store;
}
