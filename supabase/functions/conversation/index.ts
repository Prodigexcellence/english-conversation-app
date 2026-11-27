// Fonction serveur « conversation » — la SEULE pièce qui parle à Claude.
//
// Pourquoi passer par le serveur plutôt que d'appeler Claude depuis l'app :
//   1. la clé API ne quitte jamais Supabase ; personne ne peut l'extraire d'un téléphone ;
//   2. l'historique et le niveau estimé viennent de la base, pas du téléphone : un
//      utilisateur ne peut donc pas fabriquer une conversation pour se donner un niveau ;
//   3. le plafond quotidien est appliqué ici, hors de portée de l'app.
//
// Les erreurs renvoyées sont des CODES, pas des phrases : c'est l'app qui les traduit
// dans la langue de l'utilisateur (voir `src/i18n`). L'app est faite pour le monde entier.

import Anthropic from "npm:@anthropic-ai/sdk@1.14.0";
import { createClient } from "npm:@supabase/supabase-js@2.119.2";

import { buildSystemPrompt, buildTurnNote, KICKOFF, type Mode, type PartnerId } from "./prompt.ts";

// Sonnet 5.5 pour le test de niveau : il n'a lieu qu'une fois par utilisateur et doit
// être juste. Les conversations de tous les jours passeront à Haiku après comparaison
// sur de vraies conversations (DECISIONS.md, section coûts).
const MODEL = "claude-sonnet-5-5";

// Effort « low » : une réplique de conversation n'a pas besoin d'une longue réflexion.
// Moins cher ET plus rapide, ce qui compte beaucoup pour une conversation.
const EFFORT = "low";

// Réponses courtes par consigne ; cette limite n'est qu'un garde-fou.
const MAX_TOKENS = 4000;

// Plafond quotidien, en jetons, par utilisateur et par jour UTC. Généreux pour la phase
// de test ; à régler une fois les coûts réels mesurés.
const DAILY_TOKEN_LIMIT = 300_000;

// La colonne `messages.content` accepte 2000 caractères ; on reste en dessous.
const MAX_USER_TEXT = 1200;

// Mémoire bornée : au-delà, les plus anciens tours sont oubliés plutôt que refacturés
// à chaque réplique. Un résumé viendra plus tard.
const MAX_HISTORY = 40;

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Claude répond toujours dans cette forme : du texte à dire, une correction éventuelle,
// et le niveau estimé quand le test est terminé.
const REPLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "correction", "levelEstimate", "finished"],
  properties: {
    reply: {
      type: "string",
      description: "What you say out loud, in English, 1 to 3 short sentences ending with a question.",
    },
    correction: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["said", "better"],
      properties: {
        said: { type: "string", description: "The learner's exact wrong words, as short as possible." },
        better: { type: "string", description: "The natural version. No explanation." },
      },
      description: "At most one per turn, or null when nothing is worth correcting.",
    },
    levelEstimate: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["level", "explanation"],
      properties: {
        level: { type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
        explanation: {
          type: "string",
          description: "2-3 warm sentences in the learner's NATIVE language. No jargon.",
        },
      },
      description: "Only at the end of a level test. Always null otherwise.",
    },
    finished: { type: "boolean", description: "True only on the turn that closes a level test." },
  },
} as const;

type Reply = {
  reply: string;
  correction: { said: string; better: string } | null;
  levelEstimate: { level: string; explanation: string } | null;
  finished: boolean;
};

function fail(status: number, code: string, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ error: code, ...extra }), { status, headers: JSON_HEADERS });
}

function textBlock(content: { type: string; text?: string }[]): string {
  return content
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("");
}

function isReply(value: unknown): value is Reply {
  const v = value as Reply | null;
  return Boolean(v) && typeof v?.reply === "string" && v.reply.trim().length > 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: JSON_HEADERS });
  if (req.method !== "POST") return fail(405, "method_not_allowed");

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!anthropicKey) return fail(503, "ai_not_configured");
  if (!supabaseUrl || !anonKey || !serviceKey) return fail(503, "server_not_configured");

  const authorization = req.headers.get("Authorization");
  if (!authorization) return fail(401, "unauthorized");

  // Client « au nom de l'utilisateur » : la Row Level Security s'applique, donc même un
  // bug ici ne peut pas faire lire ou écrire les données de quelqu'un d'autre.
  const db = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });

  const { data: auth, error: authError } = await db.auth.getUser();
  const userId = auth?.user?.id;
  if (authError || !userId) return fail(401, "unauthorized");

  let body: { sessionId?: string; text?: string; mode?: Mode };
  try {
    body = await req.json();
  } catch {
    return fail(400, "bad_request");
  }

  const mode: Mode = body.mode === "conversation" ? "conversation" : "level_test";
  const userText = typeof body.text === "string" ? body.text.trim().slice(0, MAX_USER_TEXT) : "";

  // ── Plafond quotidien (jour UTC, comme `add_usage` côté base) ────────────────
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await db
    .from("usage_daily")
    .select("tokens_in, tokens_out")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();
  if (usage && usage.tokens_in + usage.tokens_out >= DAILY_TOKEN_LIMIT) {
    return fail(429, "daily_limit");
  }

  // ── Profil : c'est la base qui dit qui est l'utilisateur, pas le téléphone ───
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("native_language, partner_id, level, goal, goal_note")
    .eq("id", userId)
    .single();
  if (profileError || !profile) return fail(500, "profile_unavailable");

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // ── Session : on reprend celle demandée, ou on en ouvre une ──────────────────
  let sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  if (sessionId) {
    const { data: session } = await db.from("sessions").select("id, ended_at").eq("id", sessionId).maybeSingle();
    if (!session) return fail(404, "session_not_found");
    if (session.ended_at) return fail(409, "session_finished");
  } else {
    const { data: created, error: createError } = await db
      .from("sessions")
      .insert({ user_id: userId, mode })
      .select("id")
      .single();
    if (createError || !created) return fail(500, "session_not_created");
    sessionId = created.id;
    await admin.rpc("add_session_count", { p_user: userId });
  }

  // ── Historique, lu en base ───────────────────────────────────────────────────
  const { data: stored } = await db
    .from("messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY);
  const history = stored ?? [];
  const learnerTurns = history.filter((m) => m.role === "user").length;

  // Le tour d'amorçage n'est ni enregistré ni affiché : l'API exige que la
  // conversation commence par un tour « user », mais c'est le partenaire qui parle
  // en premier. Placé juste après les consignes, il ne gêne pas la mise en cache.
  const messages: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: KICKOFF },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];
  if (userText) messages.push({ role: "user", content: userText });

  const system = buildSystemPrompt({
    mode,
    partnerId: (profile.partner_id ?? "leo") as PartnerId,
    nativeLanguage: profile.native_language,
    level: profile.level,
    goal: profile.goal,
    goalNote: profile.goal_note ?? "",
  });
  const turnNote = buildTurnNote(mode, learnerTurns + (userText ? 1 : 0));

  // ── Claude ───────────────────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: anthropicKey });
  let response;
  try {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Le premier bloc ne change pas d'un tour à l'autre : mis en cache, il est
      // refacturé environ dix fois moins cher. Le second (le compteur de réponses,
      // qui lui change à chaque tour) reste hors cache, sans quoi il invaliderait
      // tout ce qui le précède — Claude met en cache un préfixe, pas des morceaux.
      system: [
        { type: "text", text: system, cache_control: { type: "ephemeral" } },
        ...(turnNote ? [{ type: "text" as const, text: turnNote }] : []),
      ],
      messages,
      output_config: { effort: EFFORT, format: { type: "json_schema", schema: REPLY_SCHEMA } },
    });
  } catch (e) {
    console.error("appel Claude impossible", e instanceof Error ? e.message : e);
    return fail(502, "ai_unavailable");
  }

  // La consommation est comptée même si la suite échoue : elle a bien été facturée.
  const used = response.usage;
  await admin.rpc("add_usage", {
    p_user: userId,
    p_tokens_in: (used?.input_tokens ?? 0) + (used?.cache_read_input_tokens ?? 0) +
      (used?.cache_creation_input_tokens ?? 0),
    p_tokens_out: used?.output_tokens ?? 0,
  });

  // Les classificateurs de sécurité peuvent refuser une demande : ce n'est pas une
  // panne, et il faut le dire calmement plutôt que d'afficher une erreur technique.
  if (response.stop_reason === "refusal") return fail(200, "refused", { sessionId });

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock(response.content as { type: string; text?: string }[]));
  } catch {
    console.error("réponse de Claude illisible", { stop_reason: response.stop_reason });
    return fail(502, "ai_unreadable", { sessionId });
  }
  if (!isReply(parsed)) {
    console.error("réponse de Claude incomplète", { stop_reason: response.stop_reason });
    return fail(502, "ai_unreadable", { sessionId });
  }
  const answer = parsed;

  // ── Enregistrement des deux tours de parole ─────────────────────────────────
  const toInsert: { session_id: string; user_id: string; role: string; content: string; input_type: string }[] = [];
  if (userText) {
    toInsert.push({ session_id: sessionId, user_id: userId, role: "user", content: userText, input_type: "text" });
  }
  toInsert.push({
    session_id: sessionId,
    user_id: userId,
    role: "assistant",
    content: answer.reply.slice(0, 2000),
    input_type: "text",
  });
  const { error: insertError } = await db.from("messages").insert(toInsert);
  if (insertError) console.error("messages non enregistrés", insertError.message);

  // ── Fin du test de niveau : le niveau vient du serveur, jamais du téléphone ──
  const estimate = mode === "level_test" ? answer.levelEstimate : null;
  if (estimate) {
    await db.from("profiles").update({ level: estimate.level, level_source: "test" }).eq("id", userId);
    await db.from("sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
  }

  return new Response(
    JSON.stringify({
      sessionId,
      reply: answer.reply,
      correction: answer.correction,
      levelEstimate: estimate,
      finished: Boolean(estimate) || answer.finished,
      // Affiché nulle part : sert à mesurer le coût réel pendant les tests.
      usage: {
        inputTokens: used?.input_tokens ?? 0,
        cachedTokens: used?.cache_read_input_tokens ?? 0,
        outputTokens: used?.output_tokens ?? 0,
      },
    }),
    { headers: JSON_HEADERS },
  );
});
