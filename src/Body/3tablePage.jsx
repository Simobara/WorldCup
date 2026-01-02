import { useEffect, useState } from "react";
import { supabase } from "../Services/supabase/supabaseClient";
import TableBlock from "../components/3tableComp/0tableBlock";

// 👉 questo è il TUO componente "tabellone" (quello lungo che mi hai incollato)
// se ora si chiama già TablePage, rinominalo in TableBlock per non fare clash


const TablePage = ({ isLogged }) => {
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("notes_base").select("key, data");

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
