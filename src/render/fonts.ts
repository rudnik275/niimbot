import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/golos-text/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/800.css";
import type { LabelFont } from "../model/label";

export const FONT_FAMILY: Record<LabelFont, string> = {
  grotesk: '"Golos Text"',
  mono: '"JetBrains Mono"',
};

export const FONT_LABEL: Record<LabelFont, string> = {
  grotesk: "Гротеск",
  mono: "Моно",
};

const SAMPLE = "M3×6 болт Ø 0.5µF";

/** Resolve once the label fonts are usable on a canvas (weights used by the layout). */
export async function ensureLabelFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const wants = [
    `600 20px ${FONT_FAMILY.grotesk}`,
    `800 60px ${FONT_FAMILY.grotesk}`,
    `600 20px ${FONT_FAMILY.mono}`,
    `800 60px ${FONT_FAMILY.mono}`,
  ];
  await Promise.all(wants.map((f) => document.fonts.load(f, SAMPLE).catch(() => undefined)));
}
