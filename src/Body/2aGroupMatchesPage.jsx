import { useEffect, useState } from "react";
import GridMatchesPage from "../components/2aGroupMatches/1gridMatches";
import { supabase } from "../supabaseClient";

const GroupMatchesPage = () => {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLogged(!!data.session?.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return <GridMatchesPage isLogged={isLogged} />;
};

export default GroupMatchesPage;
