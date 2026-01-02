import { useEffect, useState } from "react";
import GridRankPage from "../components/2bGroupRank/1gridRank";
import { supabase } from "../supabaseClient";

const GroupRankWrapperPage = () => {
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

  return <GridRankPage isLogged={isLogged} />;
};

export default GroupRankWrapperPage;
