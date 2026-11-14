import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BackButton, Body, Button, Chips, Screen, Title } from "@/components/ui";
import { frenchAuthError, supabase } from "@/lib/supabase";
import { useAuth } from "@/state/auth";
import { fonts, useColors } from "@/theme";

// signup / login : formulaire ; confirm : code reçu après l'inscription ;
// forgot : demande du code ; reset : code + nouveau mot de passe.
type Mode = "signup" | "login" | "confirm" | "forgot" | "reset";

const EMAIL = /^\S+@\S+\.\S+$/;
const CODE = /^\d{6,10}$/;

// E2 — Inscription / connexion (Supabase Auth). Les e-mails contiennent un code à saisir ici :
// aucun lien à ouvrir, ce qui fonctionne aussi dans Expo Go.
export default function AuthScreen() {
  const c = useColors();
  const { setRecovering } = useAuth();
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const [mode, setMode] = useState<Mode>(params.mode === "login" ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const go = (next: Mode, message = "") => {
    setMode(next);
    setError("");
    setInfo(message);
    setCode("");
  };

  // Enchaîne une action serveur en affichant « patiente » et l'éventuelle erreur.
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(frenchAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const cleanEmail = email.trim().toLowerCase();

  const checkEmail = () => {
    if (EMAIL.test(cleanEmail)) return true;
    setError("Saisis une adresse e-mail valide, par exemple prenom@exemple.fr.");
    return false;
  };

  const checkPassword = () => {
    if (password.length >= 8) return true;
    setError("Choisis un mot de passe d'au moins 8 caractères.");
    return false;
  };

  const checkCode = () => {
    if (CODE.test(code.trim())) return true;
    setError("Saisis le code à chiffres reçu par e-mail.");
    return false;
  };

  const signup = () => {
    if (!checkEmail() || !checkPassword()) return;
    run(async () => {
      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (error) throw error;
      // Adresse déjà inscrite et confirmée : Supabase ne le dit pas par une erreur, par prudence.
      if (data.user && data.user.identities?.length === 0) {
        setError("Un compte existe déjà avec cette adresse. Utilise « Connexion ».");
        return;
      }
      // Sans session, l'adresse doit d'abord être confirmée par le code reçu.
      if (!data.session) go("confirm", `Un code vient d'être envoyé à ${cleanEmail}.`);
    });
  };

  const login = () => {
    if (!checkEmail()) return;
    if (!password) {
      setError("Saisis ton mot de passe.");
      return;
    }
    run(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error?.code === "email_not_confirmed") {
        await supabase.auth.resend({ type: "signup", email: cleanEmail });
        go("confirm", `Ton adresse n'est pas encore confirmée. Un nouveau code vient d'être envoyé à ${cleanEmail}.`);
        return;
      }
      if (error) throw error;
    });
  };

  const confirm = () => {
    if (!checkCode()) return;
    run(async () => {
      const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code.trim(), type: "email" });
      if (error) throw error;
    });
  };

  const resendSignupCode = () =>
    run(async () => {
      const { error } = await supabase.auth.resend({ type: "signup", email: cleanEmail });
      if (error) throw error;
      setInfo(`Nouveau code envoyé à ${cleanEmail}.`);
    });

  const sendResetCode = () => {
    if (!checkEmail()) return;
    run(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      setPassword("");
      go("reset", `Si un compte existe pour ${cleanEmail}, un code vient d'y être envoyé.`);
    });
  };

  const reset = () => {
    if (!checkCode() || !checkPassword()) return;
    // Le code connecte l'utilisateur : on le garde sur cet écran le temps de changer le mot de passe.
    setRecovering(true);
    run(async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code.trim(), type: "recovery" });
        if (error) throw error;
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      } catch (e) {
        await supabase.auth.signOut({ scope: "local" });
        throw e;
      } finally {
        setRecovering(false);
      }
    });
  };

  const input = [styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }];

  const emailField = (
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
        editable={!busy}
      />
    </View>
  );

  const passwordField = (label: string, onSubmit: () => void) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={input}
        placeholder={mode === "login" ? "Ton mot de passe" : "8 caractères minimum"}
        placeholderTextColor={c.textMuted}
        secureTextEntry
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        textContentType={mode === "login" ? "password" : "newPassword"}
        onSubmitEditing={onSubmit}
        accessibilityLabel={label}
        editable={!busy}
      />
    </View>
  );

  const codeField = (onSubmit: () => void) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.textMuted }]}>Code reçu par e-mail</Text>
      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
        style={[input, styles.code]}
        placeholder="123456"
        placeholderTextColor={c.textMuted}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={10}
        onSubmitEditing={onSubmit}
        accessibilityLabel="Code reçu par e-mail"
        editable={!busy}
      />
    </View>
  );

  const link = (title: string, onPress: () => void) => (
    <Pressable onPress={onPress} disabled={busy} accessibilityRole="link" hitSlop={8}>
      <Text style={[styles.link, { color: c.text }]}>{title}</Text>
    </Pressable>
  );

  let title: string;
  let content;
  let action: { title: string; onPress: () => void };

  if (mode === "signup" || mode === "login") {
    title = mode === "signup" ? "Crée ton compte" : "Content de te revoir";
    action =
      mode === "signup" ? { title: "Créer mon compte", onPress: signup } : { title: "Me connecter", onPress: login };
    content = (
      <>
        <Chips
          options={[
            { value: "signup", label: "Inscription" },
            { value: "login", label: "Connexion" },
          ]}
          value={mode}
          onChange={(m) => go(m)}
        />
        {emailField}
        {passwordField("Mot de passe", action.onPress)}
        {mode === "login" ? link("Mot de passe oublié ?", () => go("forgot")) : null}
      </>
    );
  } else if (mode === "confirm") {
    title = "Confirme ton adresse";
    action = { title: "Valider", onPress: confirm };
    content = (
      <>
        {codeField(confirm)}
        {link("Renvoyer un code", resendSignupCode)}
      </>
    );
  } else if (mode === "forgot") {
    title = "Mot de passe oublié";
    action = { title: "Recevoir un code", onPress: sendResetCode };
    content = (
      <>
        <Body muted>Saisis ton adresse : tu recevras un code pour choisir un nouveau mot de passe.</Body>
        {emailField}
      </>
    );
  } else {
    title = "Nouveau mot de passe";
    action = { title: "Changer mon mot de passe", onPress: reset };
    content = (
      <>
        {codeField(reset)}
        {passwordField("Nouveau mot de passe", reset)}
        {link("Renvoyer un code", sendResetCode)}
      </>
    );
  }

  const back = () => {
    if (mode === "forgot" || mode === "reset") go("login");
    else if (mode === "confirm") go("signup");
    else router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen footer={<Button title={busy ? "Patiente…" : action.title} onPress={action.onPress} disabled={busy} />}>
        <View style={styles.top}>
          <BackButton onPress={back} />
        </View>
        <Title>{title}</Title>
        {info ? <Body muted>{info}</Body> : null}
        {content}
        {error ? (
          <Text style={[styles.error, { color: c.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 8 },
  field: { gap: 6 },
  label: { fontFamily: fonts.medium, fontSize: 14 },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16 },
  code: { fontSize: 22, letterSpacing: 6, textAlign: "center" },
  link: { fontFamily: fonts.medium, fontSize: 15, textDecorationLine: "underline", minHeight: 44, textAlignVertical: "center" },
  error: { fontFamily: fonts.medium, fontSize: 15 },
});
