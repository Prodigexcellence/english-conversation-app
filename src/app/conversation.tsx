import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PartnerAvatar, type PartnerState } from "@/components/PartnerAvatar";
import { BackButton, Body, Button, Card, Screen, Title } from "@/components/ui";
import { useT } from "@/i18n";
import { conversationErrorMessage, type Correction, type LevelEstimate, type Mode, sendTurn } from "@/lib/conversationApi";
import { speak, stopSpeaking } from "@/lib/speech";
import { useKeyboardVisible } from "@/lib/useKeyboardVisible";
import { partners } from "@/data/partners";
import { useProfile } from "@/state/profile";
import { type Colors, fonts, useColors } from "@/theme";

type Message = { id: number; role: "ai" | "user"; text: string; correction?: Correction | null };

// E6 — Conversation (vraie IA). Le même écran sert au test de niveau (depuis l'onboarding,
// `mode=level_test`) et à la pratique de tous les jours (depuis l'Accueil, sans `mode`) :
// seules les consignes données à l'IA changent, côté serveur (supabase/functions/conversation).
export default function ConversationScreen() {
  const colors = useColors();
  const t = useT();
  const s = makeStyles(colors);
  const { width, height } = useWindowDimensions();
  const avatarSize = Math.min(width * 0.36, height * 0.17, 200);
  // Le clavier d'iPad est haut : sans ça, l'avatar prenait toute la place restante et
  // la conversation disparaissait pendant la saisie (signalé après le premier test).
  const keyboardVisible = useKeyboardVisible();

  const params = useLocalSearchParams<{ mode?: Mode }>();
  const mode: Mode = params.mode === "level_test" ? "level_test" : "conversation";

  const { profile, setLastSession, completeOnboarding } = useProfile();
  const partner = partners.find((p) => p.id === profile.partnerId) ?? partners[0];
  const [startedAt] = useState(() => Date.now());
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhaseState] = useState<PartnerState>("thinking");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [result, setResult] = useState<LevelEstimate | null>(null);
  const [finishing, setFinishing] = useState(false);

  const phaseRef = useRef<PartnerState>("thinking");
  const nextId = useRef(1);
  const scrollRef = useRef<ScrollViewInstance>(null);

  const setPhase = (p: PartnerState) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const push = (m: Omit<Message, "id">) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id }]);
  };

  // Une seule place qui parle au serveur : affiche l'erreur traduite s'il y en a une,
  // sinon ajoute la réplique et la fait dire à voix haute.
  const run = async (text?: string) => {
    setError("");
    setPhase("thinking");
    try {
      const turn = await sendTurn({ mode, sessionId, text });
      setSessionId(turn.sessionId);
      push({ role: "ai", text: turn.reply, correction: turn.correction });
      setPhase("speaking");
      speak(turn.reply, partner.accent, profile.voiceSpeed, () => setPhase("idle"));
      if (turn.levelEstimate) setResult(turn.levelEstimate);
    } catch (e) {
      setError(conversationErrorMessage(e, t));
      setPhase("idle");
    }
  };

  // Le partenaire ouvre la conversation dès l'arrivée sur l'écran. Différé d'un tick :
  // `run` change l'état tout de suite (avant même d'attendre le serveur), et la règle
  // des crochets interdit de le faire en synchrone dans un effet.
  const open = useEffectEvent(() => void setTimeout(() => void run(), 0));
  const stop = useEffectEvent(() => stopSpeaking());
  useEffect(() => {
    open();
    return () => stop();
  }, []);

  const busy = phase === "thinking" || phase === "speaking";

  const onSend = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    push({ role: "user", text });
    void run(text);
  };

  // Un retour accidentel (la flèche en haut à gauche) ne doit jamais faire perdre une
  // conversation en cours sans prévenir : on ne demande qu'à partir du moment où
  // l'utilisateur a vraiment répondu une fois, pas juste entendu la phrase d'ouverture.
  const hasProgress = messages.some((m) => m.role === "user");
  const onBack = () => {
    if (!hasProgress) {
      router.back();
      return;
    }
    Alert.alert(t.conversation.leaveTitle, t.conversation.leaveBody, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.conversation.leaveConfirm,
        style: "destructive",
        onPress: () => {
          stopSpeaking();
          router.back();
        },
      },
    ]);
  };

  const onEnd = () => {
    stopSpeaking();
    setLastSession({
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      corrections: messages.flatMap((m) => (m.correction ? [m.correction] : [])),
      userTurns: messages.filter((m) => m.role === "user").length,
    });
    router.replace("/summary");
  };

  // Fin du test de niveau : le niveau est déjà enregistré côté serveur (voir
  // supabase/functions/conversation) ; il ne reste qu'à finir l'onboarding.
  const onFinishTest = async () => {
    setFinishing(true);
    const ok = await completeOnboarding();
    setFinishing(false);
    if (ok) router.replace("/home");
    else setError(t.onboarding.saveError);
  };

  if (result) {
    return (
      <Screen footer={<Button title={finishing ? t.common.saving : t.onboarding.finish} disabled={finishing} onPress={onFinishTest} />}>
        <Title>{t.onboarding.resultTitle}</Title>
        <Card style={resultStyles.card}>
          <Text style={[resultStyles.level, { color: colors.primary }]}>{result.level}</Text>
          <Body center>{result.explanation}</Body>
        </Card>
      </Screen>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.column}>
          <View style={s.header}>
            <BackButton onPress={onBack} />
            <View style={s.flex}>
              <Text style={s.name} accessibilityRole="header">
                {partner.name}
              </Text>
              <Text style={s.status}>{statusLabel(t, phase)}</Text>
            </View>
            {mode === "conversation" ? (
              <Pressable onPress={onEnd} style={({ pressed }) => [s.endButton, pressed && s.pressed]} accessibilityRole="button">
                <Text style={s.endText}>{t.conversation.end}</Text>
              </Pressable>
            ) : null}
          </View>

          {keyboardVisible ? null : (
            <View style={s.stage}>
              <PartnerAvatar partner={partner} state={phase} size={avatarSize} />
            </View>
          )}

          <View style={s.chat}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={s.chatContent}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((m) =>
                m.role === "ai" ? (
                  <View key={m.id} style={s.aiGroup}>
                    <View style={[s.bubble, s.aiBubble]}>
                      <Text style={s.aiText}>{m.text}</Text>
                    </View>
                    {m.correction ? (
                      <View style={s.correction}>
                        <SymbolView
                          name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }}
                          size={14}
                          tintColor={colors.primary}
                        />
                        <Text style={s.correctionText}>
                          {t.conversation.correctionSay} <Text style={s.correctionStrong}>{m.correction.better}</Text>{" "}
                          {t.conversation.correctionRatherThan} {m.correction.said}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View key={m.id} style={[s.bubble, s.userBubble]}>
                    <Text style={s.userText}>{m.text}</Text>
                  </View>
                ),
              )}
            </ScrollView>
          </View>

          <View style={s.dock}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={onSend}
              placeholder={t.conversation.inputPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={s.input}
              returnKeyType="send"
              editable={!busy}
              accessibilityLabel={t.conversation.writeLabel}
            />
            <Pressable
              onPress={onSend}
              disabled={busy || !draft.trim()}
              style={({ pressed }) => [s.roundButton, s.sendButton, (pressed || busy || !draft.trim()) && s.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t.conversation.send}
            >
              <SymbolView name={{ ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" }} size={22} tintColor={colors.onPrimary} />
            </Pressable>
          </View>
          {/* Le micro revient à l'étape 4b : enregistrement + transcription OpenAI. */}
          <Text style={s.hint}>{error}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function statusLabel(t: ReturnType<typeof useT>, state: PartnerState): string {
  const labels: Record<PartnerState, string> = {
    idle: t.conversation.statusIdle,
    listening: t.conversation.statusListening,
    thinking: t.conversation.statusThinking,
    speaking: t.conversation.statusSpeaking,
  };
  return labels[state];
}

const resultStyles = StyleSheet.create({
  card: { alignItems: "center", paddingVertical: 28 },
  level: { fontFamily: fonts.semibold, fontSize: 56 },
});

function makeStyles(c: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },
    column: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: 16 },
    header: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 8, paddingBottom: 6 },
    name: { fontFamily: fonts.semibold, fontSize: 22, color: c.text },
    status: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
    endButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderRadius: 22, backgroundColor: c.aiBubble },
    endText: { fontFamily: fonts.semibold, fontSize: 15, color: c.primary },
    pressed: { opacity: 0.55 },
    stage: { alignItems: "center", justifyContent: "center", backgroundColor: c.stage, borderRadius: 24, marginBottom: 12 },
    chat: { flex: 1, backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
    chatContent: { padding: 14, gap: 10 },
    bubble: { maxWidth: "84%", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
    aiGroup: { alignSelf: "flex-start", maxWidth: "84%", gap: 4 },
    aiBubble: { backgroundColor: c.aiBubble, borderBottomLeftRadius: 6, maxWidth: "100%" },
    aiText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: c.text },
    userBubble: { alignSelf: "flex-end", backgroundColor: c.primary, borderBottomRightRadius: 6 },
    userText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: c.onPrimary },
    correction: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 4 },
    correctionText: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, flexShrink: 1 },
    correctionStrong: { fontFamily: fonts.semibold, color: c.primary },
    dock: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12 },
    input: {
      flex: 1,
      minHeight: 48,
      borderRadius: 24,
      paddingHorizontal: 18,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      fontFamily: fonts.regular,
      fontSize: 16,
      color: c.text,
    },
    roundButton: { alignItems: "center", justifyContent: "center", backgroundColor: c.primary },
    sendButton: { width: 48, height: 48, borderRadius: 24 },
    hint: { fontFamily: fonts.regular, fontSize: 13, color: c.danger, textAlign: "center", paddingTop: 6, paddingBottom: 4, minHeight: 20 },
  });
}
