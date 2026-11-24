import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Body, Button, Card, Label, Screen, Title } from "@/components/ui";
import { partners } from "@/data/partners";
import { type Translations, useT } from "@/i18n";
import { useProfile } from "@/state/profile";
import { fonts, useColors } from "@/theme";

// Les sujets et les mots d'exemple vivent dans `src/i18n` : ils seront remplacés par
// le vrai bilan produit par l'IA (étape 7).

function formatDuration(sec: number, t: Translations) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const { minutesShort, secondsShort } = t.summary;
  return m > 0 ? `${m} ${minutesShort} ${s.toString().padStart(2, "0")} ${secondsShort}` : `${s} ${secondsShort}`;
}

// E7 — Bilan de séance
export default function SummaryScreen() {
  const c = useColors();
  const t = useT();
  const { lastSession, profile } = useProfile();
  const partner = partners.find((p) => p.id === profile.partnerId) ?? partners[0];
  const corrections = lastSession?.corrections ?? [];

  return (
    <Screen
      footer={
        <>
          <Button title={t.summary.speakAgain(partner.name)} onPress={() => router.replace("/conversation")} />
          <Button title={t.summary.backHome} variant="secondary" onPress={() => router.dismissTo("/home")} />
        </>
      }
    >
      <View style={styles.top}>
        <Title>{t.summary.title}</Title>
        <Body muted>{t.summary.body}</Body>
      </View>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={[styles.statValue, { color: c.primary }]}>
            {formatDuration(lastSession?.durationSec ?? 0, t)}
          </Text>
          <Text style={[styles.statLabel, { color: c.textMuted }]}>{t.summary.ofConversation}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statValue, { color: c.primary }]}>{lastSession?.userTurns ?? 0}</Text>
          <Text style={[styles.statLabel, { color: c.textMuted }]}>{t.summary.answers}</Text>
        </Card>
      </View>

      <Label>{t.summary.topics}</Label>
      <View style={styles.tags}>
        {t.summary.demoTopics.map((topic) => (
          <Text key={topic} style={[styles.tag, { backgroundColor: c.aiBubble, color: c.text }]}>
            {topic}
          </Text>
        ))}
      </View>

      <Label>{t.summary.corrections}</Label>
      <Card>
        {corrections.length === 0 ? (
          <Body muted>{t.summary.noCorrections}</Body>
        ) : (
          corrections.map((k, i) => (
            <View key={i} style={styles.correction}>
              <SymbolView
                name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }}
                size={20}
                tintColor={c.primary}
              />
              <Text style={[styles.correctionText, { color: c.text }]}>
                <Text style={{ color: c.textMuted, textDecorationLine: "line-through" }}>{k.said}</Text>
                {"  →  "}
                <Text style={{ fontFamily: fonts.semibold, color: c.primary }}>{k.better}</Text>
              </Text>
            </View>
          ))
        )}
      </Card>

      <Label>{t.summary.newWords}</Label>
      <Card>
        {t.summary.demoWords.map((w) => (
          <View key={w.en} style={styles.word}>
            <Text style={[styles.wordEn, { color: c.text }]}>{w.en}</Text>
            <Text style={[styles.wordFr, { color: c.textMuted }]}>{w.translation}</Text>
          </View>
        ))}
      </Card>
      <Body muted>{t.summary.mock}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 24, gap: 4 },
  stats: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontFamily: fonts.semibold, fontSize: 26, fontVariant: ["tabular-nums"] },
  statLabel: { fontFamily: fonts.regular, fontSize: 14, textAlign: "center" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { fontFamily: fonts.medium, fontSize: 15, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, overflow: "hidden" },
  correction: { flexDirection: "row", alignItems: "center", gap: 10 },
  correctionText: { fontFamily: fonts.regular, fontSize: 17, flexShrink: 1 },
  word: { gap: 2 },
  wordEn: { fontFamily: fonts.semibold, fontSize: 18 },
  wordFr: { fontFamily: fonts.regular, fontSize: 15 },
});
