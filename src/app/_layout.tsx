import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, useFonts } from "@expo-google-fonts/lexend";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { Body, Button, Screen, Title } from "@/components/ui";
import { I18nProvider, useT } from "@/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AuthProvider, useAuth } from "@/state/auth";
import { ProfileProvider, useProfile } from "@/state/profile";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold });

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        {/* La langue dépend du profil : I18nProvider se place donc sous ProfileProvider. */}
        <I18nProvider>
          <RootStack />
        </I18nProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

// Trois états, trois groupes d'écrans : déconnecté, onboarding à faire, prêt à converser.
// Un écran hors de son groupe est inaccessible : l'app renvoie vers `index`, qui aiguille.
function RootStack() {
  const t = useT();
  const { session, loading, recovering } = useAuth();
  const { status, onboarded, reload } = useProfile();
  const signedIn = Boolean(session) && !recovering;
  const waiting = loading || (signedIn && (status === "idle" || status === "loading"));

  useEffect(() => {
    if (!waiting) SplashScreen.hideAsync();
  }, [waiting]);

  if (!isSupabaseConfigured) {
    return (
      <Screen>
        <Title>{t.layout.missingConfigTitle}</Title>
        <Body muted>{t.layout.missingConfigBody}</Body>
      </Screen>
    );
  }

  // L'écran de démarrage reste affiché pendant la lecture de la session et du profil.
  if (waiting) return null;

  if (signedIn && status === "error") {
    return (
      <Screen footer={<Button title={t.common.retry} onPress={reload} />}>
        <Title>{t.layout.loadErrorTitle}</Title>
        <Body muted>{t.layout.loadErrorBody}</Body>
      </Screen>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="home" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="summary" />
        <Stack.Screen name="settings" />
      </Stack.Protected>
    </Stack>
  );
}
