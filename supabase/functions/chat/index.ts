// Edge Function Supabase — partenaire de conversation en anglais.
//
// Reçoit l'historique de la conversation, appelle l'API Claude avec le prompt
// système validé, et renvoie la réponse de l'IA.
//
// La clé API Claude vit ici, côté serveur (secret Supabase ANTHROPIC_API_KEY).
// Elle n'est JAMAIS envoyée à l'application mobile.

import Anthropic from "npm:@anthropic-ai/sdk@0.124.0";

const MODEL = "claude-opus-5";
const MAX_MESSAGES = 40; // garde-fou : on ne renvoie pas un historique infini
const MAX_CHARS_PER_MESSAGE = 2000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequest {
  messages?: ChatMessage[];
  nativeLanguage?: string;
  level?: string;
  recentTopics?: string;
}

// Prompt système validé en conversation manuelle (voir le brief de démarrage).
function buildSystemPrompt(
  nativeLanguage: string,
  level: string,
  recentTopics: string,
): string {
  return `You are a warm, curious English conversation partner helping the user
practice speaking English.

Context: native language ${nativeLanguage}, level ${level} (CEFR),
recent topics ${recentTopics}.

Behavior:
1. Drive the conversation — after every reply, ask a natural follow-up,
   react briefly then ask something, or pivot topic if it's exhausted.
   Never just wait passively.
2. Match the user's level (short/simple for A1-A2, natural pace for B1+).
3. Correct lightly by default: reformulate the correct version naturally
   inside your reply. Only flag a mistake explicitly if it blocks
   understanding or repeats often.
4. Keep replies short — 1-3 sentences, like a real chat, not a lecture.
5. If the user gives a flat/short answer, don't just repeat the question —
   share something or offer a new angle to unstick them.
6. Vary your openings and questions — don't reuse the same pattern twice
   in a row.`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/** Nettoie et valide l'historique reçu de l'app avant de l'envoyer à Claude. */
function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const cleaned: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS_PER_MESSAGE);
    if (text.length === 0) continue;
    cleaned.push({ role, content: text });
  }

  // L'API Claude exige que la conversation commence par un message utilisateur.
  while (cleaned.length > 0 && cleaned[0].role !== "user") cleaned.shift();
  return cleaned.length > 0 ? cleaned : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY manquant dans les secrets de la fonction");
    return jsonResponse({ error: "Server not configured" }, 500);
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const messages = parseMessages(body.messages);
  if (!messages) {
    return jsonResponse({ error: "Field 'messages' is required" }, 400);
  }

  // Valeurs fixes pour ce premier squelette : elles viendront de la base plus tard.
  const systemPrompt = buildSystemPrompt(
    body.nativeLanguage ?? "French",
    body.level ?? "A2",
    body.recentTopics ?? "none yet",
  );

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      // Réponses courtes de type chat : un effort faible garde la latence basse.
      output_config: { effort: "low" },
      system: systemPrompt,
      messages,
    });

    if (response.stop_reason === "refusal") {
      return jsonResponse({ error: "Response refused by the model" }, 422);
    }

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!reply) {
      return jsonResponse({ error: "Empty response from the model" }, 502);
    }

    return jsonResponse({ reply });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Clé API Claude invalide", error.message);
      return jsonResponse({ error: "Server not configured" }, 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return jsonResponse({ error: "Rate limited, try again shortly" }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Erreur API Claude ${error.status}`, error.message);
      return jsonResponse({ error: "Upstream model error" }, 502);
    }
    console.error("Erreur inattendue", error);
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
});
