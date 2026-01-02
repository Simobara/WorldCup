import { useEffect, useState } from "react";
import StandingsBlock from "../components/1standingsComp/4standingsBlock";
import { supabase } from "../Services/supabase/supabaseClient";


const StandingsPage = () => {
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("notes_base")
        .select("key, data");

      if (error) {
        setNotes(null);
        return;
      }

      const out = {};
      for (const row of data ?? []) out[row.key] = row.data;
      setNotes(out);
    })();
  }, []);

  return (
    <div className="flex-1 min-h-[100svh] bg-gray-900 relative overflow-x-hidden overflow-y-auto">
      <StandingsBlock notes={notes} />
    </div>
  );
};

export default StandingsPage;
