import "./variables.css";

// sezione classifica - sezione1
export const CssGs = {
  Bg0: "bg-[var(--gs-bg0)]",
  Bg1: "bg-[var(--gs-bg1)]",
  Bg2: "bg-[var(--gs-bg2)]", // colore per hover quando seleziono squadre
  Bg3: "!bg-[var(--gs-bg3)]",

  Filter: "filter brightness-[50%]",
  Filter1: "filter brightness-[80%]",
  Filter2: "filter brightness-[90%]", // no mod
  Filter3: "filter brightness-[90%]", // colonna PTS
  Filter4: "filter brightness-[80%]", // colonna SQ - se ha gia' giocato

  BaseText: "text-[var(--gs-base-text)]",
  BaseText1: "md:text-md font-bold",

  PlayingText: "!text-[var(--gs-playing-text)]",
  PlayingPtsText: "!text-[var(--gs-playing-pts-text)]",

  ImgTextInRoundMd: "text-md",
  ImgTextInRoundSm: "text-sm",

  BorderPartite: "border-[var(--gs-border-partite)]",
  BrightnessDopoScelta: "brightness-60",
  BorderLineNextMatch:
    "border-b-2 border-[var(--gs-border-line-next-match)] border-dashed",

  pinWin: "text-[var(--pin-win)] text-sm ",
  pinDraw: "text-[var(--pin-draw)] text-sm ",
  pinLose: "text-[var(--pin-lose)] text-sm ",

  colBgDayWeek:
    "bg-[var(--gs-col-bg-day-week)] !text-[var(--gs-col-text-day-week)]",
  colBgDaySab:
    "bg-[var(--gs-col-bg-day-sab)] !text-[var(--gs-col-text-day-sab)]",
  colBgDayDom:
    "bg-[var(--gs-col-bg-day-dom)] !text-[var(--gs-col-text-day-dom)]",
};

// sezione classifica - sezione3
export const CssTs = {
  Bg0: "bg-[var(--ts-bg0)]",
  Bg9: "bg-[var(--ts-bg9)]",
  TextCF: "text-[var(--ts-text-cf)]",

  // --- hover squadre tabella
  TabHoverHome: "hover:bg-[var(--ts-tab-hover-home)]",
  TabHoverAway: "hover-away-gradient",

  // --- titolo squadre tabella
  BgSquadraCasa: "bg-[var(--ts-bg-sq-casa)] text-bigger",
  BgSquadraFuori: "bg-[var(--ts-bg-sq-fuori)] text-bigger",
  SqCasaZChart: "!z-10",
  SqFuoriZChart: "!z-5",

  // --- colori risultati
  ColResHome: "text-[var(--ts-col-res-home)] font-bold",
  ColResAway: "text-[var(--ts-col-res-away)] font-light",

  // --- badge Serie A / B / misti
  ATeamBg:
    "text-black bg-[var(--ts-a-team-bg)] border-t-0 border-l-4 border-[var(--ts-a-team-border)] rounded-t-sm rounded-l-3xl rounded-tr-xl",
  ATeamBgSolid:
    "text-black bg-[rgb(var(--ts-a-team-bg-rgb))] border-t-0 border-l-4 border-[var(--ts-a-team-border)] rounded-t-sm rounded-l-3xl rounded-tr-xl",
  ATeamText: "text-[var(--ts-a-team-text)] tracking-wider",

  BTeamText: "text-[var(--ts-b-team-text)]",
  ABTeamText: "text-[var(--ts-ab-team-text)] font-bold",

  NTeamBg:
    "bg-[var(--ts-n-team-bg)] border-b-0 border-l-4 border-[var(--ts-n-team-border)] rounded-t-sm rounded-tl-2xl rounded-br-xl",
  NTeamBgSolid:
    "bg-[rgb(var(--ts-n-team-bg-rgb))] border-b-0 border-l-4 border-[var(--ts-n-team-border)] rounded-t-sm rounded-tl-2xl rounded-br-xl",
  NTeamText: "font-thin text-[var(--ts-n-team-text)]",

  // --- testo comune risultati
  ColResBg: "!text-[var(--ts-col-res-bg)]",
  ColResLine: "!text-[var(--ts-col-res-line)]",

  // --- win/draw/lose
  WinBg: "bg-[var(--ts-win-bg)] rounded-full",
  WinText: "!text-[var(--ts-win-text)]",
  DrawBg: "bg-[var(--ts-draw-bg)] rounded-full",
  DrawText: "!text-[var(--ts-draw-text)]",
  LoseBg: "bg-[var(--ts-lose-bg)] rounded-full",
  LoseText: "!text-[var(--ts-lose-text)]",

  // --- hover righe squadra
  HoverSqHome: "bg-[var(--ts-hover-sq-home)]",
  HoverSqAway: "bg-[var(--ts-hover-sq-away)]",
};
