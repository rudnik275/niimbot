import { describe, expect, it } from "vitest";
import { ImageEncoder, PageColorType, type ImageSource, type PrintDirection } from "@mmote/niimbluelib";

type Px = (x: number, y: number) => number;

/**
 * Stand-in for niimbluelib's CanvasImageSource: the *source* performs the
 * clockwise remap when printDirection is "left" (same formula as the library).
 */
function memSource(width: number, height: number, px: Px): ImageSource {
  return {
    width,
    height,
    getPixelColor(x: number, y: number, dir: PrintDirection = "left") {
      if (dir === "left") return px(y, height - 1 - x);
      return px(x, y);
    },
  };
}

/** Pure twin of draw.ts#rotateCCW: dst(x2, y2) = src(W-1-y2, x2). */
function rotateCCW(w: number, h: number, px: Px): { width: number; height: number; px: Px } {
  return { width: h, height: w, px: (x2, y2) => px(w - 1 - y2, x2) };
}

function blackCells(img: ReturnType<typeof ImageEncoder.encode>): string[] {
  const out: string[] = [];
  let row = 0;
  for (const r of img.rowsData) {
    for (let k = 0; k < r.repeat; k++, row++) {
      if (r.dataType !== "pixels") continue;
      r.rowDataBlack!.forEach((byte, bi) => {
        for (let b = 0; b < 8; b++) if (byte & (1 << (7 - b))) out.push(`${row}:${bi * 8 + b}`);
      });
    }
  }
  return out.sort();
}

describe("rotateCCW + encode('left') equals encode('top')", () => {
  it("maps single pixels identically", () => {
    const W = 24, H = 16;
    for (const [bx, by] of [[0, 0], [23, 0], [0, 15], [23, 15], [5, 9]] as Array<[number, number]>) {
      const px: Px = (x, y) => (x === bx && y === by ? 0x000000 : 0xffffff);
      const top = ImageEncoder.encode(memSource(W, H, px), PageColorType.SingleColor, "top");
      const rot = rotateCCW(W, H, px);
      const left = ImageEncoder.encode(memSource(rot.width, rot.height, rot.px), PageColorType.SingleColor, "left");
      expect(left.cols).toBe(top.cols);
      expect(left.rows).toBe(top.rows);
      expect(blackCells(left)).toEqual(blackCells(top));
      expect(blackCells(top)).toEqual([`${by}:${bx}`]);
    }
  });
});
