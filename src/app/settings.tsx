import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { BackButton, Body, Button, Card, Chips, Label, Option, Screen, Title } from "@/components/ui";
import { accentLabel, partners } from "@/data/partners";
import { type Level, useProfile } from "@/state/profile";

const LEVELS = (["A1", "A2", "B1", "B2", "C1", "C2"] as Level[]).map((l) => ({ value: l, label: l }));

// E9 — Réglages
export default function SettingsScreen() {
  const { profile, update, saveError, signOut, deleteAccount: deleteMyAccount } = useProfile();

  // La navigation renvoie seule vers la Bienvenue dès que la session disparaît.
  const logout = () => {
    if (router.canDismiss()) router.dismissAll();
    void signOut();
  };

  const deleteAccount = () =>
    Alert.alert(
      "Supprimer ton compte ?",
      "Ton profil, tes conversations et tes bilans seront effacés définitivement. Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (router.canDismiss()) router.dismissAll();
            const ok = await deleteMyAccount();
            if (!ok) Alert.alert("Suppression impossible", "Vérifie ton réseau puis réessaie.");
          },
        },
      ],
    );

  return (
    <Screen>
      <View style={styles.top}>
        <BackButton />
      </View>
      <Title>Réglages</Title>

      <Label>Partenaire de conversation</Label>
      {partners.map((p) => (
        <Option
          key={p.id}
          title={p.name}
          subtitle={`Accent ${accentLabel(p.accent)}`}
          selected={profile.partnerId === p.id}
          onPress={() => update({ partnerId: p.id })}
          left={
            <View style={styles.thumb}>
              <Image source={p.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
            </View>
          }
        />
      ))}

      <Label>Mon niveau</Label>
      <Chips options={LEVELS} value={profile.level} onChange={(level) => update({ level, levelSource: "declare" })} />

      <Label>Vitesse de la voix</Label>
      <Chips
        options={[
          { value: "lente", label: "Lente" },
          { value: "normale", label: "Normale" },
          { value: "rapide", label: "Rapide" },
        ]}
        value={profile.voiceSpeed}
        onChange={(voiceSpeed) => update({ voiceSpeed })}
      />

      <Label>Pour répondre, par défaut</Label>
      <Chips
        options={[
          { value: "voix", label: "Je parle" },
          { value: "texte", label: "J'écris" },
        ]}
        value={profile.defaultInput}
        onChange={(defaultInput) => update({ defaultInput })}
      />

      <Label>Compte</Label>
      <Card>
        <Button title="Me déconnecter" variant="secondary" onPress={logout} />
        <Button title="Supprimer mon compte" variant="danger" onPress={deleteAccount} />
      </Card>
      {saveError ? <Body>{saveError}</Body> : <Body muted>Tes réglages sont enregistrés automatiquement.</Body>}
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 8 },
  thumb: { width: 48, height: 48, borderRadius: 24, overflow: "hidden" },
  bottom: { height: 24 },
});
