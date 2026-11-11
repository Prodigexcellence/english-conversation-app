import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BackButton, Body, Button, Chips, Screen, Title } from "@/components/ui";
import { fonts, useColors } from "@/theme";

type Mode = "signup" | "login";

// E2 — Inscription / connexion. Maquette : rien n'est encore envoyé à un serveur.
export default function AuthScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const [mode, setMode] = useState<Mode>(params.mode === "login" ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Saisis une adresse e-mail valide, par exemple prenom@exemple.fr.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Choisis un mot de passe d'au moins 8 caractères.");
      return;
    }
    if (mode === "login" && !password) {
      setError("Saisis ton mot de passe.");
      return;
    }
    setError("");
    router.replace(mode === "signup" ? "/onboarding" : "/home");
  };

  const forgot = () =>
    Alert.alert("Mot de passe oublié", "Dans l'app finale, tu recevras un e-mail pour choisir un nouveau mot de passe.");

  const input = [styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen footer={<Button title={mode === "signup" ? "Créer mon compte" : "Me connecter"} onPress={submit} />}>
        <View style={styles.top}>
          <BackButton />
        </View>
        <Title>{mode === "signup" ? "Crée ton compte" : "Content de te revoir"}</Title>
        <Chips
          options={[
            { value: "signup", label: "Inscription" },
            { value: "login", label: "Connexion" },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError("");
          }}
        />
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textMuted }]}>Adresse e-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={input}
            placeholder="prenom@exemple.fr"
            placeholderTextColor={c.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            accessibilityLabel="Adresse e-mail"
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textMuted }]}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={input}
            placeholder={mode === "signup" ? "8 caractères minimum" : "Ton mot de passe"}
            placeholderTextColor={c.textMuted}
            secureTextEntry
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            textContentType={mode === "signup" ? "newPassword" : "password"}
            onSubmitEditing={submit}
            accessibilityLabel="Mot de passe"
          />
        </View>
        {mode === "login" ? (
          <Pressable onPress={forgot} accessibilityRole="link" hitSlop={8}>
            <Text style={[styles.link, { color: c.primary }]}>Mot de passe oublié ?</Text>
          </Pressable>
        ) : null}
        {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
        <Body muted>Maquette : aucun compte n&apos;est créé pour l&apos;instant, tu peux saisir n&apos;importe quelle adresse.</Body>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 8 },
  field: { gap: 6 },
  label: { fontFamily: fonts.medium, fontSize: 14 },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16 },
  link: { fontFamily: fonts.medium, fontSize: 15 },
  error: { fontFamily: fonts.medium, fontSize: 15 },
});
