/**
 * Pictogram library — data model and drawing helpers.
 *
 * Every icon is vector art in its own unit box (`w × h`, height is always 100
 * units). Shapes are SVG path strings drawn either as strokes with a *shared*
 * line weight or as solid fills, so all icons carry the same visual weight and
 * survive 203 dpi thermal printing (nothing thinner than ~0.4 mm).
 *
 * The same art is rendered two ways: `Path2D` on the print canvas (with the
 * stroke width chosen in printer dots) and inline SVG in the picker UI.
 */

export interface Shape {
  /** SVG path data in icon units. */
  d: string;
  /** Stroke the outline (default true). */
  stroke?: boolean;
  /** Fill solid (default false). */
  fill?: boolean;
  /** Multiplier of the base stroke width. */
  weight?: number;
  /** Dashed stroke pattern in icon units (rarely used; prints poorly). */
  dash?: number[];
}

export interface IconArt {
  w: number;
  h: number;
  shapes: Shape[];
}

export type Category = "fasteners" | "electronics" | "tools" | "misc";

export const CATEGORY_NAMES: Record<Category, string> = {
  fasteners: "Крепёж",
  electronics: "Электроника",
  tools: "Инструмент",
  misc: "Разное",
};

export interface ParamOption {
  id: string;
  name: string;
}

export interface IconParam {
  id: string;
  name: string;
  options: ParamOption[];
  default: string;
}

export interface IconDef {
  id: string;
  name: string;
  category: Category;
  /** Suggested caption, applied when the user picks the icon and the caption is empty. */
  caption?: string;
  /** Search words (Russian + English), lower-case. */
  keywords?: string[];
  params?: IconParam[];
  render: (params: Record<string, string>) => IconArt;
}

export const ICON_H = 100;
/** Base stroke width per 100 units of height. ≈4.3 px on a 15 mm label. */
export const STROKE_UNITS = 4.5;

// --- path helpers ----------------------------------------------------------

const f = (n: number) => (Math.round(n * 100) / 100).toString();

export function M(x: number, y: number): string {
  return `M${f(x)} ${f(y)}`;
}
export function L(x: number, y: number): string {
  return `L${f(x)} ${f(y)}`;
}
export function line(x1: number, y1: number, x2: number, y2: number): string {
  return `${M(x1, y1)}${L(x2, y2)}`;
}
export function poly(points: Array<[number, number]>, close = true): string {
  const [first, ...rest] = points;
  if (!first) return "";
  return `${M(first[0], first[1])}${rest.map(([x, y]) => L(x, y)).join("")}${close ? "Z" : ""}`;
}
export function rect(x: number, y: number, w: number, h: number, r = 0): string {
  if (r <= 0) return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  const rr = Math.min(r, w / 2, h / 2);
  return (
    `${M(x + rr, y)}${L(x + w - rr, y)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x + w)} ${f(y + rr)}` +
    `${L(x + w, y + h - rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x + w - rr)} ${f(y + h)}` +
    `${L(x + rr, y + h)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x)} ${f(y + h - rr)}` +
    `${L(x, y + rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x + rr)} ${f(y)}Z`
  );
}
export function circle(cx: number, cy: number, r: number): string {
  return `${M(cx - r, cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
}
export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `${M(cx - rx, cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`;
}
/** Regular polygon; `rot` in degrees, 0 puts a vertex at the right. */
export function ngon(cx: number, cy: number, r: number, n: number, rot = 0): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return poly(pts);
}
/** Hexagon with flats top and bottom (as a nut seen from above). */
export function hexFlat(cx: number, cy: number, r: number): string {
  return ngon(cx, cy, r, 6, 0);
}
/** Zigzag between (x1,y) and (x2,y): thread teeth. `amp` is the tooth height, `pitch` the period. */
export function zigzag(x1: number, x2: number, y: number, amp: number, pitch: number, startUp = true): string {
  const pts: Array<[number, number]> = [];
  const n = Math.max(1, Math.round((x2 - x1) / (pitch / 2)));
  const step = (x2 - x1) / n;
  for (let i = 0; i <= n; i++) {
    const up = (i % 2 === 0) === startUp;
    pts.push([x1 + i * step, y + (up ? -amp / 2 : amp / 2)]);
  }
  return poly(pts, false);
}
export function arrow(x1: number, y1: number, x2: number, y2: number, head = 12): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = (t: number) => x2 - head * Math.cos(a + t);
  const hy = (t: number) => y2 - head * Math.sin(a + t);
  return `${line(x1, y1, x2, y2)}${M(hx(0.5), hy(0.5))}${L(x2, y2)}${L(hx(-0.5), hy(-0.5))}`;
}

export const S = (d: string, extra: Partial<Shape> = {}): Shape => ({ d, stroke: true, ...extra });
export const F = (d: string, extra: Partial<Shape> = {}): Shape => ({ d, stroke: false, fill: true, ...extra });
/** Filled and outlined (fill hides interior lines, outline keeps the silhouette crisp). */
export const FS = (d: string, extra: Partial<Shape> = {}): Shape => ({ d, stroke: true, fill: true, ...extra });

export function art(w: number, shapes: Shape[]): IconArt {
  return { w, h: ICON_H, shapes };
}

// --- SVG serialisation for the UI ------------------------------------------

export function artToSvg(a: IconArt, opts: { size?: number; color?: string; className?: string } = {}): string {
  const color = opts.color ?? "currentColor";
  const size = opts.size ?? 48;
  const width = Math.round((size * a.w) / a.h);
  const body = a.shapes
    .map((s) => {
      const sw = STROKE_UNITS * (s.weight ?? 1);
      const attrs = [
        `d="${s.d}"`,
        `fill="${s.fill ? color : "none"}"`,
        `stroke="${s.stroke === false ? "none" : color}"`,
        `stroke-width="${sw}"`,
        s.dash ? `stroke-dasharray="${s.dash.join(" ")}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<path ${attrs}/>`;
    })
    .join("");
  const cls = opts.className ? ` class="${opts.className}"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a.w} ${a.h}" width="${width}" height="${size}"${cls} ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}
