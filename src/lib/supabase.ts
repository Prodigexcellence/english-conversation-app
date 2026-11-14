import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

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

// Messages d'erreur clairs, en français, pour les cas courants.
export function frenchAuthError(error: unknown): string {
  const e = error as { code?: string; message?: string; status?: number; name?: string } | null;
  const code = e?.code ?? "";
  const message = e?.message ?? "";
  if (code === "invalid_credentials") return "E-mail ou mot de passe incorrect.";
  if (code === "user_already_exists" || code === "email_exists")
    return "Un compte existe déjà avec cette adresse. Utilise « Connexion ».";
  if (code === "email_not_confirmed") return "Confirme d'abord ton adresse avec le code reçu par e-mail.";
  if (code === "weak_password") return "Mot de passe trop faible : 8 caractères minimum.";
  if (code === "same_password") return "Choisis un mot de passe différent de l'ancien.";
  if (code === "otp_expired" || /expired|invalid.*(otp|token)/i.test(message))
    return "Ce code n'est pas bon ou a expiré. Demande un nouveau code.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || e?.status === 429)
    return "Trop de tentatives. Patiente quelques minutes puis réessaie.";
  if (code === "email_address_invalid") return "Cette adresse e-mail n'est pas acceptée.";
  if (e?.name === "AuthRetryableFetchError" || /network|fetch/i.test(message))
    return "Connexion impossible. Vérifie ton réseau puis réessaie.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}
