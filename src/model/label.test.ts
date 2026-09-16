import { describe, expect, it } from "vitest";
import { emptyLabel, labelIsEmpty, labelKey, prettifyTitle } from "./label";

describe("prettifyTitle", () => {
  it("turns x between digits into a multiplication sign", () => {
    expect(prettifyTitle("M3x6")).toBe("M3×6");
    expect(prettifyTitle("M3 x 6")).toBe("M3×6");
    expect(prettifyTitle("M3X6")).toBe("M3×6");
    expect(prettifyTitle("10х20х2")).toBe("10×20×2"); // Cyrillic х
  });

  it("leaves other x alone", () => {
    expect(prettifyTitle("2x AA")).toBe("2x AA");
    expect(prettifyTitle("Torx T10")).toBe("Torx T10");
    expect(prettifyTitle("xor")).toBe("xor");
  });
});

describe("label helpers", () => {
  it("empty label is empty", () => {
    expect(labelIsEmpty(emptyLabel())).toBe(true);
    expect(labelIsEmpty({ ...emptyLabel(), title: "M3" })).toBe(false);
    expect(labelIsEmpty({ ...emptyLabel(), icon: { id: "led", params: {} } })).toBe(false);
  });

  it("key ignores param order and whitespace", () => {
    const a = { ...emptyLabel(), title: " M3×6 ", icon: { id: "bolt", params: { head: "hex", thread: "full" } } };
    const b = { ...emptyLabel(), title: "M3×6", icon: { id: "bolt", params: { thread: "full", head: "hex" } } };
    expect(labelKey(a)).toBe(labelKey(b));
    expect(labelKey({ ...a, caption: "болт" })).not.toBe(labelKey(a));
  });
});
