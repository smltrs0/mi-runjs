import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

export type ThemeId =
  | "classic"
  | "ristretto"
  | "octagon"
  | "spectrum"
  | "machine";

type Palette = {
  bg: string;
  console: string;
  fg: string;
  sel: string;
  comments: string;
  pink: string;
  green: string;
  yellow: string;
  purple: string;
  orange: string;
  cyan: string;
  line: string;
};

const palettes: Record<ThemeId, Palette> = {
  classic: {
    bg: "#2D2A2E",
    console: "#221F22",
    fg: "#FCFCFA",
    sel: "#403E41",
    comments: "#727072",
    pink: "#FF6188",
    green: "#A9DC76",
    yellow: "#FFD866",
    purple: "#AB9DF2",
    orange: "#FC9867",
    cyan: "#78DCE8",
    line: "#3a373b",
  },
  ristretto: {
    bg: "#2C2525",
    console: "#211C1C",
    fg: "#FCFCFA",
    sel: "#423535",
    comments: "#72696A",
    pink: "#FD6883",
    green: "#ADDA78",
    yellow: "#F9CC6C",
    purple: "#F38D70",
    orange: "#F38D70",
    cyan: "#85DACC",
    line: "#3a3232",
  },
  octagon: {
    bg: "#282A3A",
    console: "#1E1F2B",
    fg: "#EAF2F1",
    sel: "#3A3D4B",
    comments: "#696D77",
    pink: "#FF657A",
    green: "#BAD761",
    yellow: "#FFD76D",
    purple: "#C39AC9",
    orange: "#FF9B5E",
    cyan: "#9CD1BB",
    line: "#32344A",
  },
  spectrum: {
    bg: "#222222",
    console: "#191919",
    fg: "#F7F1FF",
    sel: "#363537",
    comments: "#8B888F",
    pink: "#FC618D",
    green: "#7BD88F",
    yellow: "#FCE566",
    purple: "#948AE3",
    orange: "#FD9353",
    cyan: "#5AD4E6",
    line: "#2d2d2d",
  },
  machine: {
    bg: "#273136",
    console: "#1D262A",
    fg: "#F2FFFC",
    sel: "#3A4449",
    comments: "#6B7678",
    pink: "#FF6D7E",
    green: "#A2E57B",
    yellow: "#FFED72",
    purple: "#C39AC9",
    orange: "#FFB270",
    cyan: "#7CD5F1",
    line: "#314046",
  },
};

export const THEME_LABELS: Record<ThemeId, string> = {
  classic: "Monokai Pro",
  ristretto: "Ristretto",
  octagon: "Octagon",
  spectrum: "Spectrum",
  machine: "Machine",
};

export const THEME_IDS = Object.keys(palettes) as ThemeId[];

export function getPalette(id: ThemeId): Palette {
  return palettes[id];
}

export function editorTheme(id: ThemeId): Extension {
  const p = palettes[id];
  const ui = EditorView.theme(
    {
      "&": {
        color: p.fg,
        backgroundColor: p.bg,
        fontSize: "14px",
        height: "100%",
        fontFamily:
          "'Fira Code', 'JetBrains Mono', 'Cascadia Code', ui-monospace, monospace",
      },
      ".cm-scroller": { overflow: "auto", fontFamily: "inherit" },
      ".cm-content": { caretColor: p.fg },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: p.fg },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: p.sel },
      ".cm-activeLine": { backgroundColor: p.line },
      ".cm-gutters": {
        backgroundColor: p.bg,
        color: p.comments,
        border: "none",
      },
      ".cm-activeLineGutter": { backgroundColor: p.line, color: p.fg },
      ".cm-tooltip": {
        backgroundColor: p.sel,
        color: p.fg,
        border: `1px solid ${p.comments}`,
      },
    },
    { dark: true },
  );

  const hi = syntaxHighlighting(
    HighlightStyle.define([
      { tag: [t.keyword, t.modifier], color: p.pink },
      { tag: [t.function(t.variableName), t.className], color: p.green },
      { tag: [t.string, t.special(t.brace)], color: p.yellow },
      { tag: [t.number, t.bool, t.null], color: p.purple },
      { tag: [t.variableName, t.propertyName], color: p.fg },
      { tag: t.comment, color: p.comments, fontStyle: "italic" },
      { tag: t.operator, color: p.cyan },
      { tag: t.bracket, color: p.fg },
      { tag: t.definition(t.variableName), color: p.orange },
    ]),
  );

  return [ui, hi];
}
