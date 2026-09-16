/**
 * Canvas rendering: one label from its layout, and a whole page (feed unit)
 * from the media profile. The page canvas is exactly `cols × rows` printer
 * dots and, after `renderPage`, strictly black-and-white — it is the very
 * bitmap the printer receives, so the preview cannot lie.
 */
import { renderIcon, type IconArt } from "../icons";
import type { LabelSpec } from "../model/label";
import { prettifyTitle } from "../model/label";
import { pageSizePx, slotRects, type MediaProfile } from "../model/media";
import { LABEL_FONT } from "./fonts";
import { layoutLabel, type FontSpec, type LabelLayout, type Line, type Measure } from "./layout";
import { binarize } from "./raster";

export interface PageOptions {
  offsetX: number;
  offsetY: number;
  threshold: number;
}

export const DEFAULT_PAGE_OPTIONS: PageOptions = { offsetX: 0, offsetY: 0, threshold: 150 };

const cssFont = (f: FontSpec) => `${f.weight} ${f.size}px ${f.family}`;

/** measureText with ink (not advance) bounds. */
export function canvasMeasure(ctx: CanvasRenderingContext2D): Measure {
  return (text, font) => {
    ctx.font = cssFont(font);
    const m = ctx.measureText(text);
    return {
      width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
      ascent: m.actualBoundingBoxAscent,
      descent: m.actualBoundingBoxDescent,
    };
  };
}

/** Half-pixel offset for odd stroke widths so lines land on whole pixels. */
const crisp = (v: number, stroke: number) => (stroke % 2 ? v + 0.5 : v);

function strokeLine(ctx: CanvasRenderingContext2D, l: Line) {
  ctx.lineWidth = l.stroke;
  ctx.lineCap = "butt";
  ctx.beginPath();
  if (l.x1 === l.x2) {
    const x = crisp(l.x1, l.stroke);
    ctx.moveTo(x, l.y1);
    ctx.lineTo(x, l.y2);
  } else {
    const y = crisp(l.y1, l.stroke);
    ctx.moveTo(l.x1, y);
    ctx.lineTo(l.x2, y);
  }
  ctx.stroke();
}

export function drawIconArt(
  ctx: CanvasRenderingContext2D,
  art: IconArt,
  box: { x: number; y: number; w: number; h: number },
  strokePx: number,
) {
  const k = Math.min(box.w / art.w, box.h / art.h);
  const ox = box.x + (box.w - art.w * k) / 2;
  const oy = box.y + (box.h - art.h * k) / 2;
  const m = new DOMMatrix([k, 0, 0, k, ox, oy]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of art.shapes) {
    const p = new Path2D();
    p.addPath(new Path2D(s.d), m);
    if (s.fill) ctx.fill(p);
    if (s.stroke !== false) {
      ctx.lineWidth = Math.max(1.5, strokePx * (s.weight ?? 1));
      ctx.setLineDash(s.dash ? s.dash.map((d) => d * k) : []);
      ctx.stroke(p);
      ctx.setLineDash([]);
    }
  }
}

function drawText(ctx: CanvasRenderingContext2D, p: { text: string; font: FontSpec; x: number; baseline: number }) {
  ctx.font = cssFont(p.font);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const m = ctx.measureText(p.text);
  ctx.fillText(p.text, p.x + m.actualBoundingBoxLeft, p.baseline);
}

/**
 * Draw one label into the current transform origin. Grey anti-aliasing is
 * left in place; `renderPage` thresholds the whole page at the end.
 */
export function drawLabel(ctx: CanvasRenderingContext2D, spec: LabelSpec, W: number, H: number): LabelLayout {
  const art = renderIcon(spec.icon);
  const layout = layoutLabel(
    {
      title: prettifyTitle(spec.title),
      caption: spec.caption,
      fontFamily: LABEL_FONT,
      iconAspect: art ? art.w / art.h : null,
    },
    W,
    H,
    canvasMeasure(ctx),
  );

  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  if (art && layout.icon) drawIconArt(ctx, art, layout.icon, layout.icon.stroke);
  if (layout.separator) strokeLine(ctx, layout.separator);
  if (layout.title) drawText(ctx, layout.title);
  if (layout.caption) drawText(ctx, layout.caption);
  return layout;
}

function blankPage(media: MediaProfile, target?: HTMLCanvasElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const { cols, rows } = pageSizePx(media);
  const canvas = target ?? document.createElement("canvas");
  if (canvas.width !== cols) canvas.width = cols;
  if (canvas.height !== rows) canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, cols, rows);
  return { canvas, ctx };
}

/**
 * Render the full feed unit: every slot gets its label, then the bitmap is
 * thresholded to 1-bit. Offsets shift all ink (calibration for printers that
 * place the label a little off).
 */
export function renderPage(
  media: MediaProfile,
  labels: readonly LabelSpec[],
  opts: PageOptions = DEFAULT_PAGE_OPTIONS,
  target?: HTMLCanvasElement,
): HTMLCanvasElement {
  const { canvas, ctx } = blankPage(media, target);
  const slots = slotRects(media);
  slots.forEach((slot, i) => {
    const spec = labels[i];
    if (!spec) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.w, slot.h);
    ctx.clip();
    ctx.translate(slot.x + opts.offsetX, slot.y + opts.offsetY);
    drawLabel(ctx, spec, slot.w, slot.h);
    ctx.restore();
  });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(binarize(img, opts.threshold), 0, 0);
  return canvas;
}

/** Calibration page: a hairline frame 1 mm inside each label plus centre marks. */
export function renderCalibrationPage(media: MediaProfile, opts: PageOptions = DEFAULT_PAGE_OPTIONS, target?: HTMLCanvasElement): HTMLCanvasElement {
  const { canvas, ctx } = blankPage(media, target);
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  const inset = 8;
  slotRects(media).forEach((slot, i) => {
    ctx.save();
    ctx.translate(slot.x + opts.offsetX, slot.y + opts.offsetY);
    ctx.lineWidth = 2;
    ctx.strokeRect(inset, inset, slot.w - inset * 2, slot.h - inset * 2);
    const cx = slot.w / 2, cy = slot.h / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx + 24, cy);
    ctx.moveTo(cx, cy - 24);
    ctx.lineTo(cx, cy + 24);
    ctx.stroke();
    // tick marks every 5 mm along the top edge, 1 mm long
    for (let x = inset; x <= slot.w - inset; x += 40) {
      ctx.fillRect(x - 1, inset, 2, 8);
    }
    ctx.font = `800 ${Math.round(slot.h * 0.22)}px ${LABEL_FONT}`;
    ctx.textBaseline = "top";
    ctx.fillText(String(i + 1), inset + 12, inset + 12);
    ctx.restore();
  });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(binarize(img, opts.threshold), 0, 0);
  return canvas;
}

/** Rotate an ImageData 90° counter-clockwise (used for "left"-direction printers). */
export function rotateCCW(src: ImageData): ImageData {
  const W = src.width, H = src.height;
  const out = new ImageData(H, W);
  const s = src.data, d = out.data;
  for (let y2 = 0; y2 < W; y2++) {
    for (let x2 = 0; x2 < H; x2++) {
      const x = W - 1 - y2;
      const y = x2;
      const si = (y * W + x) * 4;
      const di = (y2 * H + x2) * 4;
      d[di] = s[si]!;
      d[di + 1] = s[si + 1]!;
      d[di + 2] = s[si + 2]!;
      d[di + 3] = s[si + 3]!;
    }
  }
  return out;
}
