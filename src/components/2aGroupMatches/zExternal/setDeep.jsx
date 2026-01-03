export function setDeep(obj, path, value) {
  const parts = path.split(".");
  const out = structuredClone(obj);
  let cur = out;

  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    cur[k] = cur[k] ?? {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return out;
}