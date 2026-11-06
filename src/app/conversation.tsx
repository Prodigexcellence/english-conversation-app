import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { type AiTurn, type Correction, demoAiTurns, demoUserLines, openingLine } from "@/data/demoConversation";
import { partners } from "@/data/partners";
import { type Colors, fonts, useColors } from "@/theme";

type Message = { id: number; role: "ai" | "user"; text: string; correction?: Correction };

const STATUS: Record<PartnerState, string> = {
  idle: "à toi de parler",
  listening: "t'écoute…",
  thinking: "réfléchit…",
  speaking: "parle…",
};

export default function ConversationScreen() {
  const colors = useColors();
  const s = makeStyles(colors);
  const { width, height } = useWindowDimensions();
  const avatarSize = Math.min(width * 0.36, height * 0.17, 200);

  const [partnerIndex, setPartnerIndex] = useState(0);
  const partner = partners[partnerIndex];
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhaseState] = useState<PartnerState>("idle");
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState("");

  const phaseRef = useRef<PartnerState>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(1);
  const aiIndex = useRef(0);
  const userIndex = useRef(0);
  const pressStart = useRef(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  const setPhase = (p: PartnerState) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Pas de `ref.current++` ici : le React Compiler le traduit mal (le compteur avance avant d'être lu).
  const takeNext = (counter: { current: number }) => {
    const value = counter.current;
    counter.current = value + 1;
    return value;
  };

  const push = (m: Omit<Message, "id">) => {
    const id = takeNext(nextId);
    setMessages((list) => [...list, { ...m, id }]);
  };

  // L'IA « réfléchit », écrit sa réponse, puis la « lit » le temps qu'il faut pour la dire.
  const aiRespond = useCallback((turn: AiTurn) => {
    setPhase("thinking");
    later(1100, () => {
      push({ role: "ai", text: turn.text, correction: turn.correction });
      setPhase("speaking");
      later(Math.max(1600, turn.text.length * 55), () => setPhase("idle"));
    });
  }, []);

  const nextAiTurn = () => demoAiTurns[takeNext(aiIndex) % demoAiTurns.length];

  // L'IA ouvre la conversation, à l'arrivée sur l'écran et après chaque changement de partenaire.
  useEffect(() => {
    later(500, () => aiRespond(openingLine(partner.name)));
    return clearTimers;
  }, [partner.name, aiRespond]);

  const switchPartner = () => {
    clearTimers();
    setMessages([]);
    setHint("");
    setDraft("");
    aiIndex.current = 0;
    userIndex.current = 0;
    setPhase("idle");
    setPartnerIndex((i) => (i + 1) % partners.length);
  };

  const busy = phase === "thinking" || phase === "speaking";

  const onMicIn = () => {
    if (phaseRef.current === "thinking" || phaseRef.current === "speaking") return;
    setHint("");
    pressStart.current = Date.now();
    setPhase("listening");
  };

  const onMicOut = () => {
    if (phaseRef.current !== "listening") return;
    if (Date.now() - pressStart.current < 350) {
      setPhase("idle");
      setHint("Garde le doigt sur le micro pendant que tu parles.");
      return;
    }
    push({ role: "user", text: demoUserLines[takeNext(userIndex) % demoUserLines.length] });
    aiRespond(nextAiTurn());
  };

  const onSend = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    setHint("");
    push({ role: "user", text });
    aiRespond(nextAiTurn());
  };

  const onEnd = () =>
    Alert.alert("Terminer la séance ?", "Le bilan de séance arrivera dans une prochaine maquette.", [
      { text: "Continuer à parler", style: "cancel" },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.column}>
          <View style={s.header}>
            <View style={s.flex}>
              <Text style={s.name} accessibilityRole="header">
                {partner.name}
              </Text>
              <Text style={s.status}>{STATUS[phase]}</Text>
            </View>
            <Pressable
              onPress={switchPartner}
              style={({ pressed }) => [s.pill, pressed && s.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Changer de partenaire de conversation"
            >
              <SymbolView name={{ ios: "arrow.triangle.2.circlepath", android: "sync", web: "sync" }} size={16} tintColor={colors.textMuted} />
              <Text style={s.pillText}>Changer</Text>
            </Pressable>
            <Pressable onPress={onEnd} style={({ pressed }) => [s.endButton, pressed && s.pressed]} accessibilityRole="button">
              <Text style={s.endText}>Terminer</Text>
            </Pressable>
          </View>

          <View style={s.stage}>
            <PartnerAvatar partner={partner} state={phase} size={avatarSize} />
          </View>

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
                          On dit <Text style={s.correctionStrong}>{m.correction.better}</Text> plutôt que{" "}
                          {m.correction.said}
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
              {phase === "listening" ? (
                <View style={[s.bubble, s.userBubble, s.listeningBubble]}>
                  <Text style={s.userText}>Je t&apos;écoute…</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>

          <View style={s.dock}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={onSend}
              placeholder="Écrire en anglais…"
              placeholderTextColor={colors.textMuted}
              style={s.input}
              returnKeyType="send"
              accessibilityLabel="Écrire un message"
            />
            {draft.trim() ? (
              <Pressable
                onPress={onSend}
                disabled={busy}
                style={({ pressed }) => [s.roundButton, s.sendButton, (pressed || busy) && s.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Envoyer"
              >
                <SymbolView name={{ ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" }} size={22} tintColor={colors.onPrimary} />
              </Pressable>
            ) : (
              <Pressable
                onPressIn={onMicIn}
                onPressOut={onMicOut}
                disabled={busy}
                style={[s.roundButton, s.micButton, phase === "listening" && s.micActive, busy && s.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Maintenir pour parler"
              >
                <SymbolView name={{ ios: "mic.fill", android: "mic", web: "mic" }} size={28} tintColor={colors.onPrimary} />
              </Pressable>
            )}
          </View>
          <Text style={s.hint}>{hint || (busy ? " " : "Maintiens le micro pour parler, ou écris ta réponse.")}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },
    column: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: 16 },
    header: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 8, paddingBottom: 6 },
    name: { fontFamily: fonts.semibold, fontSize: 22, color: c.text },
    status: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 22,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillText: { fontFamily: fonts.medium, fontSize: 14, color: c.textMuted },
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
    listeningBubble: { opacity: 0.6 },
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
    micButton: { width: 68, height: 68, borderRadius: 34 },
    micActive: { transform: [{ scale: 1.1 }] },
    hint: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, textAlign: "center", paddingTop: 6, paddingBottom: 4 },
  });
}
