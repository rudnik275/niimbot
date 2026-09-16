/**
 * Media (label stock) profiles.
 *
 * A profile describes one *feed unit*: the piece of tape the printer advances
 * between two gaps. For ordinary rolls that is one label. For the default
 * T40×15/2R roll it is a *pair*: two 40×15 mm labels touching along the feed
 * direction, with the sensor gap only between pairs. The printer therefore
 * always prints a whole pair, and the page canvas is 40 × 30 mm.
 */

/** Dots per millimetre for 203 dpi printers (B1, B21, D110, …). */
export const DPMM = 8;

export type MediaKind = "gaps" | "continuous" | "black";

export interface MediaProfile {
  id: string;
  name: string;
  /** Label width across the print head, mm. */
  widthMm: number;
  /** Height of ONE label along the feed, mm. */
  heightMm: number;
  /** Labels per feed unit, stacked along the feed with no gap between them. */
  slots: number;
  kind: MediaKind;
  /** RFID barcodes (EAN) of rolls known to carry this stock. */
  barcodes: string[];
  builtin?: boolean;
}

export const BUILTIN_MEDIA: MediaProfile[] = [
  {
    id: "t40x15x2",
    name: "40×15 парные",
    widthMm: 40,
    heightMm: 15,
    slots: 2,
    kind: "gaps",
    barcodes: ["6971501227736"],
    builtin: true,
  },
  { id: "t40x30", name: "40×30", widthMm: 40, heightMm: 30, slots: 1, kind: "gaps", barcodes: [], builtin: true },
  { id: "t50x30", name: "50×30", widthMm: 50, heightMm: 30, slots: 1, kind: "gaps", barcodes: [], builtin: true },
  { id: "t40x20", name: "40×20", widthMm: 40, heightMm: 20, slots: 1, kind: "gaps", barcodes: [], builtin: true },
  { id: "t30x15", name: "30×15", widthMm: 30, heightMm: 15, slots: 1, kind: "gaps", barcodes: [], builtin: true },
  { id: "t50x15", name: "50×15", widthMm: 50, heightMm: 15, slots: 1, kind: "gaps", barcodes: [], builtin: true },
];

export const DEFAULT_MEDIA_ID = "t40x15x2";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Page (feed unit) size in printer dots. */
export function pageSizePx(m: Pick<MediaProfile, "widthMm" | "heightMm" | "slots">): { cols: number; rows: number } {
  return {
    cols: Math.round(m.widthMm * DPMM),
    rows: Math.round(m.heightMm * DPMM) * Math.max(1, m.slots),
  };
}

/** Pixel rectangles of every label inside the page, top to bottom. */
export function slotRects(m: Pick<MediaProfile, "widthMm" | "heightMm" | "slots">): Rect[] {
  const w = Math.round(m.widthMm * DPMM);
  const h = Math.round(m.heightMm * DPMM);
  const out: Rect[] = [];
  for (let i = 0; i < Math.max(1, m.slots); i++) {
    out.push({ x: 0, y: i * h, w, h });
  }
  return out;
}

export function findMediaByBarcode(list: readonly MediaProfile[], barcode: string | undefined): MediaProfile | undefined {
  const code = (barcode ?? "").trim();
  if (!code) return undefined;
  return list.find((m) => m.barcodes.includes(code));
}

export function findMediaById(list: readonly MediaProfile[], id: string): MediaProfile | undefined {
  return list.find((m) => m.id === id);
}

/**
 * Apply user bindings (barcode → media id) on top of the built-in barcodes.
 * A binding overrides a built-in barcode; the list itself is never mutated.
 */
export function withBindings(list: readonly MediaProfile[], bindings: Readonly<Record<string, string>>): MediaProfile[] {
  return list.map((m) => {
    const own = m.barcodes.filter((b) => !(b in bindings) || bindings[b] === m.id);
    const bound = Object.entries(bindings)
      .filter(([, id]) => id === m.id)
      .map(([b]) => b);
    const merged = [...new Set([...own, ...bound])];
    return merged.length === m.barcodes.length && merged.every((b, i) => b === m.barcodes[i]) ? m : { ...m, barcodes: merged };
  });
}

/**
 * Widest stock the print head can cover, mm. B1/B21 heads are 384 dots = 48 mm.
 * Returns undefined when the head width is unknown.
 */
export function maxWidthMm(printheadPixels: number | undefined): number | undefined {
  return printheadPixels ? printheadPixels / DPMM : undefined;
}

export function mediaDescription(m: MediaProfile): string {
  const one = `${m.widthMm}×${m.heightMm} мм`;
  return m.slots > 1 ? `${one} × ${m.slots} в паре` : one;
}

let customCounter = 0;
export function newCustomMedia(widthMm: number, heightMm: number, slots: number, kind: MediaKind): MediaProfile {
  customCounter += 1;
  const id = `custom-${Date.now().toString(36)}-${customCounter}`;
  const name = slots > 1 ? `${widthMm}×${heightMm} ×${slots}` : `${widthMm}×${heightMm}`;
  return { id, name, widthMm, heightMm, slots, kind, barcodes: [] };
}
