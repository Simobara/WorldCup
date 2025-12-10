import { buildHighlightsForGroup } from "./buildHighlightsForGroup";
import { groupMatches } from "../../START/app/0GroupMatches";
import { citiesOsp } from "../../START/app/CitiesOsp";
import { createDateLabels } from "./createDate";

export const getMergedHighlights = () => {
  const titleLabels = createDateLabels();

  const highlightedCellsGroupA = buildHighlightsForGroup(
    groupMatches.group_A,
    titleLabels,
    citiesOsp,
    "bg-green-500"
  );

  const highlightedCellsGroupB = buildHighlightsForGroup(
    groupMatches.group_B,
    titleLabels,
    citiesOsp,
    "bg-red-500"
  );

  const highlightedCellsGroupC = buildHighlightsForGroup(
    groupMatches.group_C,
    titleLabels,
    citiesOsp,
    "bg-yellow-500"
  );

  const highlightedCellsGroupD = buildHighlightsForGroup(
    groupMatches.group_D,
    titleLabels,
    citiesOsp,
    "bg-blue-500"
  );

  const highlightedCellsGroupE = buildHighlightsForGroup(
    groupMatches.group_E,
    titleLabels,
    citiesOsp,
    "bg-orange-500"
  );

  const highlightedCellsGroupF = buildHighlightsForGroup(
    groupMatches.group_F,
    titleLabels,
    citiesOsp,
    "bg-green-900"
  );

  const highlightedCellsGroupG = buildHighlightsForGroup(
    groupMatches.group_G,
    titleLabels,
    citiesOsp,
    "bg-purple-300"
  );

  const highlightedCellsGroupH = buildHighlightsForGroup(
    groupMatches.group_H,
    titleLabels,
    citiesOsp,
    "bg-teal-400"
  );

  const highlightedCellsGroupI = buildHighlightsForGroup(
    groupMatches.group_I,
    titleLabels,
    citiesOsp,
    "bg-purple-800"
  );

  const highlightedCellsGroupJ = buildHighlightsForGroup(
    groupMatches.group_J,
    titleLabels,
    citiesOsp,
    "bg-rose-300"
  );

  const highlightedCellsGroupK = buildHighlightsForGroup(
    groupMatches.group_K,
    titleLabels,
    citiesOsp,
    "bg-rose-500"
  );

  const highlightedCellsGroupL = buildHighlightsForGroup(
    groupMatches.group_L,
    titleLabels,
    citiesOsp,
    "bg-pink-900"
  );

  // ✅ MERGE TOTALE
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
  };
};
