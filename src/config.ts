// Configuration lue depuis les variables d'environnement Expo.
//
// Seules des valeurs PUBLIQUES vivent ici : l'URL du projet Supabase et la clé
// « anon ». La clé API Claude n'apparaît jamais dans l'app — elle reste dans les
// secrets de l'Edge Function.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const config = {
  supabaseUrl,
  supabaseAnonKey,
  // URL de l'Edge Function « chat » déployée sur Supabase.
  chatFunctionUrl: `${supabaseUrl}/functions/v1/chat`,
};

// Contexte de conversation figé pour ce premier squelette.
// Il viendra de la base de données (profil utilisateur) dans une phase suivante.
export const conversationContext = {
  nativeLanguage: 'French',
  level: 'A2',
  recentTopics: 'none yet',
};
