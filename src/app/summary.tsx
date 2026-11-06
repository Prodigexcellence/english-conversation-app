import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Body, Button, Card, Label, Screen, Title } from "@/components/ui";
import { partners } from "@/data/partners";
import { useProfile } from "@/state/profile";
import { fonts, useColors } from "@/theme";

// Exemples tant que l'IA ne produit pas le vrai bilan (étape 7).
const DEMO_TOPICS = ["Ton week-end", "Le cinéma", "Les films comiques"];
const DEMO_WORDS = [
  { en: "hilarious", fr: "hilarant, très drôle" },
  { en: "to recommend", fr: "recommander, conseiller" },
  { en: "funniest", fr: "le plus drôle" },
];

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

// E7 — Bilan de séance
export default function SummaryScreen() {
  const c = useColors();
  const { lastSession, profile } = useProfile();
  const partner = partners.find((p) => p.id === profile.partnerId) ?? partners[0];
  const corrections = lastSession?.corrections ?? [];

  return (
    <Screen
      footer={
        <>
          <Button title={`Reparler avec ${partner.name}`} onPress={() => router.replace("/conversation")} />
          <Button title="Retour à l'accueil" variant="secondary" onPress={() => router.dismissTo("/home")} />
        </>
      }
    >
      <View style={styles.top}>
        <Title>Bien joué !</Title>
        <Body muted>Voici ce que tu retiens de cette séance.</Body>
      </View>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={[styles.statValue, { color: c.primary }]}>{formatDuration(lastSession?.durationSec ?? 0)}</Text>
          <Text style={[styles.statLabel, { color: c.textMuted }]}>de conversation</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statValue, { color: c.primary }]}>{lastSession?.userTurns ?? 0}</Text>
          <Text style={[styles.statLabel, { color: c.textMuted }]}>réponses en anglais</Text>
        </Card>
      </View>

      <Label>Sujets abordés</Label>
      <View style={styles.tags}>
        {DEMO_TOPICS.map((t) => (
          <Text key={t} style={[styles.tag, { backgroundColor: c.aiBubble, color: c.text }]}>
            {t}
          </Text>
        ))}
      </View>

      <Label>Corrections à retenir</Label>
      <Card>
        {corrections.length === 0 ? (
          <Body muted>Aucune correction cette fois : bravo, ou parle un peu plus longtemps la prochaine fois !</Body>
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

      <Label>Mots nouveaux</Label>
      <Card>
        {DEMO_WORDS.map((w) => (
          <View key={w.en} style={styles.word}>
            <Text style={[styles.wordEn, { color: c.text }]}>{w.en}</Text>
            <Text style={[styles.wordFr, { color: c.textMuted }]}>{w.fr}</Text>
          </View>
        ))}
      </Card>
      <Body muted>Maquette : les sujets et les mots sont des exemples. Les corrections viennent de ta séance.</Body>
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
