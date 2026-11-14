import type { Session } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type AuthStore = {
  session: Session | null;
  // Vrai tant que la session gardée sur le téléphone n'a pas encore été relue.
  loading: boolean;
  // Vrai entre la saisie du code « mot de passe oublié » et le choix du nouveau mot de passe :
  // l'utilisateur est alors connecté, mais doit rester sur l'écran de connexion.
  recovering: boolean;
  setRecovering: (value: boolean) => void;
};

const AuthContext = createContext<AuthStore | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setRecovering(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, recovering, setRecovering }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const store = useContext(AuthContext);
  if (!store) throw new Error("useAuth doit être utilisé sous <AuthProvider>");
  return store;
}
