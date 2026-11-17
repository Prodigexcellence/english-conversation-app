import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BackButton, Body, Button, Card, Chips, Label, Option, Screen, Title } from "@/components/ui";
import { partners } from "@/data/partners";
import { type Goal, type Level, useProfile } from "@/state/profile";
import { fonts, useColors } from "@/theme";

const LEVELS: { value: Level; label: string }[] = ["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => ({
  value: l as Level,
  label: l,
}));

const GOALS: { value: Goal; title: string; subtitle: string }[] = [
  { value: "travail", title: "Pour le travail", subtitle: "Réunions, appels, collègues étrangers" },
  { value: "voyage", title: "Pour voyager", subtitle: "Hôtel, restaurant, aéroport, rencontres" },
  { value: "examen", title: "Pour un examen", subtitle: "TOEIC, IELTS, Cambridge, oral de concours" },
  { value: "plaisir", title: "Pour le plaisir", subtitle: "Films, séries, culture, amis" },
];

const STEPS = 5;

// E3 — Onboarding : langue parlée, langue apprise et accent, partenaire, objectif, niveau.
export default function OnboardingScreen() {
  const c = useColors();
  const { profile, update } = useProfile();
  const [step, setStep] = useState(0);
  const [levelMode, setLevelMode] = useState<"test" | "declare" | null>(null);
  const [testDone, setTestDone] = useState(false);

  const back = () => {
    if (testDone) setTestDone(false);
    else if (step > 0) setStep(step - 1);
    else router.back();
  };

  const finish = () => router.replace("/home");

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
        <Title>Quelle langue veux-tu pratiquer ?</Title>
        <Option title="Anglais" selected />
        <Option title="Espagnol" soon />
        <Option title="Chinois" soon />
        <Label>Accent</Label>
        <Option
          title="Américain"
          subtitle="color, apartment, vacation"
          selected={profile.accent === "us"}
          onPress={() => update({ accent: "us" })}
        />
        <Option
          title="Britannique"
          subtitle="colour, flat, holiday"
          selected={profile.accent === "uk"}
          onPress={() => update({ accent: "uk" })}
        />
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
            subtitle={p.id === "leo" ? "Détendu et curieux" : "Chaleureux et encourageant"}
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
          subtitle="Tu pourras le changer dans les réglages."
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
        <Button title="C'est parti !" disabled={levelMode !== "declare" || !profile.level} onPress={finish} />
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
    footer = <Button title="C'est parti !" onPress={finish} />;
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  bar: { height: 8, borderRadius: 4 },
  count: { fontFamily: fonts.medium, fontSize: 14, minWidth: 32, textAlign: "right" },
  thumb: { width: 56, height: 56, borderRadius: 28, overflow: "hidden" },
  result: { alignItems: "center", paddingVertical: 28 },
  level: { fontFamily: fonts.semibold, fontSize: 56 },
});
