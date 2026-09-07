// Appel de l'Edge Function Supabase depuis l'app.
//
// L'app envoie l'historique de la conversation ; le serveur ajoute le prompt
// système et la clé API Claude, puis renvoie la réponse de l'IA.

import { config, conversationContext, isConfigured } from '../config';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Erreur « propre » : son message peut être affiché à l'utilisateur. */
export class ChatError extends Error {}

const REQUEST_TIMEOUT_MS = 30000;

export async function sendConversationTurn(
  messages: ChatMessage[],
): Promise<string> {
  if (!isConfigured) {
    throw new ChatError(
      "Configuration manquante : renseigne EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans le fichier .env, puis relance l'app.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(config.chatFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La clé anon sert de jeton d'accès à l'Edge Function.
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
      body: JSON.stringify({ messages, ...conversationContext }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ChatError('La réponse a mis trop de temps à arriver. Réessaie.');
    }
    throw new ChatError('Connexion impossible. Vérifie ta connexion internet.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new ChatError('Trop de messages d’un coup. Attends quelques secondes.');
    }
    throw new ChatError(
      `Le serveur a répondu avec une erreur (${response.status}). Vérifie le déploiement de l'Edge Function.`,
    );
  }

  const data = (await response.json()) as { reply?: string };
  if (!data.reply) {
    throw new ChatError("Réponse vide du serveur.");
  }
  return data.reply;
}
