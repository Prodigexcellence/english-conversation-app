import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Body, Card, IconButton, Screen, Title } from "@/components/ui";
import { accentLabel, partners } from "@/data/partners";
import { useProfile } from "@/state/profile";
import { fonts, useColors } from "@/theme";

const DAILY_MINUTES = 30;

// E4 — Accueil : Converser (actif) et Apprendre (bientôt).
export default function HomeScreen() {
  const c = useColors();
  const { profile, lastSession } = useProfile();
  const partner = partners.find((p) => p.id === profile.partnerId) ?? partners[0];
  const usedMinutes = Math.min(DAILY_MINUTES, Math.ceil((lastSession?.durationSec ?? 0) / 60));
  const left = DAILY_MINUTES - usedMinutes;
  // Titre le plus grand possible sans être coupé : 30 sur iPad, un peu moins sur un téléphone étroit.
  const { width } = useWindowDimensions();
  const cardInner = (Math.min(width, 560) - 40 - 12) / 2 - 32;
  const titleSize = Math.max(22, Math.min(30, Math.floor(cardInner / 5.6)));

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Title>Bonjour !</Title>
          <Body muted>Prêt à parler anglais ?</Body>
        </View>
        <IconButton
          name={{ ios: "gearshape", android: "settings", web: "settings" }}
          label="Réglages"
          onPress={() => router.push("/settings")}
        />
      </View>

      <View style={styles.cards}>
        <Pressable
          onPress={() => router.push("/conversation")}
          accessibilityRole="button"
          accessibilityLabel={`Converser avec ${partner.name}`}
          style={({ pressed }) => [styles.card, { backgroundColor: c.primary }, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.cardTop}>
            <View style={[styles.portrait, { borderColor: c.onPrimary }]}>
              <Image source={partner.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: c.onPrimary, fontSize: titleSize, lineHeight: titleSize + 6 }]} numberOfLines={1} adjustsFontSizeToFit>
            Converser
          </Text>
          <Text style={[styles.cardSubtitle, { color: c.onPrimary }]}>Parler avec {partner.name}</Text>
          <Text style={[styles.cardText, { color: c.onPrimary }]}>Il lance la conversation, toi tu réponds à voix haute.</Text>
          <View style={styles.spacer} />
          <View style={[styles.go, { backgroundColor: c.onPrimary }]}>
            <SymbolView name={{ ios: "mic.fill", android: "mic", web: "mic" }} size={18} tintColor={c.primary} />
            <Text style={[styles.goText, { color: c.primary }]}>Commencer</Text>
          </View>
        </Pressable>

        <View
          style={[styles.card, styles.learn, { backgroundColor: c.surface, borderColor: c.border }]}
          accessibilityState={{ disabled: true }}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.soon, { backgroundColor: c.field, color: c.textMuted }]}>Bientôt</Text>
          </View>
          <Text style={[styles.cardTitle, { color: c.text, fontSize: titleSize, lineHeight: titleSize + 6 }]} numberOfLines={1} adjustsFontSizeToFit>
            Apprendre
          </Text>
          <Text style={[styles.cardSubtitle, { color: c.text }]}>Cours avec ton professeur</Text>
          <Text style={[styles.cardText, { color: c.textMuted }]}>
            Un programme qui avance selon ton niveau : grammaire, orthographe, lexique…
          </Text>
        </View>
      </View>

      <Card>
        <View style={styles.row}>
          <Text style={[styles.progressTitle, { color: c.text }]}>Aujourd&apos;hui</Text>
          <Text style={[styles.cardValue, { color: c.textMuted }]}>
            {left} min restantes sur {DAILY_MINUTES}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: c.field }]}>
          <View style={[styles.bar, { backgroundColor: c.primary, width: `${(usedMinutes / DAILY_MINUTES) * 100}%` }]} />
        </View>
        <Body muted>
          Niveau {profile.level ?? "non défini"} · accent {accentLabel(partner.accent)}
        </Body>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16 },
  cards: { flexDirection: "row", gap: 12 },
  card: { flex: 1, borderRadius: 24, padding: 16, gap: 6, overflow: "hidden" },
  cardTop: { height: 76, alignItems: "flex-start", justifyContent: "flex-start", marginBottom: 6 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 30, lineHeight: 36 },
  cardSubtitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 21 },
  cardText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, opacity: 0.9 },
  spacer: { flex: 1, minHeight: 8 },
  go: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 22,
  },
  goText: { fontFamily: fonts.semibold, fontSize: 16 },
  portrait: { width: 76, height: 76, borderRadius: 38, overflow: "hidden", borderWidth: 3 },
  learn: { borderWidth: 1, opacity: 0.75 },
  soon: { fontFamily: fonts.medium, fontSize: 13, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" },
  progressTitle: { fontFamily: fonts.semibold, fontSize: 17 },
  cardValue: { fontFamily: fonts.regular, fontSize: 14, fontVariant: ["tabular-nums"] },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  bar: { height: 10, borderRadius: 5 },
});
