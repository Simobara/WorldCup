import { norm } from "./norm";

export function buildNameResolver(allTeams) {
  const map = new Map();

  for (const t of allTeams ?? []) {
    map.set(norm(t.name), t.name);
    map.set(norm(t.id), t.name);
    map.set(norm(t.name.replaceAll(".", "")), t.name);
  }

  // alias manuali (adatta ai tuoi nomi reali in flagsMond)
  map.set(norm("SAfrica"), "Sudafrica");
  map.set(norm("P"), ""); // placeholder: niente bandiera

  return (rawName) => map.get(norm(rawName)) ?? String(rawName).trim();
}
