import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BackButton, Body, Button, Chips, Screen, Title } from "@/components/ui";
import { useT } from "@/i18n";
import { authErrorMessage, supabase } from "@/lib/supabase";
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
  const t = useT();
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
      setError(authErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const cleanEmail = email.trim().toLowerCase();

  const checkEmail = () => {
    if (EMAIL.test(cleanEmail)) return true;
    setError(t.auth.invalidEmail);
    return false;
  };

  const checkPassword = () => {
    if (password.length >= 8) return true;
    setError(t.auth.shortPassword);
    return false;
  };

  const checkCode = () => {
    if (CODE.test(code.trim())) return true;
    setError(t.auth.invalidCode);
    return false;
  };

  const signup = () => {
    if (!checkEmail() || !checkPassword()) return;
    run(async () => {
      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (error) throw error;
      // Adresse déjà inscrite et confirmée : Supabase ne le dit pas par une erreur, par prudence.
      if (data.user && data.user.identities?.length === 0) {
        setError(t.authErrors.userExists);
        return;
      }
      // Sans session, l'adresse doit d'abord être confirmée par le code reçu.
      if (!data.session) go("confirm", t.auth.codeSent(cleanEmail));
    });
  };

  const login = () => {
    if (!checkEmail()) return;
    if (!password) {
      setError(t.auth.missingPassword);
      return;
    }
    run(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error?.code === "email_not_confirmed") {
        await supabase.auth.resend({ type: "signup", email: cleanEmail });
        go("confirm", t.auth.notConfirmed(cleanEmail));
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
      setInfo(t.auth.codeResent(cleanEmail));
    });

  const sendResetCode = () => {
    if (!checkEmail()) return;
    run(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      setPassword("");
      go("reset", t.auth.resetCodeSent(cleanEmail));
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
      <Text style={[styles.label, { color: c.textMuted }]}>{t.auth.emailLabel}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={input}
        placeholder={t.auth.emailPlaceholder}
        placeholderTextColor={c.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        accessibilityLabel={t.auth.emailLabel}
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
        placeholder={mode === "login" ? t.auth.passwordPlaceholderLogin : t.auth.passwordPlaceholderSignup}
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
      <Text style={[styles.label, { color: c.textMuted }]}>{t.auth.codeLabel}</Text>
      <TextInput
        value={code}
        onChangeText={(typed) => setCode(typed.replace(/\D/g, ""))}
        style={[input, styles.code]}
        placeholder={t.auth.codePlaceholder}
        placeholderTextColor={c.textMuted}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={10}
        onSubmitEditing={onSubmit}
        accessibilityLabel={t.auth.codeLabel}
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
    title = mode === "signup" ? t.auth.titleSignup : t.auth.titleLogin;
    action =
      mode === "signup"
        ? { title: t.auth.actionSignup, onPress: signup }
        : { title: t.auth.actionLogin, onPress: login };
    content = (
      <>
        <Chips
          options={[
            { value: "signup", label: t.auth.tabSignup },
            { value: "login", label: t.auth.tabLogin },
          ]}
          value={mode}
          onChange={(m) => go(m)}
        />
        {emailField}
        {passwordField(t.auth.passwordLabel, action.onPress)}
        {mode === "login" ? link(t.auth.forgotLink, () => go("forgot")) : null}
      </>
    );
  } else if (mode === "confirm") {
    title = t.auth.confirmTitle;
    action = { title: t.auth.confirmAction, onPress: confirm };
    content = (
      <>
        {codeField(confirm)}
        {link(t.auth.resendLink, resendSignupCode)}
      </>
    );
  } else if (mode === "forgot") {
    title = t.auth.forgotTitle;
    action = { title: t.auth.forgotAction, onPress: sendResetCode };
    content = (
      <>
        <Body muted>{t.auth.forgotIntro}</Body>
        {emailField}
      </>
    );
  } else {
    title = t.auth.resetTitle;
    action = { title: t.auth.resetAction, onPress: reset };
    content = (
      <>
        {codeField(reset)}
        {passwordField(t.auth.newPasswordLabel, reset)}
        {link(t.auth.resendLink, sendResetCode)}
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
      <Screen footer={<Button title={busy ? t.common.pleaseWait : action.title} onPress={action.onPress} disabled={busy} />}>
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
