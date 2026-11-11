import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Body, Button, Screen } from "@/components/ui";
import { partners } from "@/data/partners";
import { fonts, useColors } from "@/theme";

// E1 — Bienvenue
export default function WelcomeScreen() {
  const c = useColors();
  return (
    <Screen
      footer={
        <>
          <Button title="Créer un compte" onPress={() => router.push({ pathname: "/auth", params: { mode: "signup" } })} />
          <Button
            title="J'ai déjà un compte"
            variant="secondary"
            onPress={() => router.push({ pathname: "/auth", params: { mode: "login" } })}
          />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.faces}>
          {partners.map((p, i) => (
            <View
              key={p.id}
              style={[styles.face, { borderColor: c.background, marginLeft: i === 0 ? 0 : -28, zIndex: partners.length - i }]}
            >
              <Image source={p.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
            </View>
          ))}
        </View>
        <View style={[styles.bubble, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.bubbleText, { color: c.text }]}>Hi! Shall we talk?</Text>
        </View>
        <View style={styles.lockup}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Logo English Conversation"
          />
          <Text style={[styles.brand, { color: c.text }]} accessibilityRole="header">
            <Text style={{ color: c.primary }}>English</Text> Conversation
          </Text>
        </View>
        <Body muted center>
          Parle anglais avec un partenaire patient. Il lance la conversation, relance toujours et corrige en douceur.
        </Body>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 18, paddingTop: 48, paddingBottom: 24 },
  faces: { flexDirection: "row" },
  face: { width: 128, height: 128, borderRadius: 64, overflow: "hidden", borderWidth: 5 },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    marginTop: -6,
  },
  bubbleText: { fontFamily: fonts.medium, fontSize: 16 },
  lockup: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" },
  logo: { width: 52, height: 52 },
  brand: { fontFamily: fonts.semibold, fontSize: 32, textAlign: "center" },
});
