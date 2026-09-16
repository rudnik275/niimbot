/** Инструмент и разное. */
import { F, S, arrow, art, circle, line, poly, rect, type IconDef, type Shape } from "./types";

const hexKey: IconDef = {
  id: "hexkey",
  name: "Шестигранный ключ",
  category: "tools",
  caption: "ключ",
  keywords: ["ключ", "шестигранник", "имбус", "hex key", "allen"],
  render: () => art(100, [S(poly([[22, 8], [22, 88], [92, 88]], false), { weight: 3 })]),
};

const bit: IconDef = {
  id: "bit",
  name: "Бита",
  category: "tools",
  caption: "биты",
  keywords: ["бита", "bit", "отвёртка", "ph2", "pz2"],
  render: () =>
    art(120, [
      S(rect(6, 38, 60, 24)),
      S(line(6, 50, 66, 50), { weight: 0.8 }),
      S(poly([[66, 38], [66, 62], [110, 56], [110, 44]])),
      S(line(110, 44, 116, 50), { weight: 1 }),
      S(line(110, 56, 116, 50), { weight: 1 }),
    ]),
};

const drill: IconDef = {
  id: "drill",
  name: "Сверло",
  category: "tools",
  caption: "сверло",
  keywords: ["сверло", "drill", "бур", "мм"],
  render: () =>
    art(120, [
      S(rect(4, 40, 32, 20)),
      S(poly([[36, 38], [92, 38], [116, 50], [92, 62], [36, 62]])),
      S(line(44, 40, 72, 60)),
      S(line(60, 40, 88, 60)),
    ]),
};

const blade: IconDef = {
  id: "blade",
  name: "Лезвие",
  category: "tools",
  caption: "лезвия",
  keywords: ["лезвие", "нож", "blade", "канцелярский"],
  render: () =>
    art(120, [
      S(poly([[6, 32], [114, 32], [114, 56], [6, 74]])),
      S(circle(20, 46, 5)),
      S(line(44, 32, 44, 68), { weight: 0.8 }),
      S(line(68, 32, 68, 64), { weight: 0.8 }),
      S(line(92, 32, 92, 60), { weight: 0.8 }),
    ]),
};

const tweezers: IconDef = {
  id: "tweezers",
  name: "Пинцет",
  category: "tools",
  caption: "пинцет",
  keywords: ["пинцет", "tweezers"],
  render: () => art(70, [S(`M18 14A17 8 0 0 1 52 14`), S(line(18, 14, 33, 92)), S(line(52, 14, 37, 92))]),
};

const screwdriver: IconDef = {
  id: "screwdriver",
  name: "Отвёртка",
  category: "tools",
  caption: "отвёртка",
  keywords: ["отвёртка", "screwdriver"],
  render: () => art(120, [S(rect(4, 34, 44, 32, 10)), S(line(48, 50, 108, 50), { weight: 2 }), S(line(108, 42, 116, 50)), S(line(108, 58, 116, 50))]),
};

const ruler: IconDef = {
  id: "ruler",
  name: "Линейка",
  category: "tools",
  caption: "мерное",
  keywords: ["линейка", "ruler", "измерение"],
  render: () => {
    const shapes: Shape[] = [S(rect(4, 34, 112, 32, 2))];
    for (let i = 1; i < 9; i++) {
      const x = 4 + i * 12.4;
      shapes.push(S(line(x, 34, x, i % 2 === 0 ? 52 : 44), { weight: 0.9 }));
    }
    return art(120, shapes);
  },
};

const tape: IconDef = {
  id: "tape",
  name: "Лента / скотч",
  category: "tools",
  caption: "лента",
  keywords: ["скотч", "лента", "изолента", "tape", "малярная"],
  render: () => art(110, [S(circle(46, 50, 42)), S(circle(46, 50, 22)), S(poly([[84, 60], [106, 90], [70, 88]], false))]),
};

const glue: IconDef = {
  id: "glue",
  name: "Клей",
  category: "tools",
  caption: "клей",
  keywords: ["клей", "glue", "суперклей", "эпоксидка"],
  render: () => art(70, [S(rect(14, 40, 42, 54, 5)), S(rect(26, 24, 18, 16)), F(rect(20, 8, 30, 16, 4))]),
};

const filament: IconDef = {
  id: "filament",
  name: "Филамент",
  category: "tools",
  caption: "филамент",
  keywords: ["филамент", "катушка", "filament", "pla", "petg", "3d", "печать"],
  render: () => art(110, [S(circle(48, 50, 42)), S(circle(48, 50, 12)), S(`M90 56C90 76 92 86 102 96`)]),
};

const batteryCell: IconDef = {
  id: "battery_cell",
  name: "Батарейка",
  category: "tools",
  caption: "батарейки",
  keywords: ["батарейка", "aa", "aaa", "cr2032", "18650", "battery"],
  render: () => art(120, [S(rect(4, 28, 92, 44, 5)), F(rect(96, 40, 10, 20, 2)), S(line(20, 50, 34, 50), { weight: 0.9 }), S(line(27, 43, 27, 57), { weight: 0.9 })]),
};

const box: IconDef = {
  id: "box",
  name: "Коробка",
  category: "misc",
  caption: "",
  keywords: ["коробка", "ящик", "box", "прочее"],
  render: () =>
    art(100, [
      S(poly([[50, 6], [92, 28], [92, 72], [50, 94], [8, 72], [8, 28]])),
      S(poly([[8, 28], [50, 50], [92, 28]], false)),
      S(line(50, 50, 50, 94)),
    ]),
};

const warning: IconDef = {
  id: "warning",
  name: "Внимание",
  category: "misc",
  caption: "",
  keywords: ["внимание", "осторожно", "warning", "опасно"],
  render: () => art(110, [S(poly([[55, 8], [104, 90], [6, 90]])), S(line(55, 36, 55, 60), { weight: 1.4 }), F(circle(55, 74, 5))]),
};

const food: IconDef = {
  id: "food",
  name: "Еда",
  category: "misc",
  caption: "",
  keywords: ["еда", "food", "продукты", "кухня"],
  render: () =>
    art(100, [
      S(`M30 8C44 22 46 48 30 58Z`),
      S(line(30, 58, 30, 94)),
      S(`M58 8L58 34A12 12 0 0 0 82 34L82 8`),
      S(line(70, 8, 70, 32), { weight: 0.9 }),
      S(line(70, 46, 70, 94)),
    ]),
};

const snowflake: IconDef = {
  id: "snowflake",
  name: "Морозилка",
  category: "misc",
  caption: "морозилка",
  keywords: ["морозилка", "холод", "заморозка", "frozen", "snow"],
  render: () => {
    const shapes: Shape[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI / 3) * i;
      const dx = 42 * Math.cos(a), dy = 42 * Math.sin(a);
      shapes.push(S(line(50 - dx, 50 - dy, 50 + dx, 50 + dy)));
      for (const s of [1, -1]) {
        const tx = 50 + s * 26 * Math.cos(a), ty = 50 + s * 26 * Math.sin(a);
        const b = a + Math.PI / 2;
        shapes.push(S(poly([[tx + 9 * Math.cos(b) + s * 8 * Math.cos(a), ty + 9 * Math.sin(b) + s * 8 * Math.sin(a)], [tx, ty], [tx - 9 * Math.cos(b) + s * 8 * Math.cos(a), ty - 9 * Math.sin(b) + s * 8 * Math.sin(a)]], false), { weight: 0.9 }));
      }
    }
    return art(100, shapes);
  },
};

const clock: IconDef = {
  id: "clock",
  name: "Срок / дата",
  category: "misc",
  caption: "до",
  keywords: ["срок", "дата", "часы", "годен", "clock", "date"],
  render: () => art(100, [S(circle(50, 50, 42)), S(poly([[50, 26], [50, 52], [68, 62]], false), { weight: 1.3 })]),
};

const jar: IconDef = {
  id: "jar",
  name: "Банка",
  category: "misc",
  caption: "",
  keywords: ["банка", "jar", "заготовки", "консервы"],
  render: () => art(90, [S(rect(12, 30, 66, 64, 10)), F(rect(8, 12, 74, 18, 4)), S(line(24, 46, 24, 78), { weight: 0.8 })]),
};

const arrowRight: IconDef = {
  id: "arrow",
  name: "Стрелка",
  category: "misc",
  caption: "",
  keywords: ["стрелка", "arrow", "направление"],
  render: () => art(100, [S(arrow(6, 50, 94, 50, 28), { weight: 2 })]),
};

const fan: IconDef = {
  id: "fan",
  name: "Вентилятор",
  category: "misc",
  caption: "вентилятор",
  keywords: ["вентилятор", "кулер", "fan", "cooler"],
  render: () => {
    const shapes: Shape[] = [S(circle(50, 50, 44)), F(circle(50, 50, 7))];
    for (let k = 0; k < 3; k++) {
      const a = (2 * Math.PI * k) / 3;
      const rot = (x: number, y: number): [number, number] => {
        const dx = x - 50, dy = y - 50;
        return [50 + dx * Math.cos(a) - dy * Math.sin(a), 50 + dx * Math.sin(a) + dy * Math.cos(a)];
      };
      const p = [rot(50, 44), rot(30, 22), rot(36, 10), rot(56, 12), rot(62, 30)];
      const d = `M${p[0]![0]} ${p[0]![1]}C${p[1]![0]} ${p[1]![1]} ${p[2]![0]} ${p[2]![1]} ${p[3]![0]} ${p[3]![1]}C${p[4]![0]} ${p[4]![1]} ${p[0]![0]} ${p[0]![1]} ${p[0]![0]} ${p[0]![1]}Z`;
      shapes.push(F(d.replace(/(\d+\.\d{2})\d+/g, "$1")));
    }
    return art(100, shapes);
  },
};

export const toolIcons: IconDef[] = [hexKey, bit, drill, blade, tweezers, screwdriver, ruler, tape, glue, filament, batteryCell];
export const miscIcons: IconDef[] = [box, warning, arrowRight, clock, food, jar, snowflake, fan];
