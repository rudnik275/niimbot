import { describe, expect, it } from "vitest";
import { layoutLabel, type LayoutInput, type Measure } from "./layout";

/** Deterministic stand-in for canvas measureText: 0.62em advance, 0.72em ascent. */
const fakeMeasure: Measure = (text, font) => ({
  width: text.length * font.size * 0.62,
  ascent: font.size * 0.72,
  descent: /[gjpqyру]/.test(text) ? font.size * 0.18 : 0,
});

const base: LayoutInput = {
  title: "M3×6",
  caption: "болт",
  fontFamily: "Test",
  iconAspect: 2,
};

describe("layoutLabel on a 40×15 mm label (320×120)", () => {
  it("places icon left, separator, then centred text column", () => {
    const l = layoutLabel(base, 320, 120, fakeMeasure);
    expect(l.icon).toBeDefined();
    expect(l.separator).toBeDefined();
    expect(l.title).toBeDefined();
    expect(l.caption).toBeDefined();

    const icon = l.icon!;
    expect(icon.x).toBe(l.pad);
    expect(icon.x + icon.w).toBeLessThan(l.separator!.x1);
    expect(l.column.x).toBeGreaterThan(l.separator!.x1);

    // title ink inside the column
    const t = l.title!;
    expect(t.x).toBeGreaterThanOrEqual(l.column.x);
    expect(t.x + t.width).toBeLessThanOrEqual(l.column.x + l.column.w + 0.01);
  });

  it("centres title + caption block vertically", () => {
    const l = layoutLabel(base, 320, 120, fakeMeasure);
    const top = l.title!.baseline - l.title!.ascent;
    const bottom = l.caption!.baseline + l.caption!.descent;
    const centre = (top + bottom) / 2;
    expect(Math.abs(centre - 60)).toBeLessThanOrEqual(1.5);
  });

  it("centres a lone title vertically and never makes it smaller", () => {
    const withCap = layoutLabel(base, 320, 120, fakeMeasure);
    const alone = layoutLabel({ ...base, caption: "" }, 320, 120, fakeMeasure);
    expect(alone.caption).toBeUndefined();
    // "M3×6" is width-bound in this column, so the size is equal; a tall
    // title becomes height-bound and must grow when the caption goes away.
    expect(alone.title!.font.size).toBeGreaterThanOrEqual(withCap.title!.font.size);
    const tallWith = layoutLabel({ ...base, title: "M3", caption: "гайка с фиксатором" }, 320, 90, fakeMeasure);
    const tallAlone = layoutLabel({ ...base, title: "M3", caption: "" }, 320, 90, fakeMeasure);
    expect(tallAlone.title!.font.size).toBeGreaterThan(tallWith.title!.font.size);
    const centre = alone.title!.baseline - alone.title!.ascent / 2;
    expect(Math.abs(centre - 60)).toBeLessThanOrEqual(1.5);
  });

  it("a caption without a title grows and is centred", () => {
    const withTitle = layoutLabel(base, 320, 120, fakeMeasure);
    const alone = layoutLabel({ ...base, title: "" }, 320, 120, fakeMeasure);
    expect(alone.title).toBeUndefined();
    expect(alone.caption!.font.size).toBeGreaterThan(withTitle.caption!.font.size);
    const centre = alone.caption!.baseline - alone.caption!.ascent / 2;
    expect(Math.abs(centre - 60)).toBeLessThanOrEqual(1.5);
  });

  it("shrinks long titles to fit the column", () => {
    const short = layoutLabel(base, 320, 120, fakeMeasure);
    const long = layoutLabel({ ...base, title: "M2.5×12 DIN912" }, 320, 120, fakeMeasure);
    expect(long.title!.font.size).toBeLessThan(short.title!.font.size);
    expect(long.title!.width).toBeLessThanOrEqual(long.column.w);
  });

  it("keeps all ink inside the padding", () => {
    for (const input of [base, { ...base, iconAspect: null }, { ...base, title: "", caption: "только подпись" }, { ...base, iconAspect: 1, title: "", caption: "" }]) {
      const l = layoutLabel(input, 320, 120, fakeMeasure);
      const boxes: Array<[number, number, number, number]> = [];
      if (l.icon) boxes.push([l.icon.x, l.icon.y, l.icon.x + l.icon.w, l.icon.y + l.icon.h]);
      if (l.title) boxes.push([l.title.x, l.title.baseline - l.title.ascent, l.title.x + l.title.width, l.title.baseline + l.title.descent]);
      if (l.caption) boxes.push([l.caption.x, l.caption.baseline - l.caption.ascent, l.caption.x + l.caption.width, l.caption.baseline + l.caption.descent]);
      for (const [x1, y1, x2, y2] of boxes) {
        expect(x1).toBeGreaterThanOrEqual(l.pad - 0.01);
        expect(y1).toBeGreaterThanOrEqual(l.pad - 1);
        expect(x2).toBeLessThanOrEqual(320 - l.pad + 0.01);
        expect(y2).toBeLessThanOrEqual(120 - l.pad + 1);
      }
    }
  });

  it("no icon → text column spans the whole label and there is no separator", () => {
    const l = layoutLabel({ ...base, iconAspect: null }, 320, 120, fakeMeasure);
    expect(l.icon).toBeUndefined();
    expect(l.separator).toBeUndefined();
    expect(l.column.x).toBe(l.pad);
    expect(l.column.w).toBe(320 - 2 * l.pad);
  });

  it("icon without text is centred and may use the full width", () => {
    const l = layoutLabel({ ...base, title: "", caption: "" }, 320, 120, fakeMeasure);
    expect(l.separator).toBeUndefined();
    const icon = l.icon!;
    expect(Math.abs(icon.x + icon.w / 2 - 160)).toBeLessThanOrEqual(1);
    expect(icon.h).toBeGreaterThan(layoutLabel(base, 320, 120, fakeMeasure).icon!.h);
  });

  it("scales to other label sizes", () => {
    const l = layoutLabel(base, 400, 240, fakeMeasure);
    expect(l.title!.font.size).toBeGreaterThan(layoutLabel(base, 320, 120, fakeMeasure).title!.font.size);
    expect(l.icon!.h).toBeLessThanOrEqual(240 - 2 * l.pad);
  });
});
