import { groupMatches } from "../../START/app/0GroupMatches";
import { groupFinal } from "../../START/app/1GroupFinal";
import { citiesOsp } from "../../START/app/CitiesOsp";
import { CssHighlights } from "../../START/styles/0CssGsTs";
import { createDateLabels } from "./1createDate";
import { buildHighlightsForGroup } from "./3buildHighlightsForGroup";

/**
 * ✅ Normalizza output di buildHighlightsForGroup:
 * - se value è una stringa => { color: string, label }
 * - se value è un oggetto => { ...value, label }
 */
const withAutoGroupLabel = (highlights, groupKey) => {
  const label = groupKey.replace("group_", ""); // "group_A" -> "A", "group_" -> ""

  return Object.fromEntries(
    Object.entries(highlights).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, { color: value, label }];
      }
      return [key, { ...value, label }];
    })
  );
};

// 🎨 Mappa colori (usa classi basate su variables.css)
const GROUP_BG = {
  group_A: CssHighlights.GroupA,
  group_B: CssHighlights.GroupB,
  group_C: CssHighlights.GroupC,
  group_D: CssHighlights.GroupD,
  group_E: CssHighlights.GroupE,
  group_F: CssHighlights.GroupF,
  group_G: CssHighlights.GroupG,
  group_H: CssHighlights.GroupH,
  group_I: CssHighlights.GroupI,
  group_J: CssHighlights.GroupJ,
  group_K: CssHighlights.GroupK,
  group_L: CssHighlights.GroupL,
};

const KO_BG = {
  round32: CssHighlights.Round32,
  round16: CssHighlights.Round16,
  quarterFinals: CssHighlights.Quarter,
  semifinals: CssHighlights.Semi,
  final34: CssHighlights.Final,
  final: CssHighlights.Final,
};

// Ordini (così non ti scordi nulla)
const GROUP_KEYS = [
  "group_A",
  "group_B",
  "group_C",
  "group_D",
  "group_E",
  "group_F",
  "group_G",
  "group_H",
  "group_I",
  "group_J",
  "group_K",
  "group_L",
];

const KO_KEYS = [
  "round32",
  "round16",
  "quarterFinals",
  "semifinals",
  "final34",
  "final",
];

export const getMergedHighlights = () => {
  const titleLabels = createDateLabels();

  const buildGroup = (groupKey) =>
    withAutoGroupLabel(
      buildHighlightsForGroup(
        groupMatches[groupKey],
        titleLabels,
        citiesOsp,
        GROUP_BG[groupKey]
      ),
      groupKey
    );

  const buildKO = (koKey) =>
    withAutoGroupLabel(
      buildHighlightsForGroup(
        groupFinal[koKey],
        titleLabels,
        citiesOsp,
        KO_BG[koKey],
        true
      ),
      "group_" // knockout => label vuota
    );

  // ✅ merge finale
  return Object.assign(
    {},
    ...GROUP_KEYS.map(buildGroup),
    ...KO_KEYS.map(buildKO)
  );
};
