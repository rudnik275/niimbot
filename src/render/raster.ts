/**
 * 1-bit conversion. niimbluelib's encoder treats *every* non-white pixel as
 * black, so anti-aliased edges must be resolved here, deliberately, before
 * encoding — otherwise grey fringes print as fat black halos (the failure of
 * the very first test print).
 */

export const DEFAULT_THRESHOLD = 150;

/** Rec. 601 luma, integer maths. */
export function luma(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * In-place threshold: pixels darker than `threshold` become pure black,
 * everything else pure white, alpha forced opaque. Transparent pixels count
 * as white.
 */
export function binarize(img: ImageData, threshold = DEFAULT_THRESHOLD): ImageData {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3]!;
    // Composite over white first so semi-transparent ink is judged fairly.
    const r = d[i]! * a / 255 + (255 - a);
    const g = d[i + 1]! * a / 255 + (255 - a);
    const b = d[i + 2]! * a / 255 + (255 - a);
    const v = luma(r, g, b) < threshold ? 0 : 255;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  return img;
}

/** Number of black pixels; handy for tests and a "blank label" guard. */
export function countInk(img: ImageData): number {
  let n = 0;
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) if (d[i] === 0) n++;
  return n;
}

/** Bounding box of black pixels, or null when blank. */
export function inkBounds(img: ImageData): { x: number; y: number; w: number; h: number } | null {
  let minX = img.width, minY = img.height, maxX = -1, maxY = -1;
  const d = img.data;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (d[(y * img.width + x) * 4] === 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}
