import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/golos-text/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";

/** The one typeface every label is set in (UI uses it too). */
export const LABEL_FONT = '"Golos Text"';

const SAMPLE = "M3×6 болт Ø 0.5µF";

/** Resolve once the label font weights used by the layout are usable on a canvas. */
export async function ensureLabelFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const wants = [`600 20px ${LABEL_FONT}`, `800 60px ${LABEL_FONT}`];
  await Promise.all(wants.map((f) => document.fonts.load(f, SAMPLE).catch(() => undefined)));
}
