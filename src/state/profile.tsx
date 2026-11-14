import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

import type { Correction } from "@/data/demoConversation";
import { type Partner, partners } from "@/data/partners";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/state/auth";

export type Goal = "travail" | "voyage" | "examen" | "plaisir" | "autre";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type VoiceSpeed = "lente" | "normale" | "rapide";
export type InputMode = "voix" | "texte";

export type Profile = {
  // L'accent se déduit du partenaire (voir `partners`) ; il est recopié en base pour le serveur.
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

// Ligne de la table `profiles` (supabase/migrations).
type ProfileRow = {
  partner_id: Partner["id"];
  accent: "us" | "uk";
  goal: Goal | null;
  goal_note: string;
  level: Level | null;
  level_source: "test" | "declare" | null;
  voice_speed: VoiceSpeed;
  default_input: InputMode;
  onboarded_at: string | null;
};

const COLUMNS = "partner_id, accent, goal, goal_note, level, level_source, voice_speed, default_input, onboarded_at";

function fromRow(row: ProfileRow): Profile {
  return {
    partnerId: row.partner_id,
    goal: row.goal,
    goalNote: row.goal_note,
    level: row.level,
    levelSource: row.level_source,
    voiceSpeed: row.voice_speed,
    defaultInput: row.default_input,
  };
}

function toRow(patch: Partial<Profile>): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {};
  if (patch.partnerId !== undefined) {
    row.partner_id = patch.partnerId;
    row.accent = partners.find((p) => p.id === patch.partnerId)?.accent ?? "us";
  }
  if (patch.goal !== undefined) row.goal = patch.goal;
  if (patch.goalNote !== undefined) row.goal_note = patch.goalNote;
  if (patch.level !== undefined) row.level = patch.level;
  if (patch.levelSource !== undefined) row.level_source = patch.levelSource;
  if (patch.voiceSpeed !== undefined) row.voice_speed = patch.voiceSpeed;
  if (patch.defaultInput !== undefined) row.default_input = patch.defaultInput;
  return row;
}

type Store = {
  profile: Profile;
  // « loading » : lecture du profil en cours ; « error » : lecture impossible (réseau).
  status: "idle" | "loading" | "ready" | "error";
  onboarded: boolean;
  // Dernière erreur d'enregistrement, affichée à l'écran tant qu'elle n'est pas corrigée.
  saveError: string | null;
  update: (patch: Partial<Profile>) => void;
  completeOnboarding: () => Promise<boolean>;
  reload: () => void;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  lastSession: SessionSummary | null;
  setLastSession: (s: SessionSummary) => void;
};

const ProfileContext = createContext<Store | null>(null);

const SAVE_ERROR = "Ton choix n'a pas pu être enregistré. Vérifie ton réseau puis réessaie.";

// Un état neuf par compte : à la déconnexion (ou changement de compte), tout repart de zéro.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  return (
    <ProfileStore key={userId ?? "anonyme"} userId={userId}>
      {children}
    </ProfileStore>
  );
}

function ProfileStore({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [status, setStatus] = useState<Store["status"]>(userId ? "loading" : "idle");
  const [onboarded, setOnboarded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<SessionSummary | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Le profil est relu depuis Supabase à chaque connexion (et donc après chaque redémarrage).
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select(COLUMNS)
      .eq("id", userId)
      .single<ProfileRow>()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setStatus("error");
          return;
        }
        setProfile(fromRow(data));
        setOnboarded(Boolean(data.onboarded_at));
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const save = useCallback(
    async (row: Partial<ProfileRow>) => {
      if (!userId) return false;
      const { error } = await supabase.from("profiles").update(row).eq("id", userId);
      setSaveError(error ? SAVE_ERROR : null);
      return !error;
    },
    [userId],
  );

  const store: Store = {
    profile,
    status,
    onboarded,
    saveError,
    // L'écran change tout de suite ; l'enregistrement suit en arrière-plan.
    update: (patch) => {
      setProfile((p) => ({ ...p, ...patch }));
      void save(toRow(patch));
    },
    // Enregistre tout le profil d'un coup, puis ouvre l'accueil.
    completeOnboarding: async () => {
      const ok = await save({ ...toRow(profile), onboarded_at: new Date().toISOString() });
      if (ok) setOnboarded(true);
      return ok;
    },
    reload: () => {
      setStatus("loading");
      setAttempt((n) => n + 1);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    deleteAccount: async () => {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) return false;
      await supabase.auth.signOut({ scope: "local" });
      return true;
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
