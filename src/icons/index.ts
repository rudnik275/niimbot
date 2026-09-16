import type { IconRef } from "../model/label";
import { electronicsIcons } from "./electronics";
import { fastenerIcons } from "./fasteners";
import { miscIcons, toolIcons } from "./tools";
import type { Category, IconArt, IconDef } from "./types";

export * from "./types";

export const ICONS: IconDef[] = [...fastenerIcons, ...electronicsIcons, ...toolIcons, ...miscIcons];

const byId = new Map(ICONS.map((i) => [i.id, i]));

export function iconById(id: string): IconDef | undefined {
  return byId.get(id);
}

export function iconsInCategory(cat: Category): IconDef[] {
  return ICONS.filter((i) => i.category === cat);
}

export function defaultParams(def: IconDef): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of def.params ?? []) out[p.id] = p.default;
  return out;
}

/** Fill missing/invalid params with defaults so stored refs survive icon updates. */
export function normalizeParams(def: IconDef, params: Record<string, string> | undefined): Record<string, string> {
  const out = defaultParams(def);
  for (const p of def.params ?? []) {
    const v = params?.[p.id];
    if (v !== undefined && p.options.some((o) => o.id === v)) out[p.id] = v;
  }
  return out;
}

export function renderIcon(ref: IconRef | null | undefined): IconArt | null {
  if (!ref) return null;
  const def = byId.get(ref.id);
  if (!def) return null;
  return def.render(normalizeParams(def, ref.params));
}

export function newIconRef(def: IconDef): IconRef {
  return { id: def.id, params: defaultParams(def) };
}

export function searchIcons(query: string): IconDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return ICONS;
  return ICONS.filter(
    (i) => i.name.toLowerCase().includes(q) || i.id.includes(q) || (i.keywords ?? []).some((k) => k.includes(q)),
  );
}
