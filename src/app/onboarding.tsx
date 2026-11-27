import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { BackButton, Body, Button, Chips, Label, Option, Screen, Title } from "@/components/ui";
import { partners } from "@/data/partners";
import { type Language, LANGUAGE_NAMES, PLANNED_LANGUAGES, type Translations, useI18n } from "@/i18n";
import { type Goal, type Level, useProfile } from "@/state/profile";
import { fonts, useColors } from "@/theme";

const LEVELS: { value: Level; label: string }[] = ["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => ({
  value: l as Level,
  label: l,
}));

// Les langues traduites, dans l'ordre du catalogue.
const UI_LANGUAGES = Object.keys(LANGUAGE_NAMES) as Language[];

function goalOptions(t: Translations): { value: Goal; title: string; subtitle?: string }[] {
  return [
    { value: "travail", title: t.onboarding.goalWork, subtitle: t.onboarding.goalWorkSub },
    { value: "voyage", title: t.onboarding.goalTravel, subtitle: t.onboarding.goalTravelSub },
    { value: "examen", title: t.onboarding.goalExam, subtitle: t.onboarding.goalExamSub },
    { value: "plaisir", title: t.onboarding.goalFun, subtitle: t.onboarding.goalFunSub },
    { value: "autre", title: t.onboarding.goalOther },
  ];
}

const STEPS = 5;

// E3 — Onboarding : langue parlée, langue apprise, partenaire (qui fixe l'accent), objectif, niveau.
export default function OnboardingScreen() {
  const c = useColors();
  const { t, language } = useI18n();
  const { profile, update, completeOnboarding, signOut } = useProfile();
  const [step, setStep] = useState(0);
  const [levelMode, setLevelMode] = useState<"test" | "declare" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Au premier écran, « Retour » déconnecte : l'onboarding est le seul chemin vers l'Accueil.
  const back = () => {
    if (step > 0) setStep(step - 1);
    else void signOut();
  };

  // Le profil complet part dans Supabase ; la navigation bascule alors seule vers l'Accueil.
  const finish = async () => {
    setSaving(true);
    setError("");
    const ok = await completeOnboarding();
    setSaving(false);
    if (!ok) setError(t.onboarding.saveError);
  };

  let content;
  let footer;

  if (step === 0) {
    content = (
      <>
        <Title>{t.onboarding.nativeTitle}</Title>
        <Body muted>{t.onboarding.nativeBody}</Body>
        {/* La langue de l'appareil est pré-sélectionnée : l'écran s'affiche déjà dans
            la bonne langue avant que l'utilisateur ait touché à quoi que ce soit. */}
        {UI_LANGUAGES.map((code) => (
          <Option
            key={code}
            title={LANGUAGE_NAMES[code]}
            selected={language === code}
            onPress={() => update({ nativeLanguage: code })}
          />
        ))}
        {PLANNED_LANGUAGES.map((name) => (
          <Option key={name} title={name} soon />
        ))}
      </>
    );
    // On enregistre même sans choix explicite, pour que la langue survive à un
    // changement de réglages de l'appareil.
    footer = (
      <Button
        title={t.common.continue}
        onPress={() => {
          update({ nativeLanguage: language });
          setStep(1);
        }}
      />
    );
  } else if (step === 1) {
    content = (
      <>
        <Title>{t.onboarding.targetTitle}</Title>
        <Option title={t.onboarding.targetEnglish} selected />
        <Option title={t.onboarding.targetSpanish} soon />
        <Option title={t.onboarding.targetMandarin} soon />
      </>
    );
    footer = <Button title={t.common.continue} onPress={() => setStep(2)} />;
  } else if (step === 2) {
    content = (
      <>
        <Title>{t.onboarding.partnerTitle}</Title>
        <Body muted>{t.onboarding.partnerBody}</Body>
        {partners.map((p) => (
          <Option
            key={p.id}
            title={p.name}
            subtitle={t.onboarding.partnerSubtitle(
              t.accents[p.accent],
              p.id === "leo" ? t.onboarding.leoTrait : t.onboarding.marcusTrait,
            )}
            selected={profile.partnerId === p.id}
            onPress={() => update({ partnerId: p.id })}
            left={
              <View style={styles.thumb}>
                <Image source={p.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
              </View>
            }
          />
        ))}
      </>
    );
    footer = <Button title={t.common.continue} onPress={() => setStep(3)} />;
  } else if (step === 3) {
    content = (
      <>
        <Title>{t.onboarding.goalTitle}</Title>
        <Body muted>{t.onboarding.goalBody}</Body>
        {goalOptions(t).map((g) => (
          <Option
            key={g.value}
            title={g.title}
            subtitle={g.subtitle}
            selected={profile.goal === g.value}
            onPress={() => update({ goal: g.value })}
          />
        ))}
        {profile.goal === "autre" ? (
          <TextInput
            value={profile.goalNote}
            onChangeText={(goalNote) => update({ goalNote })}
            placeholder={t.onboarding.goalNotePlaceholder}
            placeholderTextColor={c.textMuted}
            accessibilityLabel={t.onboarding.goalNotePlaceholder}
            style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
            multiline
          />
        ) : null}
      </>
    );
    footer = <Button title={t.common.continue} disabled={!profile.goal} onPress={() => setStep(4)} />;
  } else {
    content = (
      <>
        <Title>{t.onboarding.levelTitle}</Title>
        <Option
          title={t.onboarding.levelTestOption}
          subtitle={t.onboarding.levelTestOptionSub}
          selected={levelMode === "test"}
          onPress={() => setLevelMode("test")}
        />
        <Option
          title={t.onboarding.levelDeclareOption}
          subtitle={t.onboarding.levelDeclareOptionSub}
          selected={levelMode === "declare"}
          onPress={() => setLevelMode("declare")}
        />
        {levelMode === "declare" ? (
          <>
            <Label>{t.onboarding.myLevel}</Label>
            <Chips options={LEVELS} value={profile.level} onChange={(level) => update({ level, levelSource: "declare" })} />
            <Body muted>{t.onboarding.levelScale}</Body>
          </>
        ) : null}
      </>
    );
    footer =
      levelMode === "test" ? (
        // Le test se passe sur l'écran de conversation (mode `level_test`) : même code
        // que la pratique de tous les jours, seules les consignes données à l'IA changent.
        // Il enregistre lui-même le niveau et termine l'onboarding à la fin du test.
        <Button title={t.onboarding.startTest} onPress={() => router.push({ pathname: "/conversation", params: { mode: "level_test" } })} />
      ) : (
        <Button
          title={saving ? t.common.saving : t.onboarding.finish}
          disabled={saving || levelMode !== "declare" || !profile.level}
          onPress={finish}
        />
      );
  }

  const progress = Math.min(step + 1, STEPS) / STEPS;

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        <BackButton onPress={back} />
        <View style={[styles.track, { backgroundColor: c.border }]}>
          <View style={[styles.bar, { backgroundColor: c.primary, width: `${progress * 100}%` }]} />
        </View>
        <Text style={[styles.count, { color: c.textMuted }]}>
          {Math.min(step + 1, STEPS)}/{STEPS}
        </Text>
      </View>
      {content}
      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  bar: { height: 8, borderRadius: 4 },
  count: { fontFamily: fonts.medium, fontSize: 14, minWidth: 32, textAlign: "right" },
  thumb: { width: 56, height: 56, borderRadius: 28, overflow: "hidden" },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  error: { fontFamily: fonts.medium, fontSize: 15 },
});
