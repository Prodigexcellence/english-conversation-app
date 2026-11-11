import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Body, Card, IconButton, Screen, Title } from "@/components/ui";
import { partners } from "@/data/partners";
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

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Title>Bonjour !</Title>
          <Body muted>Prêt pour un peu d&apos;anglais ?</Body>
        </View>
        <IconButton
          name={{ ios: "gearshape", android: "settings", web: "settings" }}
          label="Réglages"
          onPress={() => router.push("/settings")}
        />
      </View>

      <Pressable
        onPress={() => router.push("/conversation")}
        accessibilityRole="button"
        accessibilityLabel={`Converser avec ${partner.name}`}
        style={({ pressed }) => [styles.converse, { backgroundColor: c.primary }, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.converseText}>
          <Text style={[styles.kicker, { color: c.onPrimary }]}>CONVERSER</Text>
          <Text style={[styles.converseTitle, { color: c.onPrimary }]}>Parler avec {partner.name}</Text>
          <Text style={[styles.converseSub, { color: c.onPrimary }]}>
            Il lance la conversation, toi tu réponds à voix haute.
          </Text>
          <View style={[styles.go, { backgroundColor: c.onPrimary }]}>
            <SymbolView name={{ ios: "mic.fill", android: "mic", web: "mic" }} size={18} tintColor={c.primary} />
            <Text style={[styles.goText, { color: c.primary }]}>Commencer</Text>
          </View>
        </View>
        <View style={[styles.portrait, { borderColor: c.onPrimary }]}>
          <Image source={partner.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
        </View>
      </Pressable>

      <View style={[styles.learn, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityState={{ disabled: true }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: c.textMuted }]}>APPRENDRE</Text>
          <Text style={[styles.learnTitle, { color: c.text }]}>Cours avec ton professeur</Text>
          <Text style={[styles.converseSub, { color: c.textMuted }]}>Un programme qui avance selon ton niveau.</Text>
        </View>
        <Text style={[styles.soon, { backgroundColor: c.field, color: c.textMuted }]}>Bientôt</Text>
      </View>

      <Card>
        <View style={styles.row}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Aujourd&apos;hui</Text>
          <Text style={[styles.cardValue, { color: c.textMuted }]}>
            {left} min restantes sur {DAILY_MINUTES}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: c.field }]}>
          <View style={[styles.bar, { backgroundColor: c.primary, width: `${(usedMinutes / DAILY_MINUTES) * 100}%` }]} />
        </View>
        <Body muted>
          Niveau {profile.level ?? "non défini"} · accent {profile.accent === "us" ? "américain" : "britannique"}
        </Body>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16 },
  converse: { borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden" },
  converseText: { flex: 1, gap: 6 },
  kicker: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1, opacity: 0.85 },
  converseTitle: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30 },
  converseSub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, opacity: 0.9 },
  go: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: 22,
  },
  goText: { fontFamily: fonts.semibold, fontSize: 16 },
  portrait: { width: 112, height: 112, borderRadius: 56, overflow: "hidden", borderWidth: 4 },
  learn: { borderRadius: 24, borderWidth: 1, padding: 20, flexDirection: "row", alignItems: "center", gap: 12, opacity: 0.75 },
  learnTitle: { fontFamily: fonts.semibold, fontSize: 19 },
  soon: { fontFamily: fonts.medium, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 17 },
  cardValue: { fontFamily: fonts.regular, fontSize: 14, fontVariant: ["tabular-nums"] },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  bar: { height: 10, borderRadius: 5 },
});
