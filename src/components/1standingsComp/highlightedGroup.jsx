import { groupMatches } from "../../START/app/0GroupMatches";
import { groupFinal } from "../../START/app/1GroupFinal";
import { citiesOsp } from "../../START/app/CitiesOsp";
import { buildHighlightsForGroup } from "./buildHighlightsForGroup";
import { createDateLabels } from "./createDate";
// 🔹 Aggiunge automaticamente la lettera del gruppo (A, B, ...) senza perdere teams
const withAutoGroupLabel = (highlights, groupKey) => {
  const label = groupKey.replace("group_", ""); // "group_A" → "A", "group_" → ""

  return Object.fromEntries(
    Object.entries(highlights).map(([key, value]) => {
      // value può essere:
      // - stringa (vecchio caso)
      // - oggetto { color, teams }

      if (typeof value === "string") {
        return [key, { color: value, label }];
      }

      return [
        key,
        {
          ...value, // mantiene color, teams, ecc.
          label, // aggiunge lettera gruppo ("A", "B"... o "" per knockout)
        },
      ];
    })
  );
};

export const getMergedHighlights = () => {
  const titleLabels = createDateLabels();

  const highlightedCellsGroupA = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_A,
      titleLabels,
      citiesOsp,
      "bg-green-500"
    ),
    "group_A"
  );

  const highlightedCellsGroupB = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_B,
      titleLabels,
      citiesOsp,
      "bg-pink-700"
    ),
    "group_B"
  );

  const highlightedCellsGroupC = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_C,
      titleLabels,
      citiesOsp,
      "bg-yellow-500"
    ),
    "group_C"
  );

  const highlightedCellsGroupD = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_D,
      titleLabels,
      citiesOsp,
      "bg-blue-500"
    ),
    "group_D"
  );

  const highlightedCellsGroupE = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_E,
      titleLabels,
      citiesOsp,
      "bg-orange-500"
    ),
    "group_E"
  );

  const highlightedCellsGroupF = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_F,
      titleLabels,
      citiesOsp,
      "bg-green-900"
    ),
    "group_F"
  );

  const highlightedCellsGroupG = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_G,
      titleLabels,
      citiesOsp,
      "bg-purple-300"
    ),
    "group_G"
  );

  const highlightedCellsGroupH = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_H,
      titleLabels,
      citiesOsp,
      "bg-teal-400"
    ),
    "group_H"
  );

  const highlightedCellsGroupI = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_I,
      titleLabels,
      citiesOsp,
      "bg-purple-800"
    ),
    "group_I"
  );

  const highlightedCellsGroupJ = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_J,
      titleLabels,
      citiesOsp,
      "bg-rose-300"
    ),
    "group_J"
  );

  const highlightedCellsGroupK = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_K,
      titleLabels,
      citiesOsp,
      "bg-rose-500"
    ),
    "group_K"
  );

  const highlightedCellsGroupL = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupMatches.group_L,
      titleLabels,
      citiesOsp,
      "bg-pink-900"
    ),
    "group_L"
  );
  //-----------------------------------------------------|
  const highlightedCellsRoundOf32 = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupFinal.round32,
      titleLabels,
      citiesOsp,
      "bg-sky-600"
    ),
    "group_"
  );

  const highlightedCellsRoundOf16 = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupFinal.round16,
      titleLabels,
      citiesOsp,
      "bg-cyan-800"
    ),
    "group_"
  );

  const highlightedCellsQuarterFinals = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupFinal.quarterFinals,
      titleLabels,
      citiesOsp,
      "bg-sky-600"
    ),
    "group_"
  );

  const highlightedCellsSemifinals = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupFinal.semifinals,
      titleLabels,
      citiesOsp,
      "bg-cyan-800"
    ),
    "group_"
  );

  const highlightedCellsFinal34 = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupFinal.final34,
      titleLabels,
      citiesOsp,
      "bg-yellow-400"
    ),
    "group_"
  );

  const highlightedCellsFinal = withAutoGroupLabel(
    buildHighlightsForGroup(
      groupFinal.final,
      titleLabels,
      citiesOsp,
      "bg-yellow-400"
    ),
    "group_"
  );

  return {
    ...highlightedCellsGroupA,
    ...highlightedCellsGroupB,
    ...highlightedCellsGroupC,
    ...highlightedCellsGroupD,
    ...highlightedCellsGroupE,
    ...highlightedCellsGroupF,
    ...highlightedCellsGroupG,
    ...highlightedCellsGroupH,
    ...highlightedCellsGroupI,
    ...highlightedCellsGroupJ,
    ...highlightedCellsGroupK,
    ...highlightedCellsGroupL,
    ...highlightedCellsRoundOf32,
    ...highlightedCellsRoundOf16,
    ...highlightedCellsQuarterFinals,
    ...highlightedCellsSemifinals,
    ...highlightedCellsFinal34,
    ...highlightedCellsFinal,
  };
};
