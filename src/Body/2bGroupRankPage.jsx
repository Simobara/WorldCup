import { useEffect, useState } from "react";
import GridRankPage from "../components/2bGroupRank/1gridRank";
import { supabase } from "../Services/supabase/supabaseClient";

const GroupRankWrapperPage = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 🔵 Primo caricamento sessione
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsLogged(!!data.session?.user);
    });

    // 🟣 Listener cambi di autenticazione
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setIsLogged(!!session?.user);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <GridRankPage
      isLogged={isLogged}
      userEmail={session?.user?.email ?? null}
    />
  );
};

export default GroupRankWrapperPage;
