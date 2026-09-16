import { describe, expect, it } from "vitest";
import {
  BUILTIN_MEDIA,
  DEFAULT_MEDIA_ID,
  findMediaByBarcode,
  findMediaById,
  pageSizePx,
  slotRects,
  withBindings,
} from "./media";

describe("media profiles", () => {
  const pair = findMediaById(BUILTIN_MEDIA, DEFAULT_MEDIA_ID)!;

  it("default stock is the 40×15 pair known from the first roll's RFID", () => {
    expect(pair.widthMm).toBe(40);
    expect(pair.heightMm).toBe(15);
    expect(pair.slots).toBe(2);
    expect(findMediaByBarcode(BUILTIN_MEDIA, "6971501227736")?.id).toBe(pair.id);
  });

  it("a pair is printed as one 320×240 page", () => {
    expect(pageSizePx(pair)).toEqual({ cols: 320, rows: 240 });
  });

  it("slots stack along the feed without gaps", () => {
    expect(slotRects(pair)).toEqual([
      { x: 0, y: 0, w: 320, h: 120 },
      { x: 0, y: 120, w: 320, h: 120 },
    ]);
  });

  it("single labels have one slot covering the page", () => {
    const m = findMediaById(BUILTIN_MEDIA, "t50x30")!;
    expect(pageSizePx(m)).toEqual({ cols: 400, rows: 240 });
    expect(slotRects(m)).toEqual([{ x: 0, y: 0, w: 400, h: 240 }]);
  });

  it("unknown or empty barcodes match nothing", () => {
    expect(findMediaByBarcode(BUILTIN_MEDIA, "000")).toBeUndefined();
    expect(findMediaByBarcode(BUILTIN_MEDIA, "")).toBeUndefined();
    expect(findMediaByBarcode(BUILTIN_MEDIA, undefined)).toBeUndefined();
  });

  it("user bindings override built-in barcodes without mutating the list", () => {
    const next = withBindings(BUILTIN_MEDIA, { "6971501227736": "t40x30", "1234567890123": "t50x30" });
    expect(findMediaByBarcode(next, "6971501227736")?.id).toBe("t40x30");
    expect(findMediaByBarcode(next, "1234567890123")?.id).toBe("t50x30");
    expect(findMediaById(next, pair.id)?.barcodes).toEqual([]);
    expect(pair.barcodes).toEqual(["6971501227736"]);
    // untouched profiles keep identity (cheap change detection)
    expect(findMediaById(next, "t40x20")).toBe(findMediaById(BUILTIN_MEDIA, "t40x20"));
  });
});
