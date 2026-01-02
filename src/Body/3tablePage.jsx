import { useEffect, useState } from "react";
import { supabase } from "../Services/supabase/supabaseClient";
import TableBlock from "../components/3tableComp/0tableBlock";

const TablePage = () => {
  const [notes, setNotes] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  // 🔐 LOGIN (IDENTICO agli altri wrapper)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLogged(!!data?.session?.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLogged(!!session?.user);
      }
    );

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // 📝 NOTES
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
      <TableBlock notes={notes} isLogged={isLogged} />
    </div>
  );
};

export default TablePage;
