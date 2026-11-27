// Client léger de la fonction serveur « conversation » (supabase/functions/conversation).
//
// Rien ici ne parle à Claude directement : seule la fonction serveur a la clé. Ce module
// ne fait qu'appeler cette fonction et traduire ses codes d'erreur (voir `src/i18n`,
// `aiErrors`) dans la langue de l'utilisateur.

import { supabase } from "@/lib/supabase";
import type { Translations } from "@/i18n/fr";

export type Mode = "level_test" | "conversation";
export type Correction = { said: string; better: string };
export type LevelEstimate = { level: string; explanation: string };

export type TurnResult = {
  sessionId: string;
  reply: string;
  correction: Correction | null;
  levelEstimate: LevelEstimate | null;
  finished: boolean;
};

export class ConversationError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function sendTurn(input: { mode: Mode; sessionId?: string; text?: string }): Promise<TurnResult> {
  const { data, error } = await supabase.functions.invoke("conversation", {
    body: { mode: input.mode, sessionId: input.sessionId, text: input.text },
  });
  if (error) throw new ConversationError(await errorCode(error));
  return data as TurnResult;
}

// `functions.invoke` ne jette pas le corps JSON de l'erreur : il faut aller le lire
// sur la réponse HTTP qu'il a gardée. Sans réponse HTTP (réseau coupé), on retombe
// sur un code générique plutôt que de planter.
async function errorCode(error: { context?: Response }): Promise<string> {
  try {
    const body = await error.context?.clone().json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // Le corps n'était pas du JSON : code générique ci-dessous.
  }
  return "network";
}

const CODES: Record<string, keyof Translations["aiErrors"]> = {
  ai_not_configured: "aiNotConfigured",
  server_not_configured: "serverNotConfigured",
  unauthorized: "unauthorized",
  daily_limit: "dailyLimit",
  ai_unavailable: "aiUnavailable",
  ai_unreadable: "aiUnavailable",
  refused: "refused",
  session_finished: "sessionFinished",
};

export function conversationErrorMessage(error: unknown, t: Translations): string {
  const code = error instanceof ConversationError ? error.code : "generic";
  const key = CODES[code];
  return t.aiErrors[key ?? "generic"];
}
