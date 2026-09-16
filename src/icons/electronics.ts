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

export const electronicsIcons: IconDef[] = [
  led,
  diode,
  zener,
  schottky,
  resistor,
  pot,
  ldr,
  thermistor,
  capCeramic,
  capElectrolytic,
  inductor,
  npn,
  pnp,
  mosfet,
  ic,
  crystal,
  fuse,
  sw,
  button,
  relay,
  battery,
  header,
  usb,
  module,
  buzzer,
  motor,
  wire,
  heatshrink,
  jumper,
  lightBulb,
  sdCard,
];
