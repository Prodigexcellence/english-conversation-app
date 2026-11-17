import { Redirect } from "expo-router";

// Maquette : l'app s'ouvre toujours sur la Bienvenue, comme pour un nouvel utilisateur.
export default function Index() {
  return <Redirect href="/welcome" />;
}
