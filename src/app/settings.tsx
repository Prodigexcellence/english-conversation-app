import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { BackButton, Body, Button, Card, Chips, Label, Option, Screen, Title } from "@/components/ui";
import { partners } from "@/data/partners";
import { type Language, LANGUAGE_NAMES, useI18n } from "@/i18n";
import { type Level, useProfile } from "@/state/profile";

const LEVELS = (["A1", "A2", "B1", "B2", "C1", "C2"] as Level[]).map((l) => ({ value: l, label: l }));

// Chaque langue affichée dans sa propre langue : ces noms ne se traduisent pas.
const LANGUAGE_OPTIONS = (Object.keys(LANGUAGE_NAMES) as Language[]).map((code) => ({
  value: code,
  label: LANGUAGE_NAMES[code],
}));

// E9 — Réglages
export default function SettingsScreen() {
  const { t, language } = useI18n();
  const { profile, update, saveError, signOut, deleteAccount: deleteMyAccount } = useProfile();

  // La navigation renvoie seule vers la Bienvenue dès que la session disparaît.
  const logout = () => {
    if (router.canDismiss()) router.dismissAll();
    void signOut();
  };

  const deleteAccount = () =>
    Alert.alert(t.settings.deleteTitle, t.settings.deleteBody, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.settings.deleteConfirm,
        style: "destructive",
        onPress: async () => {
          if (router.canDismiss()) router.dismissAll();
          const ok = await deleteMyAccount();
          if (!ok) Alert.alert(t.settings.deleteFailedTitle, t.settings.deleteFailedBody);
        },
      },
    ]);

  return (
    <Screen>
      <View style={styles.top}>
        <BackButton />
      </View>
      <Title>{t.settings.title}</Title>

      <Label>{t.settings.language}</Label>
      <Chips options={LANGUAGE_OPTIONS} value={language} onChange={(nativeLanguage) => update({ nativeLanguage })} />

      <Label>{t.settings.partner}</Label>
      {partners.map((p) => (
        <Option
          key={p.id}
          title={p.name}
          subtitle={t.settings.accentSubtitle(t.accents[p.accent])}
          selected={profile.partnerId === p.id}
          onPress={() => update({ partnerId: p.id })}
          left={
            <View style={styles.thumb}>
              <Image source={p.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
            </View>
          }
        />
      ))}

      <Label>{t.settings.myLevel}</Label>
      <Chips options={LEVELS} value={profile.level} onChange={(level) => update({ level, levelSource: "declare" })} />

      <Label>{t.settings.voiceSpeed}</Label>
      <Chips
        options={[
          { value: "lente", label: t.settings.speedSlow },
          { value: "normale", label: t.settings.speedNormal },
          { value: "rapide", label: t.settings.speedFast },
        ]}
        value={profile.voiceSpeed}
        onChange={(voiceSpeed) => update({ voiceSpeed })}
      />

      <Label>{t.settings.defaultInput}</Label>
      <Chips
        options={[
          { value: "voix", label: t.settings.inputVoice },
          { value: "texte", label: t.settings.inputText },
        ]}
        value={profile.defaultInput}
        onChange={(defaultInput) => update({ defaultInput })}
      />

      <Label>{t.settings.account}</Label>
      <Card>
        <Button title={t.settings.logout} variant="secondary" onPress={logout} />
        <Button title={t.settings.deleteAccount} variant="danger" onPress={deleteAccount} />
      </Card>
      {saveError ? <Body>{t.settings.saveFailed}</Body> : <Body muted>{t.settings.autosaved}</Body>}
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 8 },
  thumb: { width: 48, height: 48, borderRadius: 24, overflow: "hidden" },
  bottom: { height: 24 },
});
