/**
 * Крепёж. The bolt is parametric: head profile (side view) × thread/tip ×
 * drive (end view of the head, drawn to the left like an engineering
 * drawing's end elevation). Everything else is a fixed pictogram.
 */
import {
  F,
  FS,
  S,
  art,
  circle,
  hexFlat,
  line,
  ngon,
  poly,
  rect,
  zigzag,
  type IconArt,
  type IconDef,
  type Shape,
} from "./types";

const CY = 50;
/** Shank half-height (Ø26 in a 100-unit box). */
const SR = 13;
const SHANK_END = 196;

type Head = "hex" | "cyl" | "button" | "pan" | "flat" | "none";
type Thread = "full" | "partial" | "wood";
type Drive = "none" | "plain" | "hexsocket" | "phillips" | "slot" | "torx";

/** Returns head shapes and the x where the shank starts. */
function head(kind: Head): { shapes: Shape[]; shankX: number } {
  switch (kind) {
    case "hex": {
      const x = 4, w = 42, hh = 30, ch = 6;
      const outline = poly([
        [x + ch, CY - hh],
        [x + w, CY - hh],
        [x + w, CY + hh],
        [x + ch, CY + hh],
        [x, CY + hh - ch],
        [x, CY - hh + ch],
      ]);
      return {
        shapes: [S(outline), S(line(x + 2, CY - 14, x + w, CY - 14)), S(line(x + 2, CY + 14, x + w, CY + 14))],
        shankX: x + w,
      };
    }
    case "cyl": {
      const x = 4, w = 44, hh = 22;
      return { shapes: [S(rect(x, CY - hh, w, hh * 2, 5))], shankX: x + w };
    }
    case "pan": {
      // short cylinder with a generously rounded top edge
      const x = 10, w = 32, hh = 24, r = 14;
      const d =
        `M${x + w} ${CY - hh}L${x + r} ${CY - hh}A${r} ${r} 0 0 0 ${x} ${CY - hh + r}` +
        `L${x} ${CY + hh - r}A${r} ${r} 0 0 0 ${x + r} ${CY + hh}L${x + w} ${CY + hh}Z`;
      return { shapes: [S(d)], shankX: x + w };
    }
    case "button": {
      const x = 8, w = 30, hh = 25;
      const d = `M${x + w} ${CY - hh}C${x + 10} ${CY - hh} ${x} ${CY - 12} ${x} ${CY}C${x} ${CY + 12} ${x + 10} ${CY + hh} ${x + w} ${CY + hh}Z`;
      return { shapes: [S(d)], shankX: x + w };
    }
    case "flat": {
      const x = 6, hh = 27, cone = 30;
      return {
        shapes: [S(poly([[x, CY - hh], [x, CY + hh], [x + cone, CY + SR], [x + cone, CY - SR]]))],
        shankX: x + cone,
      };
    }
    case "none":
      return { shapes: [], shankX: 6 };
  }
}

function thread(kind: Thread, x0: number, headless: boolean): Shape[] {
  const top = CY - SR, bot = CY + SR;
  // Coarse, tall teeth: at 60 px icon height a 12-unit pitch melts into a wavy band.
  const amp = 7, pitch = 17;
  const end = SHANK_END;
  const shapes: Shape[] = [];

  if (kind === "wood") {
    // Tapered shank ending in a point; teeth shrink towards the tip.
    const tipX = end;
    const len = tipX - x0;
    const edge = (sign: number, up: boolean): string => {
      const pts: Array<[number, number]> = [];
      const n = Math.max(4, Math.round(len / (pitch * 0.75)));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = x0 + t * len;
        const core = SR * (1 - t) ; // radius shrinking to 0 at tip
        const a = (i % 2 === 0) === up ? amp * (1 - t * 0.7) : 0;
        pts.push([x, CY + sign * (core + a)]);
      }
      return poly(pts, false);
    };
    shapes.push(S(edge(-1, true)), S(edge(1, true)));
    shapes.push(S(line(x0, top, x0, bot)));
    return shapes;
  }

  let threadStart = x0;
  if (kind === "partial") {
    threadStart = x0 + Math.round((end - x0) * 0.42);
    shapes.push(S(line(x0, top, threadStart, top)), S(line(x0, bot, threadStart, bot)));
    shapes.push(S(line(threadStart, top - amp / 2, threadStart, bot + amp / 2)));
  }
  // teeth: start "up" on top edge and "down" on bottom so the two edges mirror
  shapes.push(S(zigzag(threadStart, end - 3, top, amp, pitch, false)));
  shapes.push(S(zigzag(threadStart, end - 3, bot, amp, pitch, true)));
  // blunt end with a small chamfer
  shapes.push(S(poly([[end - 3, top + amp / 2], [end, top + amp / 2 + 3], [end, bot - amp / 2 - 3], [end - 3, bot - amp / 2]], false)));
  if (headless) shapes.push(S(line(x0, top + amp / 2, x0, bot - amp / 2)));
  return shapes;
}

/** End view of the head: hexagon for hex heads, circle otherwise, plus the recess. */
function endView(headKind: Head, drive: Drive): Shape[] {
  const cx = 34, r = 30;
  const shapes: Shape[] = [];
  if (headKind === "hex") {
    shapes.push(S(hexFlat(cx, CY, r + 2)));
    shapes.push(S(circle(cx, CY, r - 8), { weight: 0.8 }));
  } else if (headKind === "none") {
    shapes.push(S(circle(cx, CY, SR + 6)));
  } else {
    shapes.push(S(circle(cx, CY, r)));
  }
  const recessR = headKind === "none" ? 9 : 13;
  switch (drive) {
    case "hexsocket":
      shapes.push(F(ngon(cx, CY, recessR, 6, 30)));
      break;
    case "phillips": {
      const a = recessR + 3, b = 4;
      shapes.push(F(rect(cx - a, CY - b, a * 2, b * 2)), F(rect(cx - b, CY - a, b * 2, a * 2)));
      break;
    }
    case "slot":
      shapes.push(F(rect(cx - recessR - 3, CY - 4, (recessR + 3) * 2, 8)));
      break;
    case "torx": {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 12; i++) {
        const rr = i % 2 === 0 ? recessR + 2 : recessR - 5;
        const a = (Math.PI / 6) * i - Math.PI / 2;
        pts.push([cx + rr * Math.cos(a), CY + rr * Math.sin(a)]);
      }
      shapes.push(F(poly(pts)));
      break;
    }
    case "plain":
    case "none":
      break;
  }
  return shapes;
}

function shift(shapes: Shape[], dx: number): Shape[] {
  if (dx === 0) return shapes;
  // Path data only uses M/L/A/C with absolute coordinates; shift x of every
  // coordinate pair. Arc commands carry (rx ry rot large sweep x y): only the
  // final pair moves. We re-tokenise conservatively.
  return shapes.map((s) => ({ ...s, d: shiftPath(s.d, dx) }));
}

export function shiftPath(d: string, dx: number): string {
  const tokens = d.match(/[MLACZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const out: string[] = [];
  let cmd = "";
  let idx = 0;
  for (const t of tokens) {
    if (/[MLACZ]/.test(t)) {
      cmd = t;
      idx = 0;
      out.push(t);
      continue;
    }
    let v = parseFloat(t);
    if (cmd === "M" || cmd === "L") {
      if (idx % 2 === 0) v += dx;
    } else if (cmd === "C") {
      if (idx % 2 === 0) v += dx;
    } else if (cmd === "A") {
      if (idx % 7 === 5) v += dx;
    }
    out.push(Math.round(v * 100) / 100 + "");
    idx++;
  }
  // re-join keeping a space between numbers
  let s = "";
  for (let i = 0; i < out.length; i++) {
    const t = out[i]!;
    if (/[MLACZ]/.test(t)) s += t;
    else s += (i > 0 && !/[MLACZ]/.test(out[i - 1]!) ? " " : "") + t;
  }
  return s;
}

export function renderBolt(p: Record<string, string>): IconArt {
  const h = (p.head ?? "cyl") as Head;
  const t = (p.thread ?? "full") as Thread;
  const d = (p.drive ?? "none") as Drive;
  const hd = head(h);
  const side: Shape[] = [...hd.shapes, ...thread(t, hd.shankX, h === "none")];
  if (d === "none") return art(200, side);
  const dx = 72;
  return art(200 + dx, [...endView(h, d), ...shift(side, dx)]);
}

export const bolt: IconDef = {
  id: "bolt",
  name: "Болт / винт",
  category: "fasteners",
  caption: "болт",
  keywords: ["болт", "винт", "саморез", "шуруп", "bolt", "screw", "m3", "m4", "din912", "din7985", "din965"],
  params: [
    {
      id: "head",
      name: "Головка",
      default: "cyl",
      options: [
        { id: "cyl", name: "Цилиндр (DIN 912)" },
        { id: "hex", name: "Шестигранник (DIN 933)" },
        { id: "button", name: "Полусфера (ISO 7380)" },
        { id: "pan", name: "Полукруглая (DIN 7985)" },
        { id: "flat", name: "Потайная (DIN 965)" },
        { id: "none", name: "Без головки (шпилька)" },
      ],
    },
    {
      id: "thread",
      name: "Резьба",
      default: "full",
      options: [
        { id: "full", name: "Метрическая, полная" },
        { id: "partial", name: "Метрическая, частичная" },
        { id: "wood", name: "Саморез (острый)" },
      ],
    },
    {
      id: "drive",
      name: "Вид сверху / шлиц",
      default: "none",
      options: [
        { id: "none", name: "Не показывать" },
        { id: "plain", name: "Без шлица" },
        { id: "hexsocket", name: "Внутренний шестигранник" },
        { id: "phillips", name: "Крест (PH/PZ)" },
        { id: "slot", name: "Прямой шлиц" },
        { id: "torx", name: "Torx" },
      ],
    },
  ],
  render: renderBolt,
};

// --- fixed pictograms --------------------------------------------------------

const nutHex: IconDef = {
  id: "nut_hex",
  name: "Гайка",
  category: "fasteners",
  caption: "гайка",
  keywords: ["гайка", "nut", "din934"],
  render: () => art(100, [S(hexFlat(50, 50, 46)), S(circle(50, 50, 20))]),
};

const nutNyloc: IconDef = {
  id: "nut_nyloc",
  name: "Гайка самоконтрящаяся",
  category: "fasteners",
  caption: "гайка с фиксатором",
  keywords: ["гайка", "нейлон", "самоконтрящаяся", "nyloc", "din985"],
  render: () =>
    art(100, [
      S(rect(12, 40, 76, 44)),
      S(line(12, 55, 88, 55)),
      S(line(12, 69, 88, 69)),
      S(rect(26, 22, 48, 18, 8)),
    ]),
};

const nutWing: IconDef = {
  id: "nut_wing",
  name: "Гайка-барашек",
  category: "fasteners",
  caption: "барашек",
  keywords: ["барашек", "гайка", "wing nut"],
  render: () =>
    art(100, [
      S(poly([[40, 46], [12, 22], [4, 34], [38, 62]])),
      S(poly([[60, 46], [88, 22], [96, 34], [62, 62]])),
      S(circle(50, 58, 18)),
      S(circle(50, 58, 7)),
    ]),
};

const nutSquare: IconDef = {
  id: "nut_square",
  name: "Гайка квадратная",
  category: "fasteners",
  caption: "гайка",
  keywords: ["гайка", "квадратная", "square nut", "din562"],
  render: () => art(100, [S(rect(10, 10, 80, 80, 6)), S(circle(50, 50, 20))]),
};

const washerFlat: IconDef = {
  id: "washer_flat",
  name: "Шайба",
  category: "fasteners",
  caption: "шайба",
  keywords: ["шайба", "washer", "din125"],
  render: () => art(100, [S(circle(50, 50, 46)), S(circle(50, 50, 22))]),
};

const washerSpring: IconDef = {
  id: "washer_spring",
  name: "Шайба-гровер",
  category: "fasteners",
  caption: "гровер",
  keywords: ["гровер", "шайба", "пружинная", "spring washer", "din127"],
  render: () => {
    const cx = 50, cy = 50, ro = 46, ri = 24;
    const a1 = (-70 * Math.PI) / 180, a2 = (-110 * Math.PI) / 180;
    const P = (r: number, a: number, off = 0): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a) + off];
    const [ox1, oy1] = P(ro, a1), [ox2, oy2] = P(ro, a2, 10);
    const [ix1, iy1] = P(ri, a1), [ix2, iy2] = P(ri, a2, 10);
    const outer = `M${ox1} ${oy1}A${ro} ${ro} 0 1 1 ${ox2} ${oy2}`;
    const inner = `M${ix1} ${iy1}A${ri} ${ri} 0 1 1 ${ix2} ${iy2}`;
    return art(100, [S(outer), S(inner), S(line(ox1, oy1, ix1, iy1)), S(line(ox2, oy2, ix2, iy2))]);
  },
};

const standoff: IconDef = {
  id: "standoff",
  name: "Стойка",
  category: "fasteners",
  caption: "стойка",
  keywords: ["стойка", "spacer", "standoff", "дистанционная"],
  render: () =>
    art(120, [
      S(rect(30, 34, 66, 32)),
      S(line(30, 45, 96, 45)),
      S(line(30, 55, 96, 55)),
      S(zigzag(4, 30, 42, 4, 8)),
      S(zigzag(4, 30, 58, 4, 8, false)),
      S(line(4, 42, 4, 58)),
      S(rect(102, 42, 14, 16)),
    ]),
};

const insert: IconDef = {
  id: "insert",
  name: "Втулка с резьбой",
  category: "fasteners",
  caption: "втулка",
  keywords: ["втулка", "insert", "heat set", "запрессовка", "3d"],
  render: () => {
    const shapes: Shape[] = [S(rect(18, 6, 34, 88)), S(rect(28, 6, 14, 88), { weight: 0.8 })];
    // two knurled bands, drawn as teeth on both silhouette edges
    for (const y of [16, 58]) {
      shapes.push(S(poly([[18, y], [11, y + 6], [18, y + 12], [11, y + 18], [18, y + 24]], false)));
      shapes.push(S(poly([[52, y], [59, y + 6], [52, y + 12], [59, y + 18], [52, y + 24]], false)));
    }
    return art(70, shapes);
  },
};

const rivet: IconDef = {
  id: "rivet",
  name: "Заклёпка",
  category: "fasteners",
  caption: "заклёпка",
  keywords: ["заклёпка", "rivet", "вытяжная"],
  render: () =>
    art(60, [S(line(30, 4, 30, 42), { weight: 0.9 }), S(rect(8, 42, 44, 12, 4)), S(rect(19, 54, 22, 42))]),
};

const spring: IconDef = {
  id: "spring",
  name: "Пружина",
  category: "fasteners",
  caption: "пружина",
  keywords: ["пружина", "spring"],
  render: () => {
    const shapes: Shape[] = [S(line(20, 8, 80, 8)), S(line(20, 92, 80, 92))];
    for (let y = 8; y < 92; y += 14) shapes.push(S(line(80, y, 20, y + 14)));
    return art(100, shapes);
  },
};

const anchor: IconDef = {
  id: "anchor",
  name: "Дюбель",
  category: "fasteners",
  caption: "дюбель",
  keywords: ["дюбель", "anchor", "wall plug"],
  render: () =>
    art(60, [
      S(rect(18, 6, 24, 88, 3)),
      S(line(30, 60, 30, 94), { weight: 0.9 }),
      ...[22, 38, 54].flatMap((y) => [S(poly([[18, y], [8, y + 6], [18, y + 12]])), S(poly([[42, y], [52, y + 6], [42, y + 12]]))]),
    ]),
};

const magnet: IconDef = {
  id: "magnet",
  name: "Магнит",
  category: "fasteners",
  caption: "магнит",
  keywords: ["магнит", "неодим", "magnet"],
  render: () =>
    art(100, [
      S(`M10 34A40 14 0 1 0 90 34A40 14 0 1 0 10 34Z`),
      S(line(10, 34, 10, 66)),
      S(line(90, 34, 90, 66)),
      S(`M10 66A40 14 0 0 0 90 66`),
    ]),
};

const bearing: IconDef = {
  id: "bearing",
  name: "Подшипник",
  category: "fasteners",
  caption: "подшипник",
  keywords: ["подшипник", "bearing", "608"],
  render: () => {
    const shapes: Shape[] = [S(circle(50, 50, 46)), S(circle(50, 50, 34)), S(circle(50, 50, 16))];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      shapes.push(F(circle(50 + 25 * Math.cos(a), 50 + 25 * Math.sin(a), 5)));
    }
    return art(100, shapes);
  },
};

const oring: IconDef = {
  id: "oring",
  name: "Кольцо уплотнительное",
  category: "fasteners",
  caption: "уплотнение",
  keywords: ["кольцо", "уплотнение", "o-ring", "резинка"],
  render: () => art(100, [S(circle(50, 50, 38), { weight: 3.2 })]),
};

const cableTie: IconDef = {
  id: "cable_tie",
  name: "Стяжка",
  category: "fasteners",
  caption: "стяжки",
  keywords: ["стяжка", "хомут", "zip tie", "cable tie"],
  render: () =>
    art(120, [
      S(rect(4, 42, 68, 16, 8)),
      S(rect(72, 32, 28, 36, 4)),
      S(line(100, 50, 116, 50), { weight: 1.2 }),
      S(line(84, 32, 84, 68), { weight: 0.8 }),
    ]),
};

export const fastenerIcons: IconDef[] = [
  bolt,
  nutHex,
  nutNyloc,
  nutWing,
  nutSquare,
  washerFlat,
  washerSpring,
  standoff,
  insert,
  rivet,
  spring,
  anchor,
  magnet,
  bearing,
  oring,
  cableTie,
];

// re-export for tests
export { FS };
