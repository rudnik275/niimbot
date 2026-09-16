/**
 * Электроника — schematic symbols in the IEC/ГОСТ idiom (rectangular
 * resistor, filled diode triangle), horizontal, leads included, so a label on
 * a component drawer reads like the schematic it came from.
 */
import { F, S, arrow, art, circle, line, poly, rect, type IconDef, type Shape } from "./types";

const CY = 50;

function leads(x1: number, x2: number, cy = CY, w = 120): Shape[] {
  return [S(line(4, cy, x1, cy)), S(line(x2, cy, w - 4, cy))];
}

/** Diode body between x=40 and x=80. */
function diodeBody(cy: number, bar: "plain" | "zener" | "schottky"): Shape[] {
  const tri = F(poly([[40, cy - 24], [40, cy + 24], [80, cy]]));
  let barD: string;
  switch (bar) {
    case "zener":
      barD = `M88 ${cy - 24}L80 ${cy - 24}L80 ${cy + 24}L72 ${cy + 24}`;
      break;
    case "schottky":
      barD = `M72 ${cy - 18}L72 ${cy - 24}L80 ${cy - 24}L80 ${cy + 24}L88 ${cy + 24}L88 ${cy + 18}`;
      break;
    default:
      barD = line(80, cy - 24, 80, cy + 24);
  }
  return [tri, S(barD)];
}

const led: IconDef = {
  id: "led",
  name: "Светодиод",
  category: "electronics",
  caption: "светодиод",
  keywords: ["светодиод", "led", "диод"],
  render: () => {
    const cy = 62;
    return art(120, [
      ...leads(40, 80, cy),
      ...diodeBody(cy, "plain"),
      S(arrow(50, 34, 66, 8, 10)),
      S(arrow(66, 40, 82, 14, 10)),
    ]);
  },
};

const diode: IconDef = {
  id: "diode",
  name: "Диод",
  category: "electronics",
  caption: "диод",
  keywords: ["диод", "diode", "1n4007", "1n4148"],
  render: () => art(120, [...leads(40, 80), ...diodeBody(CY, "plain")]),
};

const zener: IconDef = {
  id: "zener",
  name: "Стабилитрон",
  category: "electronics",
  caption: "стабилитрон",
  keywords: ["стабилитрон", "zener"],
  render: () => art(120, [...leads(40, 80), ...diodeBody(CY, "zener")]),
};

const schottky: IconDef = {
  id: "schottky",
  name: "Диод Шоттки",
  category: "electronics",
  caption: "Шоттки",
  keywords: ["шоттки", "schottky", "диод"],
  render: () => art(120, [...leads(40, 80), ...diodeBody(CY, "schottky")]),
};

const resistorBody = (): Shape => S(rect(30, 36, 60, 28));

const resistor: IconDef = {
  id: "resistor",
  name: "Резистор",
  category: "electronics",
  caption: "резистор",
  keywords: ["резистор", "сопротивление", "resistor", "ом", "ohm", "кОм"],
  render: () => art(120, [...leads(30, 90), resistorBody()]),
};

const pot: IconDef = {
  id: "pot",
  name: "Потенциометр",
  category: "electronics",
  caption: "потенциометр",
  keywords: ["потенциометр", "переменный", "резистор", "pot", "trimmer", "подстроечный"],
  render: () => art(120, [...leads(30, 90, 44), S(rect(30, 30, 60, 28)), S(arrow(60, 94, 60, 62, 12))]),
};

const ldr: IconDef = {
  id: "ldr",
  name: "Фоторезистор",
  category: "electronics",
  caption: "фоторезистор",
  keywords: ["фоторезистор", "ldr", "свет"],
  render: () => {
    const cy = 62;
    return art(120, [...leads(30, 90, cy), S(rect(30, cy - 14, 60, 28)), S(arrow(30, 8, 46, 34, 10)), S(arrow(50, 6, 66, 32, 10))]);
  },
};

const thermistor: IconDef = {
  id: "thermistor",
  name: "Терморезистор",
  category: "electronics",
  caption: "термистор",
  keywords: ["терморезистор", "термистор", "ntc", "ptc", "thermistor"],
  render: () => art(120, [...leads(30, 90), resistorBody(), S(`M22 84L40 84L100 16`)]),
};

const capCeramic: IconDef = {
  id: "cap_ceramic",
  name: "Конденсатор",
  category: "electronics",
  caption: "конденсатор",
  keywords: ["конденсатор", "керамический", "capacitor", "нф", "пф", "nf", "pf"],
  render: () => art(120, [...leads(52, 68), S(line(52, 22, 52, 78), { weight: 1.5 }), S(line(68, 22, 68, 78), { weight: 1.5 })]),
};

const capElectrolytic: IconDef = {
  id: "cap_electrolytic",
  name: "Конденсатор электролитический",
  category: "electronics",
  caption: "электролит",
  keywords: ["конденсатор", "электролит", "electrolytic", "мкф", "uf", "µf"],
  render: () =>
    art(120, [
      ...leads(52, 72),
      S(line(52, 22, 52, 78), { weight: 1.5 }),
      F(rect(64, 22, 8, 56)),
      S(line(30, 20, 44, 20), { weight: 0.9 }),
      S(line(37, 13, 37, 27), { weight: 0.9 }),
    ]),
};

const inductor: IconDef = {
  id: "inductor",
  name: "Катушка / дроссель",
  category: "electronics",
  caption: "дроссель",
  keywords: ["катушка", "дроссель", "индуктивность", "inductor", "мкгн", "uh"],
  render: () =>
    art(120, [
      ...leads(20, 100),
      S(`M20 50A10 12 0 0 1 40 50A10 12 0 0 1 60 50A10 12 0 0 1 80 50A10 12 0 0 1 100 50`),
    ]),
};

function bjt(pnp: boolean): Shape[] {
  const cx = 58, cy = 50, r = 38;
  const bx = 34;
  const shapes: Shape[] = [
    S(circle(cx, cy, r)),
    S(line(bx, cy - 20, bx, cy + 20), { weight: 1.6 }),
    S(line(4, cy, bx, cy)),
    S(poly([[bx, cy - 10], [cx + 6, cy - 30], [cx + 6, 4]], false)),
    S(poly([[bx, cy + 10], [cx + 6, cy + 30], [cx + 6, 96]], false)),
  ];
  // emitter arrow: NPN points out (down), PNP points in (towards the base)
  if (pnp) shapes.push(F(poly([[bx + 2, cy + 8], [bx + 18, cy + 8], [bx + 10, cy + 20]])));
  else shapes.push(F(poly([[cx - 4, cy + 26], [cx + 10, cy + 20], [cx + 8, cy + 34]])));
  return shapes;
}

const npn: IconDef = {
  id: "npn",
  name: "Транзистор NPN",
  category: "electronics",
  caption: "транзистор",
  keywords: ["транзистор", "npn", "bjt", "2n2222", "bc547"],
  render: () => art(110, bjt(false)),
};

const pnp: IconDef = {
  id: "pnp",
  name: "Транзистор PNP",
  category: "electronics",
  caption: "транзистор",
  keywords: ["транзистор", "pnp", "bjt", "bc557"],
  render: () => art(110, bjt(true)),
};

const mosfet: IconDef = {
  id: "mosfet",
  name: "Полевой транзистор",
  category: "electronics",
  caption: "MOSFET",
  keywords: ["полевой", "mosfet", "fet", "irf", "irlz"],
  render: () =>
    art(110, [
      S(circle(60, 50, 40)),
      S(line(4, 50, 30, 50)),
      S(line(30, 28, 30, 72), { weight: 1.4 }),
      S(line(42, 26, 42, 40), { weight: 1.4 }),
      S(line(42, 44, 42, 56), { weight: 1.4 }),
      S(line(42, 60, 42, 74), { weight: 1.4 }),
      S(poly([[42, 33], [72, 33], [72, 4]], false)),
      S(poly([[42, 67], [72, 67], [72, 96]], false)),
      S(line(42, 50, 72, 50)),
      F(poly([[44, 50], [58, 43], [58, 57]])),
    ]),
};

const ic: IconDef = {
  id: "ic",
  name: "Микросхема",
  category: "electronics",
  caption: "микросхема",
  keywords: ["микросхема", "чип", "ic", "chip", "dip", "soic", "555", "atmega"],
  render: () => {
    const shapes: Shape[] = [S(rect(20, 28, 80, 44)), S(`M20 42A8 8 0 0 0 20 58`)];
    for (let i = 0; i < 4; i++) {
      const x = 30 + i * 20;
      shapes.push(S(line(x, 28, x, 14)), S(line(x, 72, x, 86)));
    }
    return art(120, shapes);
  },
};

const crystal: IconDef = {
  id: "crystal",
  name: "Кварц",
  category: "electronics",
  caption: "кварц",
  keywords: ["кварц", "резонатор", "crystal", "мгц", "mhz"],
  render: () =>
    art(120, [
      ...leads(38, 82),
      S(line(38, 26, 38, 74), { weight: 1.4 }),
      S(line(82, 26, 82, 74), { weight: 1.4 }),
      S(rect(48, 30, 24, 40)),
    ]),
};

const fuse: IconDef = {
  id: "fuse",
  name: "Предохранитель",
  category: "electronics",
  caption: "предохранитель",
  keywords: ["предохранитель", "fuse", "ампер"],
  render: () => art(120, [S(line(4, 50, 116, 50)), S(rect(30, 36, 60, 28))]),
};

const sw: IconDef = {
  id: "switch",
  name: "Переключатель",
  category: "electronics",
  caption: "переключатель",
  keywords: ["переключатель", "выключатель", "тумблер", "switch"],
  render: () =>
    art(120, [
      S(line(4, 50, 36, 50)),
      S(line(84, 50, 116, 50)),
      F(circle(40, 50, 5)),
      F(circle(80, 50, 5)),
      S(line(42, 46, 80, 22)),
    ]),
};

const button: IconDef = {
  id: "button",
  name: "Кнопка",
  category: "electronics",
  caption: "кнопка",
  keywords: ["кнопка", "тактовая", "button", "tact"],
  render: () =>
    art(120, [
      S(line(4, 58, 36, 58)),
      S(line(84, 58, 116, 58)),
      F(circle(40, 58, 5)),
      F(circle(80, 58, 5)),
      S(line(30, 40, 90, 40)),
      S(line(60, 40, 60, 22)),
      S(line(44, 22, 76, 22)),
    ]),
};

const relay: IconDef = {
  id: "relay",
  name: "Реле",
  category: "electronics",
  caption: "реле",
  keywords: ["реле", "relay"],
  render: () =>
    art(120, [
      S(rect(10, 30, 34, 40)),
      S(line(27, 4, 27, 30)),
      S(line(27, 70, 27, 96)),
      S(line(44, 50, 62, 50), { weight: 0.8 }),
      F(circle(66, 50, 5)),
      F(circle(106, 50, 5)),
      S(line(68, 46, 106, 24)),
      S(line(66, 55, 66, 96)),
      S(line(106, 55, 106, 96)),
    ]),
};

const battery: IconDef = {
  id: "battery",
  name: "Батарея (символ)",
  category: "electronics",
  caption: "аккумулятор",
  keywords: ["батарея", "аккумулятор", "battery", "li-ion", "18650", "lipo"],
  render: () =>
    art(120, [
      ...leads(46, 62),
      S(line(46, 18, 46, 82), { weight: 0.9 }),
      F(rect(56, 34, 8, 32)),
      S(line(24, 18, 36, 18), { weight: 0.9 }),
      S(line(30, 12, 30, 24), { weight: 0.9 }),
    ]),
};

const header: IconDef = {
  id: "header",
  name: "Разъём / гребёнка",
  category: "electronics",
  caption: "разъём",
  keywords: ["разъём", "гребёнка", "pin header", "connector", "jst", "dupont", "xh"],
  render: () => {
    const shapes: Shape[] = [];
    for (let i = 0; i < 4; i++) {
      const x = 6 + i * 23;
      shapes.push(S(rect(x, 32, 20, 36, 2)), F(circle(x + 10, 50, 4)));
    }
    return art(100, shapes);
  },
};

const usb: IconDef = {
  id: "usb",
  name: "USB",
  category: "electronics",
  caption: "USB",
  keywords: ["usb", "кабель", "type-c", "micro"],
  render: () =>
    art(110, [
      F(circle(12, 50, 7)),
      S(line(12, 50, 84, 50)),
      S(poly([[36, 50], [52, 26], [74, 26]], false)),
      F(rect(74, 19, 14, 14)),
      S(poly([[48, 50], [64, 74], [74, 74]], false)),
      F(circle(80, 74, 8)),
      F(poly([[84, 38], [106, 50], [84, 62]])),
    ]),
};

const module: IconDef = {
  id: "module",
  name: "Модуль / плата",
  category: "electronics",
  caption: "модуль",
  keywords: ["модуль", "плата", "module", "pcb", "arduino", "esp", "board"],
  render: () => {
    const shapes: Shape[] = [S(rect(6, 12, 88, 76, 5)), F(rect(40, 34, 30, 30, 2))];
    for (let i = 0; i < 4; i++) shapes.push(S(circle(18, 26 + i * 16, 4), { weight: 0.8 }));
    for (let i = 0; i < 4; i++) shapes.push(S(circle(82, 26 + i * 16, 4), { weight: 0.8 }));
    return art(100, shapes);
  },
};

const buzzer: IconDef = {
  id: "buzzer",
  name: "Зуммер / динамик",
  category: "electronics",
  caption: "зуммер",
  keywords: ["зуммер", "пищалка", "динамик", "buzzer", "speaker"],
  render: () => art(100, [S(`M16 64A34 34 0 0 1 84 64Z`), S(line(38, 64, 38, 92)), S(line(62, 64, 62, 92))]),
};

const motor: IconDef = {
  id: "motor",
  name: "Мотор",
  category: "electronics",
  caption: "мотор",
  keywords: ["мотор", "двигатель", "motor", "серво", "шаговый", "servo"],
  render: () =>
    art(100, [
      S(circle(50, 50, 38)),
      S(poly([[34, 66], [34, 34], [50, 54], [66, 34], [66, 66]], false)),
      S(line(4, 50, 12, 50)),
      S(line(88, 50, 96, 50)),
    ]),
};

const wire: IconDef = {
  id: "wire",
  name: "Провод",
  category: "electronics",
  caption: "провод",
  keywords: ["провод", "кабель", "wire", "awg", "мгтф"],
  render: () => art(120, [F(rect(4, 38, 62, 24, 12)), S(line(66, 50, 116, 50), { weight: 1.6 })]),
};

const heatshrink: IconDef = {
  id: "heatshrink",
  name: "Термоусадка",
  category: "electronics",
  caption: "термоусадка",
  keywords: ["термоусадка", "heat shrink", "трубка"],
  render: () =>
    art(120, [
      S(`M6 24L44 24C54 24 58 38 68 38L114 38`),
      S(`M6 76L44 76C54 76 58 62 68 62L114 62`),
      S(line(6, 24, 6, 76)),
      S(line(114, 38, 114, 62)),
    ]),
};

const jumper: IconDef = {
  id: "jumper",
  name: "Перемычка Dupont",
  category: "electronics",
  caption: "перемычки",
  keywords: ["перемычка", "dupont", "jumper", "провод"],
  render: () => art(120, [S(rect(4, 36, 26, 28, 3)), S(rect(90, 36, 26, 28, 3)), S(`M30 50C50 38 70 62 90 50`, { weight: 1.3 })]),
};

const lightBulb: IconDef = {
  id: "bulb",
  name: "Лампа",
  category: "electronics",
  caption: "лампа",
  keywords: ["лампа", "лампочка", "bulb", "освещение"],
  render: () =>
    art(80, [
      S(`M22 60A28 28 0 1 1 58 60L58 70L22 70Z`),
      S(rect(26, 70, 28, 10)),
      S(rect(30, 80, 20, 8, 3)),
      S(line(32, 46, 40, 58), { weight: 0.8 }),
      S(line(48, 46, 40, 58), { weight: 0.8 }),
    ]),
};

const sdCard: IconDef = {
  id: "sdcard",
  name: "Карта памяти",
  category: "electronics",
  caption: "microSD",
  keywords: ["карта", "памяти", "sd", "microsd", "флешка", "flash"],
  render: () =>
    art(70, [
      S(poly([[26, 4], [66, 4], [66, 96], [4, 96], [4, 26]])),
      ...[16, 28, 40, 52].map((x) => S(line(x, 12, x, 26), { weight: 0.9 })),
    ]),
};

const photodiode: IconDef = {
  id: "photodiode",
  name: "Фотодиод",
  category: "electronics",
  caption: "фотодиод",
  keywords: ["фотодиод", "photodiode", "ик", "приёмник", "bpw34"],
  render: () => {
    const cy = 62;
    return art(120, [
      ...leads(40, 80, cy),
      ...diodeBody(cy, "plain"),
      S(arrow(30, 8, 46, 34, 10)),
      S(arrow(50, 6, 66, 32, 10)),
    ]);
  },
};

const varicap: IconDef = {
  id: "varicap",
  name: "Варикап",
  category: "electronics",
  caption: "варикап",
  keywords: ["варикап", "варактор", "varicap", "varactor", "диод"],
  render: () =>
    art(120, [
      S(line(4, CY, 40, CY)),
      ...diodeBody(CY, "plain"),
      S(line(90, 26, 90, 74), { weight: 1.5 }),
      S(line(90, CY, 116, CY)),
    ]),
};

/** Двунаправленный супрессор: два стабилитрона с общим катодом. */
const tvs: IconDef = {
  id: "tvs",
  name: "Супрессор TVS",
  category: "electronics",
  caption: "супрессор",
  keywords: ["супрессор", "tvs", "защитный", "диод", "p6ke", "smbj"],
  render: () =>
    art(120, [
      S(line(4, CY, 28, CY)),
      S(line(92, CY, 116, CY)),
      F(poly([[28, 26], [28, 74], [60, CY]])),
      F(poly([[92, 26], [92, 74], [60, CY]])),
      S(`M52 24L60 24L60 76L68 76`),
    ]),
};

/** Залитый треугольник + полоса поперёк отрезка: диод, вписанный в схему моста. */
function diodeOn(x1: number, y1: number, x2: number, y2: number, size = 11): Shape[] {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const px = -uy, py = ux;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ax = mx + ux * size * 0.7, ay = my + uy * size * 0.7;
  const bx = mx - ux * size * 0.6, by = my - uy * size * 0.6;
  return [
    F(poly([[bx + px * size, by + py * size], [bx - px * size, by - py * size], [ax, ay]])),
    S(line(ax + px * size, ay + py * size, ax - px * size, ay - py * size)),
  ];
}

const bridge: IconDef = {
  id: "bridge",
  name: "Диодный мост",
  category: "electronics",
  caption: "диодный мост",
  keywords: ["мост", "выпрямитель", "bridge", "kbpc", "db107", "диод"],
  render: () => {
    const L = [14, CY] as const, R = [106, CY] as const, T = [60, 8] as const, B = [60, 92] as const;
    return art(120, [
      S(poly([[L[0], L[1]], [T[0], T[1]], [R[0], R[1]], [B[0], B[1]]])),
      ...diodeOn(L[0], L[1], T[0], T[1], 12),
      ...diodeOn(R[0], R[1], T[0], T[1], 12),
      ...diodeOn(B[0], B[1], L[0], L[1], 12),
      ...diodeOn(B[0], B[1], R[0], R[1], 12),
      S(line(2, CY, 14, CY)),
      S(line(106, CY, 118, CY)),
      S(line(60, 2, 60, 8)),
      S(line(60, 92, 60, 98)),
    ]);
  },
};

// --- тиристорная группа ----------------------------------------------------

const scr: IconDef = {
  id: "scr",
  name: "Тиристор",
  category: "electronics",
  caption: "тиристор",
  keywords: ["тиристор", "scr", "thyristor", "bt151", "ку202"],
  render: () => {
    const cy = 42;
    return art(120, [...leads(40, 80, cy), ...diodeBody(cy, "plain"), S(`M80 66L94 84L114 84`)]);
  },
};

/** Два встречных треугольника между общими шинами + управляющий электрод. */
function triacBody(gate: boolean): Shape[] {
  const shapes: Shape[] = [
    S(line(50, 4, 50, 26)),
    S(line(50, 74, 50, 96)),
    S(line(22, 26, 78, 26)),
    S(line(22, 74, 78, 74)),
    F(poly([[22, 26], [50, 26], [36, 74]])),
    F(poly([[50, 74], [78, 74], [64, 26]])),
  ];
  if (gate) shapes.push(S(line(22, 74, 6, 90)));
  return shapes;
}

const triac: IconDef = {
  id: "triac",
  name: "Симистор",
  category: "electronics",
  caption: "симистор",
  keywords: ["симистор", "триак", "triac", "bt136", "bta16", "тиристор"],
  render: () => art(100, triacBody(true)),
};

const diac: IconDef = {
  id: "diac",
  name: "Динистор",
  category: "electronics",
  caption: "динистор",
  keywords: ["динистор", "диак", "diac", "db3"],
  render: () => art(100, triacBody(false)),
};

const varistor: IconDef = {
  id: "varistor",
  name: "Варистор",
  category: "electronics",
  caption: "варистор",
  keywords: ["варистор", "varistor", "vdr", "mov", "k275", "защита"],
  render: () =>
    art(120, [
      ...leads(30, 90),
      resistorBody(),
      S(`M28 88L96 12`),
      S(`M8 66L8 82A8 8 0 0 0 24 82L24 66`, { weight: 0.8 }),
    ]),
};

const phototransistor: IconDef = {
  id: "phototransistor",
  name: "Фототранзистор",
  category: "electronics",
  caption: "фототранзистор",
  keywords: ["фототранзистор", "phototransistor", "ик", "приёмник"],
  render: () =>
    art(120, [
      S(circle(72, 50, 38)),
      S(line(48, 30, 48, 70), { weight: 1.6 }),
      S(poly([[48, 40], [78, 20], [78, 4]], false)),
      S(poly([[48, 60], [78, 80], [78, 96]], false)),
      F(poly([[68, 76], [82, 70], [80, 84]])),
      S(arrow(4, 16, 24, 36, 9)),
      S(arrow(14, 4, 34, 24, 9)),
    ]),
};

const igbt: IconDef = {
  id: "igbt",
  name: "IGBT",
  category: "electronics",
  caption: "IGBT",
  keywords: ["igbt", "транзистор", "ключ", "irg"],
  render: () =>
    art(110, [
      S(circle(60, 50, 40)),
      S(line(4, 50, 30, 50)),
      S(line(30, 28, 30, 72), { weight: 1.4 }),
      S(line(42, 24, 42, 76), { weight: 1.4 }),
      S(poly([[42, 34], [72, 34], [72, 6]], false)),
      S(poly([[42, 66], [72, 66], [72, 94]], false)),
      F(poly([[58, 60], [72, 66], [58, 72]])),
    ]),
};

const optocoupler: IconDef = {
  id: "optocoupler",
  name: "Оптрон",
  category: "electronics",
  caption: "оптрон",
  keywords: ["оптрон", "оптопара", "optocoupler", "pc817", "развязка"],
  render: () =>
    art(120, [
      S(rect(10, 18, 100, 64)),
      F(poly([[16, 32], [40, 32], [28, 52]])),
      S(line(16, 54, 40, 54)),
      S(line(28, 18, 28, 32)),
      S(line(28, 54, 28, 82)),
      S(line(28, 18, 28, 4)),
      S(line(28, 82, 28, 96)),
      S(line(78, 34, 78, 66), { weight: 1.4 }),
      S(poly([[78, 44], [94, 32], [94, 18]], false)),
      S(poly([[78, 56], [94, 70], [94, 82]], false)),
      S(line(94, 18, 94, 4)),
      S(line(94, 82, 94, 96)),
      S(arrow(48, 40, 68, 40, 8), { weight: 0.9 }),
      S(arrow(48, 60, 68, 60, 8), { weight: 0.9 }),
    ]),
};

const opamp: IconDef = {
  id: "opamp",
  name: "Операционный усилитель",
  category: "electronics",
  caption: "ОУ",
  keywords: ["операционный", "усилитель", "оу", "opamp", "lm358", "ne5532", "компаратор"],
  render: () =>
    art(120, [
      S(poly([[20, 8], [20, 92], [96, 50]])),
      S(line(4, 30, 20, 30)),
      S(line(4, 70, 20, 70)),
      S(line(96, 50, 116, 50)),
      S(line(28, 30, 40, 30), { weight: 0.9 }),
      S(line(28, 70, 40, 70), { weight: 0.9 }),
      S(line(34, 64, 34, 76), { weight: 0.9 }),
    ]),
};

/** Корпус TO-220: фланец с отверстием, тело, три ноги. */
const regulator: IconDef = {
  id: "regulator",
  name: "Стабилизатор (TO-220)",
  category: "electronics",
  caption: "стабилизатор",
  keywords: ["стабилизатор", "to-220", "7805", "lm317", "ams1117", "регулятор", "корпус"],
  render: () =>
    art(100, [
      S(rect(26, 8, 48, 24)),
      S(circle(50, 20, 6), { weight: 0.8 }),
      S(rect(18, 32, 64, 34)),
      S(line(32, 66, 32, 96)),
      S(line(50, 66, 50, 96)),
      S(line(68, 66, 68, 96)),
    ]),
};

const transformer: IconDef = {
  id: "transformer",
  name: "Трансформатор",
  category: "electronics",
  caption: "трансформатор",
  keywords: ["трансформатор", "transformer", "обмотка", "тор"],
  render: () =>
    art(120, [
      S(`M20 32A10 12 0 0 1 40 32A10 12 0 0 1 60 32A10 12 0 0 1 80 32`),
      S(`M20 68A10 12 0 0 0 40 68A10 12 0 0 0 60 68A10 12 0 0 0 80 68`),
      S(line(20, 46, 80, 46)),
      S(line(20, 54, 80, 54)),
      S(line(4, 32, 20, 32)),
      S(line(80, 32, 116, 32)),
      S(line(4, 68, 20, 68)),
      S(line(80, 68, 116, 68)),
    ]),
};

const capVariable: IconDef = {
  id: "cap_variable",
  name: "Конденсатор подстроечный",
  category: "electronics",
  caption: "подстроечный",
  keywords: ["конденсатор", "подстроечный", "переменный", "кпе", "trimmer", "variable"],
  render: () =>
    art(120, [
      S(line(4, CY, 52, CY)),
      S(line(68, CY, 116, CY)),
      S(line(52, 24, 52, 76), { weight: 1.5 }),
      S(line(68, 24, 68, 76), { weight: 1.5 }),
      S(arrow(28, 84, 94, 18, 12)),
    ]),
};

// --- индикация -------------------------------------------------------------

const seg7: IconDef = {
  id: "seg7",
  name: "Семисегментный индикатор",
  category: "electronics",
  caption: "индикатор",
  keywords: ["индикатор", "семисегментный", "сегмент", "7segment", "дисплей", "цифра"],
  render: () =>
    art(100, [
      S(rect(8, 4, 86, 92, 4), { weight: 0.8 }),
      S(line(30, 16, 62, 16), { weight: 1.5 }),
      S(line(26, 20, 26, 46), { weight: 1.5 }),
      S(line(66, 20, 66, 46), { weight: 1.5 }),
      S(line(30, 50, 62, 50), { weight: 1.5 }),
      S(line(26, 54, 26, 80), { weight: 1.5 }),
      S(line(66, 54, 66, 80), { weight: 1.5 }),
      S(line(30, 84, 62, 84), { weight: 1.5 }),
      F(circle(79, 82, 5)),
    ]),
};

const display: IconDef = {
  id: "display",
  name: "Дисплей",
  category: "electronics",
  caption: "дисплей",
  keywords: ["дисплей", "экран", "lcd", "oled", "display", "1602", "ssd1306"],
  render: () =>
    art(120, [
      S(rect(6, 12, 108, 76, 4)),
      S(rect(18, 24, 84, 40)),
      S(line(28, 38, 92, 38), { weight: 0.8 }),
      S(line(28, 52, 72, 52), { weight: 0.8 }),
      ...[24, 48, 72, 96].map((x) => S(line(x, 88, x, 96), { weight: 0.9 })),
    ]),
};

const sensor: IconDef = {
  id: "sensor",
  name: "Датчик",
  category: "electronics",
  caption: "датчик",
  keywords: ["датчик", "сенсор", "sensor", "dht", "hc-sr04", "ds18b20"],
  render: () =>
    art(110, [
      S(rect(10, 26, 66, 56, 3)),
      F(rect(24, 40, 30, 20, 2)),
      S(line(24, 82, 24, 96)),
      S(line(42, 82, 42, 96)),
      S(line(60, 82, 60, 96)),
      S(`M82 32A24 24 0 0 1 82 68`, { weight: 0.9 }),
      S(`M94 22A34 34 0 0 1 94 78`, { weight: 0.9 }),
    ]),
};

const antenna: IconDef = {
  id: "antenna",
  name: "Антенна",
  category: "electronics",
  caption: "антенна",
  keywords: ["антенна", "antenna", "wifi", "433", "nrf", "радио"],
  render: () => art(100, [S(line(50, 46, 50, 96)), S(line(50, 46, 20, 8)), S(line(50, 46, 80, 8))]),
};

const microphone: IconDef = {
  id: "microphone",
  name: "Микрофон",
  category: "electronics",
  caption: "микрофон",
  keywords: ["микрофон", "microphone", "mic", "max9814", "звук"],
  render: () =>
    art(100, [
      S(rect(34, 6, 32, 54, 16)),
      S(`M20 52A30 30 0 0 0 80 52`),
      S(line(50, 82, 50, 94)),
      S(line(30, 94, 70, 94)),
    ]),
};

// --- коммутация и разъёмы --------------------------------------------------

const dipSwitch: IconDef = {
  id: "dip_switch",
  name: "DIP-переключатель",
  category: "electronics",
  caption: "DIP-переключатель",
  keywords: ["dip", "переключатель", "движковый", "switch", "адрес"],
  render: () => {
    const shapes: Shape[] = [S(rect(8, 20, 104, 60, 3))];
    for (let i = 0; i < 4; i++) {
      const x = 18 + i * 24;
      shapes.push(S(rect(x, 28, 14, 44, 2), { weight: 0.8 }), F(rect(x + 2, i % 2 ? 52 : 32, 10, 18, 1)));
    }
    return art(120, shapes);
  },
};

const encoder: IconDef = {
  id: "encoder",
  name: "Энкодер",
  category: "electronics",
  caption: "энкодер",
  keywords: ["энкодер", "encoder", "ky-040", "ручка", "вал"],
  render: () =>
    art(100, [
      S(rect(42, 6, 16, 26, 3)),
      S(line(42, 14, 58, 14), { weight: 0.7 }),
      S(line(42, 21, 58, 21), { weight: 0.7 }),
      S(rect(38, 32, 24, 14)),
      S(rect(16, 46, 68, 42, 3)),
      S(line(30, 88, 30, 97)),
      S(line(50, 88, 50, 97)),
      S(line(70, 88, 70, 97)),
    ]),
};

const terminal: IconDef = {
  id: "terminal",
  name: "Клеммник",
  category: "electronics",
  caption: "клеммник",
  keywords: ["клеммник", "клемма", "terminal", "винтовой", "kf301", "колодка"],
  render: () =>
    art(120, [
      S(rect(8, 24, 104, 56, 4)),
      S(line(60, 24, 60, 80)),
      S(circle(34, 42, 11), { weight: 0.8 }),
      S(line(27, 42, 41, 42), { weight: 0.8 }),
      S(circle(86, 42, 11), { weight: 0.8 }),
      S(line(79, 42, 93, 42), { weight: 0.8 }),
      F(rect(24, 62, 20, 12, 3)),
      F(rect(76, 62, 20, 12, 3)),
    ]),
};

const dcJack: IconDef = {
  id: "dc_jack",
  name: "Разъём питания",
  category: "electronics",
  caption: "разъём питания",
  keywords: ["разъём", "питание", "dc", "jack", "5.5", "2.1", "штекер"],
  render: () =>
    art(100, [
      F(rect(2, 42, 22, 16, 8)),
      S(rect(24, 28, 54, 44, 6)),
      S(line(66, 28, 66, 72), { weight: 0.9 }),
      S(rect(78, 38, 18, 24, 4)),
    ]),
};

const audioJack: IconDef = {
  id: "audio_jack",
  name: "Аудиоджек",
  category: "electronics",
  caption: "джек 3.5",
  keywords: ["джек", "jack", "аудио", "3.5", "trs", "наушники", "штекер"],
  render: () =>
    art(100, [
      S(rect(4, 34, 34, 32, 5)),
      S(rect(38, 42, 42, 16, 2)),
      S(line(52, 42, 52, 58), { weight: 0.9 }),
      S(line(64, 42, 64, 58), { weight: 0.9 }),
      S(`M80 42L88 42A8 8 0 0 1 88 58L80 58Z`),
    ]),
};

// --- монтаж ----------------------------------------------------------------

const breadboard: IconDef = {
  id: "breadboard",
  name: "Макетная плата",
  category: "electronics",
  caption: "макетка",
  keywords: ["макетная", "плата", "макетка", "breadboard", "беспаечная"],
  render: () => {
    const shapes: Shape[] = [
      S(rect(6, 14, 108, 72, 4)),
      S(line(6, 46, 114, 46), { weight: 0.8 }),
      S(line(6, 54, 114, 54), { weight: 0.8 }),
    ];
    for (const y of [26, 38, 62, 74]) for (const x of [22, 40, 58, 76, 94]) shapes.push(F(circle(x, y, 4)));
    return art(120, shapes);
  },
};

const smd: IconDef = {
  id: "smd",
  name: "SMD-компонент",
  category: "electronics",
  caption: "SMD",
  keywords: ["smd", "чип", "0805", "0603", "1206", "смд", "поверхностный"],
  render: () =>
    art(120, [S(rect(10, 32, 100, 36, 3)), F(rect(10, 32, 18, 36, 3)), F(rect(92, 32, 18, 36, 3))]),
};

const heatsink: IconDef = {
  id: "heatsink",
  name: "Радиатор",
  category: "electronics",
  caption: "радиатор",
  keywords: ["радиатор", "heatsink", "охлаждение", "кулер"],
  render: () => {
    const shapes: Shape[] = [S(rect(6, 72, 108, 16))];
    for (let i = 0; i < 6; i++) shapes.push(S(line(14 + i * 18, 16, 14 + i * 18, 72), { weight: 1.3 }));
    return art(120, shapes);
  },
};

export const electronicsIcons: IconDef[] = [
  led,
  diode,
  zener,
  schottky,
  photodiode,
  varicap,
  tvs,
  bridge,
  resistor,
  pot,
  ldr,
  thermistor,
  varistor,
  capCeramic,
  capElectrolytic,
  capVariable,
  inductor,
  transformer,
  npn,
  pnp,
  phototransistor,
  mosfet,
  igbt,
  scr,
  triac,
  diac,
  optocoupler,
  ic,
  opamp,
  regulator,
  crystal,
  fuse,
  sw,
  button,
  dipSwitch,
  encoder,
  relay,
  battery,
  header,
  terminal,
  dcJack,
  audioJack,
  usb,
  module,
  breadboard,
  smd,
  seg7,
  display,
  sensor,
  antenna,
  microphone,
  buzzer,
  motor,
  heatsink,
  wire,
  heatshrink,
  jumper,
  lightBulb,
  sdCard,
];
