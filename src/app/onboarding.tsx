import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { BackButton, Body, Button, Card, Chips, Label, Option, Screen, Title } from "@/components/ui";
import { accentLabel, partners } from "@/data/partners";
import { type Goal, type Level, useProfile } from "@/state/profile";
import { fonts, useColors } from "@/theme";

const LEVELS: { value: Level; label: string }[] = ["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => ({
  value: l as Level,
  label: l,
}));

const GOALS: { value: Goal; title: string; subtitle?: string }[] = [
  { value: "travail", title: "Pour le travail", subtitle: "Réunions, appels, collègues étrangers" },
  { value: "voyage", title: "Pour voyager", subtitle: "Hôtel, restaurant, aéroport, rencontres" },
  { value: "examen", title: "Pour un examen", subtitle: "TOEIC, IELTS, Cambridge, oral de concours" },
  { value: "plaisir", title: "Pour le plaisir", subtitle: "Films, séries, culture, amis" },
  { value: "autre", title: "Autre" },
];

const STEPS = 5;

// E3 — Onboarding : langue parlée, langue apprise, partenaire (qui fixe l'accent), objectif, niveau.
export default function OnboardingScreen() {
  const c = useColors();
  const { profile, update, completeOnboarding, signOut } = useProfile();
  const [step, setStep] = useState(0);
  const [levelMode, setLevelMode] = useState<"test" | "declare" | null>(null);
  const [testDone, setTestDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Au premier écran, « Retour » déconnecte : l'onboarding est le seul chemin vers l'Accueil.
  const back = () => {
    if (testDone) setTestDone(false);
    else if (step > 0) setStep(step - 1);
    else void signOut();
  };

  // Le profil complet part dans Supabase ; la navigation bascule alors seule vers l'Accueil.
  const finish = async () => {
    setSaving(true);
    setError("");
    const ok = await completeOnboarding();
    setSaving(false);
    if (!ok) setError("Ton profil n'a pas pu être enregistré. Vérifie ton réseau puis réessaie.");
  };

  let content;
  let footer;

  if (step === 0) {
    content = (
      <>
        <Title>Quelle langue parles-tu ?</Title>
        <Body muted>Ton partenaire t&apos;expliquera les choses dans cette langue quand ce sera utile.</Body>
        <Option title="Français" selected />
        <Option title="Español" soon />
        <Option title="Deutsch" soon />
        <Option title="Italiano" soon />
      </>
    );
    footer = <Button title="Continuer" onPress={() => setStep(1)} />;
  } else if (step === 1) {
    content = (
      <>
        <Title>Quelle langue veux-tu apprendre ?</Title>
        <Option title="Anglais" selected />
        <Option title="Espagnol" soon />
        <Option title="Mandarin (chinois)" soon />
      </>
    );
    footer = <Button title="Continuer" onPress={() => setStep(2)} />;
  } else if (step === 2) {
    content = (
      <>
        <Title>Avec qui veux-tu parler ?</Title>
        <Body muted>Tu pourras en changer à tout moment dans les réglages.</Body>
        {partners.map((p) => (
          <Option
            key={p.id}
            title={p.name}
            subtitle={`Accent ${accentLabel(p.accent)} · ${p.id === "leo" ? "Détendu et curieux" : "Chaleureux et encourageant"}`}
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
    footer = <Button title="Continuer" onPress={() => setStep(3)} />;
  } else if (step === 3) {
    content = (
      <>
        <Title>Pourquoi apprends-tu l&apos;anglais ?</Title>
        <Body muted>Ton partenaire choisira des sujets qui te serviront.</Body>
        {GOALS.map((g) => (
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
            placeholder="Dis-nous pourquoi (facultatif)"
            placeholderTextColor={c.textMuted}
            accessibilityLabel="Dis-nous pourquoi (facultatif)"
            style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
            multiline
          />
        ) : null}
      </>
    );
    footer = <Button title="Continuer" disabled={!profile.goal} onPress={() => setStep(4)} />;
  } else if (!testDone) {
    content = (
      <>
        <Title>Quel est ton niveau ?</Title>
        <Option
          title="Faire la conversation test"
          subtitle="Environ 10 minutes. Ton partenaire discute avec toi et estime ton niveau."
          selected={levelMode === "test"}
          onPress={() => setLevelMode("test")}
        />
        <Option
          title="Je connais déjà mon niveau"
          subtitle="Sélectionne ici ton niveau. Tu pourras le changer dans les réglages."
          selected={levelMode === "declare"}
          onPress={() => setLevelMode("declare")}
        />
        {levelMode === "declare" ? (
          <>
            <Label>Mon niveau</Label>
            <Chips options={LEVELS} value={profile.level} onChange={(level) => update({ level, levelSource: "declare" })} />
            <Body muted>A1-A2 : débutant · B1-B2 : intermédiaire · C1-C2 : avancé</Body>
          </>
        ) : null}
      </>
    );
    footer =
      levelMode === "test" ? (
        <Button
          title="Commencer le test"
          onPress={() => {
            update({ level: "B1", levelSource: "test" });
            setTestDone(true);
          }}
        />
      ) : (
        <Button
          title={saving ? "Enregistrement…" : "C'est parti !"}
          disabled={saving || levelMode !== "declare" || !profile.level}
          onPress={finish}
        />
      );
  } else {
    content = (
      <>
        <Title>Ton niveau estimé</Title>
        <Card style={styles.result}>
          <Text style={[styles.level, { color: c.primary }]}>B1</Text>
          <Body center>
            Tu te fais comprendre sur des sujets du quotidien. Tes prochains progrès : les temps du passé et des phrases plus
            longues.
          </Body>
        </Card>
        <Body muted>
          Maquette : la conversation test n&apos;existe pas encore, ce résultat est un exemple. Tu pourras changer ton niveau
          dans les réglages.
        </Body>
      </>
    );
    footer = <Button title={saving ? "Enregistrement…" : "C'est parti !"} disabled={saving} onPress={finish} />;
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
  result: { alignItems: "center", paddingVertical: 28 },
  level: { fontFamily: fonts.semibold, fontSize: 56 },
  error: { fontFamily: fonts.medium, fontSize: 15 },
});
