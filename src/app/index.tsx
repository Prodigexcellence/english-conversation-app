import { Redirect } from "expo-router";

// Les autres écrans arrivent avec la suite de l'étape 2 : pour l'instant, l'app s'ouvre sur la Conversation.
export default function Index() {
  return <Redirect href="/conversation" />;
}
