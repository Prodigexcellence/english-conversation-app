import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import type { Translations } from "@/i18n/fr";

// L'URL du projet et la clé publique ne sont pas secrètes : elles sont faites pour être dans l'app.
// La clé API de l'IA, elle, ne vit que dans les secrets Supabase (cahier des charges, section 4).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = createClient(url || "https://non-configure.supabase.co", key || "non-configure", {
  auth: {
    // La session est gardée sur le téléphone : on reste connecté après redémarrage.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Le jeton de connexion ne se renouvelle que pendant que l'app est au premier plan.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

// Traduit les erreurs de Supabase Auth en un message clair, dans la langue de
// l'utilisateur. Les textes vivent dans `src/i18n` ; ici on ne fait que reconnaître
// le cas. `import type` est effacé à la compilation : aucune boucle d'imports.
export function authErrorMessage(error: unknown, t: Translations): string {
  const e = error as { code?: string; message?: string; status?: number; name?: string } | null;
  const code = e?.code ?? "";
  const message = e?.message ?? "";
  const m = t.authErrors;
  if (code === "invalid_credentials") return m.invalidCredentials;
  if (code === "user_already_exists" || code === "email_exists") return m.userExists;
  if (code === "email_not_confirmed") return m.emailNotConfirmed;
  if (code === "weak_password") return m.weakPassword;
  if (code === "same_password") return m.samePassword;
  if (code === "otp_expired" || /expired|invalid.*(otp|token)/i.test(message)) return m.otpExpired;
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || e?.status === 429)
    return m.rateLimit;
  if (code === "email_address_invalid") return m.emailInvalid;
  if (e?.name === "AuthRetryableFetchError" || /network|fetch/i.test(message)) return m.network;
  return m.generic;
}
