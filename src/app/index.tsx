import { Redirect } from "expo-router";

import { useAuth } from "@/state/auth";
import { useProfile } from "@/state/profile";

// Aiguillage au démarrage : Bienvenue si personne n'est connecté, onboarding s'il n'est pas fini,
// sinon l'Accueil. Le profil est relu depuis Supabase, donc il survit au redémarrage de l'app.
export default function Index() {
  const { session, recovering } = useAuth();
  const { onboarded } = useProfile();
  if (!session || recovering) return <Redirect href="/welcome" />;
  return <Redirect href={onboarded ? "/home" : "/onboarding"} />;
}
