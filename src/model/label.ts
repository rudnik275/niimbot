/** What one label says and shows. Pure data; rendering lives in ../render. */

export type LabelFont = "grotesk" | "mono";

export interface IconRef {
  id: string;
  params: Record<string, string>;
}

export interface LabelSpec {
  icon: IconRef | null;
  /** Big text, e.g. "M3×6" or "3V". Empty is allowed (icon-only label). */
  title: string;
  /** Small text under the title, e.g. "болт". Empty hides it. */
  caption: string;
  font: LabelFont;
  /** Rounded frame around the label (as on the approved bolt reference). */
  frame: boolean;
  /** Short horizontal rules on both sides of the caption. */
  captionRules: boolean;
}

export function emptyLabel(): LabelSpec {
  return { icon: null, title: "", caption: "", font: "grotesk", frame: false, captionRules: true };
}

export function cloneLabel(l: LabelSpec): LabelSpec {
  return { ...l, icon: l.icon ? { id: l.icon.id, params: { ...l.icon.params } } : null };
}

export function labelIsEmpty(l: LabelSpec): boolean {
  return !l.icon && l.title.trim() === "" && l.caption.trim() === "";
}

/**
 * Typography niceties applied at render time (the stored text stays as typed):
 *  - "x" / "х" between digits becomes "×"  (M3x6 → M3×6, 10 x 20 → 10×20)
 *  - a dash between digits becomes an en dash? No — hyphens are common in part numbers, keep them.
 */
export function prettifyTitle(text: string): string {
  return text.replace(/(\d)\s*[xXхХ]\s*(?=\d)/g, "$1×");
}

/** Stable key for "same label" comparisons in the library. */
export function labelKey(l: LabelSpec): string {
  const icon = l.icon ? `${l.icon.id}:${Object.entries(l.icon.params).sort().map(([k, v]) => `${k}=${v}`).join(",")}` : "-";
  return [icon, l.title.trim(), l.caption.trim(), l.font, l.frame ? "f" : "", l.captionRules ? "r" : ""].join("|");
}
