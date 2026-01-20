import "./variables.css";

export const CssCities = {
  Sky:   "bg-[var(--city-sky)]",
  Green: "bg-[var(--city-green)]",
  Rose:  "bg-[var(--city-rose)]",
};
export const CssGroupLetter = {
  Text: "text-[var(--group-letter-text)]",
};

export const CssQuad = {
  // background per fase  
  BgRound32:  "bg-[var(--quad-bg-round32)]",
  BgRound16:  "bg-[var(--quad-bg-round16)]",
  BgQuarter:  "bg-[var(--quad-bg-quarter)]",
  BgSemi:     "bg-[var(--quad-bg-semi)]",
  BgFinal:    "bg-[var(--quad-bg-final)]",
  // bordi (highlight) 
  BorderWin:      "border-[var(--quad-border-win)]",
  BorderDraw:     "border-[var(--quad-border-draw)]",
  BorderPron:     "border-[var(--quad-border-pron)]",
  BorderPronDraw: "border-[var(--quad-border-pron-draw)]",
  BorderDefault:  "border-[var(--quad-border-default)]",
  BorderWinProvisional: "border-purple-500/80",
  BorderDrawProvisional: "border-green-500/80",
}

export const CssRettRis = {
  Ris:   "text-[var(--rettris-ris)]",
  Ts:    "text-[var(--rettris-ts)]",
  Pen:   "text-[var(--rettris-pen)]",
  Title: "text-[var(--rettris-title)]",
};

export const CssRow7 = {
  // celle base (CODICE / SQUADRA / W X P)
  CellBg:     "bg-[var(--row7-bg-cell)]",
  CellBorder: "border-[var(--row7-border-cell)]",
  CodeText:   "text-[var(--row7-text-code)]",
  // punti
  PtBg:       "bg-[var(--row7-pt-bg)]",
  PtBorder:   "border-[var(--row7-pt-border)]",
  PtText:     "text-[var(--row7-pt-text)]",
  PtPronText: "text-[var(--row7-pt-pron-text)]",
  // gol
  GolBg:      "bg-[var(--row7-gol-bg)]",
  GolText:    "text-[var(--row7-gol-text)]",
  BottomLine: "border-b-[var(--row7-bottom-border)]",
  // W X P testo
  WxpText:    "text-[var(--row7-wxp-text)]",
};

export const CssHeader7 = {
  Bg:     "bg-[var(--header7-bg)]",
  Border: "border-[var(--header7-border)]",
  Text:   "text-[var(--group-header-text)]",
};

export const CssGroup = {
  Bg:     "bg-[var(--group-bg)]",
  Border: "border-[var(--group-border)]",
};

export const CssMatchGrid = {
  // Header
  HeadBg:     "bg-[var(--mhead-bg)]",
  HeadBorder: "border-[var(--mhead-border)]",
  HeadText:   "text-[var(--group-header-text)]",
  // Celle base
  CellBg:     "bg-[var(--mcell-bg)]",
  CellBorder: "border-[var(--mcell-border)]",
  CellText:   "text-[var(--mcell-text)]",
  CellSqText: "text-[var(--mcell-sq-text)]",
  // RIS cell
  RisBg:      "bg-[var(--mris-bg)]",
  RisBorder:  "border-[var(--mris-border)]",
  RisText:    "text-[var(--mris-text)]",
  // ✅ Active DESKTOP
  ActiveMdBg:   "md:bg-[var(--mactive-md-bg)]",
  ActiveMdText: "md:text-[var(--mactive-text)]",
  // ✅ Active MOBILE (important)
  ActiveMBg:    "!bg-[var(--mactive-m-bg)]",
  ActiveMText:  "!text-[var(--mactive-text)]",
  // Button 📊
  BtnBg:        "md:bg-[var(--mbtn-bg)]",
  BtnBgActive:  "md:bg-[var(--mbtn-bg-active)]",
  // ✅ Drawer mobile
  DrawerBg:     "bg-[var(--mdrawer-bg)]",
  
};

export const CssHighlights = {
  // Gruppi
  GroupStage: "bg-[var(--hl-group-stage)]",
  GroupSep: "bg-[var(--hl-group-sep)]",
  GroupA: "bg-[var(--hl-group-a)]",
  GroupB: "bg-[var(--hl-group-b)]",
  GroupC: "bg-[var(--hl-group-c)]",
  GroupD: "bg-[var(--hl-group-d)]",
  GroupE: "bg-[var(--hl-group-e)]",
  GroupF: "bg-[var(--hl-group-f)]",
  GroupG: "bg-[var(--hl-group-g)]",
  GroupH: "bg-[var(--hl-group-h)]",
  GroupI: "bg-[var(--hl-group-i)]",
  GroupJ: "bg-[var(--hl-group-j)]",
  GroupK: "bg-[var(--hl-group-k)]",
  GroupL: "bg-[var(--hl-group-l)]",

  // Knockout
  Round32: "bg-[var(--hl-round32)]",
  Round16: "bg-[var(--hl-round16)]",
  Quarter: "bg-[var(--hl-quarter)]",
  Semi:    "bg-[var(--hl-semi)]",
  Final:   "bg-[var(--hl-final)]",
};

export const Rett = {
  A: "bg-blue-600",
  B: "bg-rose-600",
  C: "bg-amber-600",
  D: "bg-green-600",
  Final: "bg-yellow-400",

  SemiAB: "bg-gradient-to-b from-blue-600 to-rose-600",
  SemiCD: "bg-gradient-to-b from-amber-600 to-green-600",
};
