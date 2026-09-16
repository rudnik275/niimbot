import { describe, expect, it } from "vitest";
import { binarize, countInk, inkBounds } from "./raster";

function img(w: number, h: number, fill: (x: number, y: number) => [number, number, number, number]): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = fill(x, y);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { width: w, height: h, data, colorSpace: "srgb" } as unknown as ImageData;
}

describe("binarize", () => {
  it("maps every pixel to pure black or pure white with full alpha", () => {
    const im = binarize(img(4, 1, (x) => [x * 80, x * 80, x * 80, 255]), 150);
    const px = (i: number) => Array.from(im.data.slice(i * 4, i * 4 + 4));
    expect(px(0)).toEqual([0, 0, 0, 255]); // 0
    expect(px(1)).toEqual([0, 0, 0, 255]); // 80
    expect(px(2)).toEqual([255, 255, 255, 255]); // 160
    expect(px(3)).toEqual([255, 255, 255, 255]); // 240
  });

  it("treats transparent pixels as white and semi-transparent ink fairly", () => {
    const im = binarize(img(3, 1, (x) => (x === 0 ? [0, 0, 0, 0] : x === 1 ? [0, 0, 0, 255] : [0, 0, 0, 100])), 150);
    expect(im.data[0]).toBe(255);
    expect(im.data[4]).toBe(0);
    expect(im.data[8]).toBe(255); // 39% ink over white → light grey → white
  });

  it("respects the threshold", () => {
    const grey = () => img(1, 1, () => [128, 128, 128, 255]);
    expect(countInk(binarize(grey(), 100))).toBe(0);
    expect(countInk(binarize(grey(), 150))).toBe(1);
  });
});

describe("inkBounds", () => {
  it("finds the black bounding box", () => {
    const im = binarize(img(10, 6, (x, y) => (x >= 2 && x <= 5 && y >= 1 && y <= 2 ? [0, 0, 0, 255] : [255, 255, 255, 255])));
    expect(inkBounds(im)).toEqual({ x: 2, y: 1, w: 4, h: 2 });
    expect(inkBounds(binarize(img(3, 3, () => [255, 255, 255, 255])))).toBeNull();
  });
});
