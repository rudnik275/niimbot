/**
 * Pure layout of one label. No canvas here: text measurement is injected so
 * the maths can run under vitest and so the same layout drives the printed
 * raster and any on-screen preview.
 *
 * Coordinates are printer dots (8 per mm). Everything is snapped to whole
 * pixels because the result is thresholded to 1-bit: half-pixel geometry
 * would turn into ragged edges on paper.
 */

export interface FontSpec {
  family: string;
  weight: number;
  size: number;
}

/** Ink bounds of a string set in a font. */
export interface Metrics {
  width: number;
  ascent: number;
  descent: number;
}

export type Measure = (text: string, font: FontSpec) => Metrics;

export interface LayoutInput {
  title: string;
  caption: string;
  fontFamily: string;
  /** Width/height ratio of the icon art, or null when there is no icon. */
  iconAspect: number | null;
  frame: boolean;
  captionRules: boolean;
}

export interface TextPlacement {
  text: string;
  font: FontSpec;
  /** Left edge of the ink, px. */
  x: number;
  baseline: number;
  width: number;
  ascent: number;
  descent: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: number;
}

export interface LabelLayout {
  W: number;
  H: number;
  pad: number;
  frame?: { x: number; y: number; w: number; h: number; r: number; stroke: number };
  /** Box the icon art is fitted into (art keeps its aspect). */
  icon?: { x: number; y: number; w: number; h: number; stroke: number };
  separator?: Line;
  title?: TextPlacement;
  caption?: TextPlacement;
  rules: Line[];
  /** Text column, useful for debugging overlays. */
  column: { x: number; w: number };
}

const TITLE_WEIGHT = 800;
const CAPTION_WEIGHT = 600;

export function layoutLabel(input: LayoutInput, W: number, H: number, measure: Measure): LabelLayout {
  const title = input.title.trim();
  const caption = input.caption.trim();
  const hasIcon = input.iconAspect !== null && input.iconAspect > 0;

  // --- margins -------------------------------------------------------------
  // The B1 places a label with roughly ±1 mm slop, so ink stays ≥ ~1.1 mm from
  // the die-cut edge even without a frame.
  let pad = Math.round(H * 0.09);
  const frameStroke = H >= 100 ? 3 : 2;
  let frame: LabelLayout["frame"];
  if (input.frame) {
    const inset = Math.round(H * 0.05);
    frame = {
      x: inset,
      y: inset,
      w: W - inset * 2,
      h: H - inset * 2,
      r: Math.round(H * 0.12),
      stroke: frameStroke,
    };
    pad = inset + frameStroke + Math.round(H * 0.06);
  }

  const innerH = H - pad * 2;
  const gap = Math.round(H * 0.075);
  const rules: Line[] = [];

  // --- icon + separator -----------------------------------------------------
  let icon: LabelLayout["icon"];
  let separator: Line | undefined;
  let columnX = pad;
  if (hasIcon) {
    const aspect = input.iconAspect as number;
    const cellH = Math.round(innerH * 0.9);
    const maxW = Math.round((W - pad * 2) * (title || caption ? 0.42 : 1));
    let w = Math.round(cellH * aspect);
    let h = cellH;
    if (w > maxW) {
      w = maxW;
      h = Math.round(w / aspect);
    }
    const x = title || caption ? pad : Math.round((W - w) / 2);
    const y = Math.round((H - h) / 2);
    icon = { x, y, w, h, stroke: strokeFor(H) };

    if (title || caption) {
      const sx = x + w + gap;
      const sStroke = H >= 100 ? 3 : 2;
      separator = {
        x1: sx,
        y1: Math.round(H * 0.17),
        x2: sx,
        y2: Math.round(H * 0.83),
        stroke: sStroke,
      };
      columnX = sx + sStroke + gap;
    }
  }

  const column = { x: columnX, w: Math.max(0, W - pad - columnX) };

  // --- text ---------------------------------------------------------------
  let titleP: TextPlacement | undefined;
  let captionP: TextPlacement | undefined;

  const gapTC = Math.round(H * 0.07);
  let captionM: Metrics | undefined;
  let captionFont: FontSpec | undefined;
  if (caption) {
    // A caption without a title carries the label alone: let it grow.
    let size = Math.max(12, Math.round(H * (title ? 0.19 : 0.34)));
    captionFont = { family: input.fontFamily, weight: CAPTION_WEIGHT, size };
    captionM = measure(caption, captionFont);
    while (captionM.width > column.w && size > 10) {
      size -= 1;
      captionFont = { ...captionFont, size };
      captionM = measure(caption, captionFont);
    }
  }

  if (title) {
    const captionBlock = captionM ? captionM.ascent + captionM.descent + gapTC : 0;
    const maxInk = Math.max(8, innerH - captionBlock);
    // Start above any plausible fit; the ink-height cap does the real limiting.
    const fit = fitTitle(title, input.fontFamily, column.w, maxInk, Math.round(H * 1.2), measure);
    titleP = { text: title, font: fit.font, x: 0, baseline: 0, ...fit.m };
  }

  // Vertical block centring on ink bounds (optical, not line-box, centring).
  const titleH = titleP ? titleP.ascent + titleP.descent : 0;
  const capH = captionM ? captionM.ascent + captionM.descent : 0;
  const total = titleH + (titleP && captionM ? gapTC : 0) + capH;
  let cursor = Math.round((H - total) / 2);

  if (titleP) {
    titleP.x = Math.round(column.x + (column.w - titleP.width) / 2);
    titleP.baseline = cursor + Math.round(titleP.ascent);
    cursor += Math.round(titleH) + (captionM ? gapTC : 0);
  }
  if (captionM && captionFont) {
    const x = Math.round(column.x + (column.w - captionM.width) / 2);
    const baseline = cursor + Math.round(captionM.ascent);
    captionP = { text: caption, font: captionFont, x, baseline, ...captionM };

    if (input.captionRules) {
      const ruleGap = Math.round(H * 0.07);
      const minRule = Math.round(H * 0.12);
      const y = baseline - Math.round(captionM.ascent * 0.42);
      const left1 = column.x;
      const left2 = x - ruleGap;
      const right1 = x + Math.round(captionM.width) + ruleGap;
      const right2 = column.x + column.w;
      if (left2 - left1 >= minRule && right2 - right1 >= minRule) {
        const s = 2;
        rules.push({ x1: left1, y1: y, x2: left2, y2: y, stroke: s });
        rules.push({ x1: right1, y1: y, x2: right2, y2: y, stroke: s });
      }
    }
  }

  return { W, H, pad, frame, icon, separator, title: titleP, caption: captionP, rules, column };
}

/** Line weight for icon art at a given label height (≈0.5 mm at 15 mm labels). */
export function strokeFor(H: number): number {
  return Math.max(2, Math.round(H / 30));
}

function fitTitle(
  text: string,
  family: string,
  maxW: number,
  maxInkH: number,
  startSize: number,
  measure: Measure,
): { font: FontSpec; m: Metrics } {
  let lo = 8;
  let hi = Math.max(lo, startSize);
  let best: { font: FontSpec; m: Metrics } | undefined;
  // Binary search for the largest size that fits both width and ink height.
  while (lo <= hi) {
    const size = Math.floor((lo + hi) / 2);
    const font = { family, weight: TITLE_WEIGHT, size };
    const m = measure(text, font);
    if (m.width <= maxW && m.ascent + m.descent <= maxInkH) {
      best = { font, m };
      lo = size + 1;
    } else {
      hi = size - 1;
    }
  }
  if (!best) {
    const font = { family, weight: TITLE_WEIGHT, size: 8 };
    best = { font, m: measure(text, font) };
  }
  return best;
}
