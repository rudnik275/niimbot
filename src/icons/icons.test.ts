import { describe, expect, it } from "vitest";
import { ICONS, defaultParams, iconById, normalizeParams, renderIcon, searchIcons } from "./index";
import { renderBolt, shiftPath } from "./fasteners";
import { artToSvg } from "./types";

const PATH_RX = /^(?:[MLACZ]|-?\d+(?:\.\d+)?|\s)+$/;

describe("icon library", () => {
  it("has unique ids", () => {
    const ids = ICONS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every icon renders valid, in-bounds path data with default params", () => {
    for (const def of ICONS) {
      const a = def.render(defaultParams(def));
      expect(a.h, def.id).toBe(100);
      expect(a.w, def.id).toBeGreaterThan(0);
      expect(a.shapes.length, def.id).toBeGreaterThan(0);
      for (const s of a.shapes) {
        expect(s.d, `${def.id}: ${s.d}`).toMatch(PATH_RX);
        // every numeric token must be within the box (arc flags/radii are small anyway)
        const nums = (s.d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
        for (const n of nums) {
          expect(n, `${def.id}: ${n} in ${s.d}`).toBeGreaterThanOrEqual(-2);
          expect(n, `${def.id}: ${n} in ${s.d}`).toBeLessThanOrEqual(Math.max(a.w, a.h) + 2);
        }
      }
    }
  });

  it("parametric bolt renders every option combination", () => {
    const bolt = iconById("bolt")!;
    const [head, thread, drive] = bolt.params!;
    for (const h of head!.options)
      for (const t of thread!.options)
        for (const d of drive!.options) {
          const a = renderBolt({ head: h.id, thread: t.id, drive: d.id });
          expect(a.shapes.length).toBeGreaterThan(2);
          if (d.id === "none") expect(a.w).toBe(200);
          else expect(a.w).toBeGreaterThan(200);
        }
  });

  it("normalizes unknown params to defaults", () => {
    const bolt = iconById("bolt")!;
    expect(normalizeParams(bolt, { head: "nope", thread: "wood" })).toEqual({ head: "cyl", thread: "wood", drive: "none" });
    expect(renderIcon({ id: "does-not-exist", params: {} })).toBeNull();
    expect(renderIcon(null)).toBeNull();
  });

  it("search matches Russian names and keywords", () => {
    expect(searchIcons("гайка").map((i) => i.id)).toContain("nut_hex");
    expect(searchIcons("led").map((i) => i.id)).toContain("led");
    expect(searchIcons("").length).toBe(ICONS.length);
  });

  it("serialises to SVG for the picker", () => {
    const svg = artToSvg(renderIcon({ id: "led", params: {} })!, { size: 40 });
    expect(svg).toContain("<svg");
    expect(svg).toContain('height="40"');
    expect(svg).toContain("<path");
  });
});

describe("shiftPath", () => {
  it("shifts x of M/L/C coordinates and arc end points only", () => {
    expect(shiftPath("M1 2L3 4", 10)).toBe("M11 2L13 4");
    expect(shiftPath("M1 2C3 4 5 6 7 8Z", 10)).toBe("M11 2C13 4 15 6 17 8Z");
    expect(shiftPath("M0 50A10 10 0 1 0 20 50", 5)).toBe("M5 50A10 10 0 1 0 25 50");
  });
});
