import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import StandingsBlock from "../components/1standingsComp/4standingsBlock";

const StandingsPage = () => {
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("notes_base")
        .select("data")
        .eq("key", "groupNotesMond26")
        .single();

      if (!error) setNotes(data.data);
    })();
  }, []);

  return (
    <div className="flex-1 min-h-[100svh] bg-gray-900 relative overflow-x-hidden overflow-y-auto">
      <StandingsBlock notes={notes} />
    </div>
  );
};

export default StandingsPage;
