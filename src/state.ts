/**
 * Application state: Preact signals + localStorage persistence.
 * Everything the user can change lives here; rendering and printing read it.
 */
import { computed, effect, signal } from "@preact/signals";
import { cloneLabel, emptyLabel, labelIsEmpty, labelKey, type LabelSpec } from "./model/label";
import { BUILTIN_MEDIA, DEFAULT_MEDIA_ID, findMediaById, withBindings, type MediaProfile } from "./model/media";
import { DEFAULT_THRESHOLD } from "./render/raster";

export interface PrintSettings {
  density: number;
  copies: number;
  offsetX: number;
  offsetY: number;
  threshold: number;
}

export interface SavedLabel {
  key: string;
  spec: LabelSpec;
  at: number;
  pinned: boolean;
  uses: number;
}

interface Persisted {
  v: 1;
  labels: LabelSpec[];
  mirror: boolean;
  mediaId: string;
  customMedia: MediaProfile[];
  bindings: Record<string, string>;
  print: PrintSettings;
  library: SavedLabel[];
}

const STORAGE_KEY = "birka.v1";

const DEFAULT_PRINT: PrintSettings = { density: 3, copies: 1, offsetX: 0, offsetY: 0, threshold: DEFAULT_THRESHOLD };

function load(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Partial<Persisted>;
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

const saved = load();

function normLabel(l: Partial<LabelSpec> | undefined): LabelSpec {
  const e = emptyLabel();
  if (!l) return e;
  // Older snapshots may carry font/frame/captionRules fields; they are dropped
  // on purpose — every label is set in the one fixed style now.
  return {
    icon: l.icon && typeof l.icon.id === "string" ? { id: l.icon.id, params: { ...(l.icon.params ?? {}) } } : null,
    title: typeof l.title === "string" ? l.title : e.title,
    caption: typeof l.caption === "string" ? l.caption : e.caption,
  };
}

// --- signals -----------------------------------------------------------------

export const labels = signal<LabelSpec[]>(
  saved.labels?.length ? saved.labels.map(normLabel) : [{ ...emptyLabel(), icon: { id: "bolt", params: { head: "cyl", thread: "full", drive: "none" } }, title: "M3×6", caption: "болт" }, emptyLabel()],
);
export const activeSlot = signal(0);
export const mirror = signal(saved.mirror ?? false);
export const customMedia = signal<MediaProfile[]>(saved.customMedia ?? []);
export const bindings = signal<Record<string, string>>(saved.bindings ?? {});
export const mediaId = signal(saved.mediaId ?? DEFAULT_MEDIA_ID);
export const printSettings = signal<PrintSettings>({ ...DEFAULT_PRINT, ...(saved.print ?? {}) });
export const library = signal<SavedLabel[]>(saved.library ?? []);
/** Bumped whenever label fonts finish loading; the preview re-renders on it. */
export const fontsVersion = signal(0);

export const mediaList = computed(() => withBindings([...BUILTIN_MEDIA, ...customMedia.value], bindings.value));
export const media = computed<MediaProfile>(() => findMediaById(mediaList.value, mediaId.value) ?? mediaList.value[0]!);

/** Labels as they will be printed, one per slot, honouring the mirror switch. */
export const pageLabels = computed<LabelSpec[]>(() => {
  const n = media.value.slots;
  const src = labels.value;
  return Array.from({ length: n }, (_, i) => (mirror.value && i > 0 ? src[0] : src[i]) ?? emptyLabel());
});

export const activeLabel = computed<LabelSpec>(() => labels.value[activeSlot.value] ?? emptyLabel());
export const pageIsBlank = computed(() => pageLabels.value.every(labelIsEmpty));

// --- actions -------------------------------------------------------------------

export function updateLabel(i: number, patch: Partial<LabelSpec>) {
  const next = labels.value.slice();
  while (next.length <= i) next.push(emptyLabel());
  next[i] = { ...next[i]!, ...patch };
  labels.value = next;
}

export function updateActive(patch: Partial<LabelSpec>) {
  updateLabel(activeSlot.value, patch);
}

export function loadInto(i: number, spec: LabelSpec) {
  updateLabel(i, cloneLabel(spec));
}

export function swapSlots() {
  const [a, b] = labels.value;
  if (!a || !b) return;
  labels.value = [b, a, ...labels.value.slice(2)];
}

export function selectMedia(id: string) {
  if (!findMediaById(mediaList.value, id)) return;
  mediaId.value = id;
}

export function addCustomMedia(m: MediaProfile) {
  customMedia.value = [...customMedia.value, m];
  mediaId.value = m.id;
}

export function removeCustomMedia(id: string) {
  customMedia.value = customMedia.value.filter((m) => m.id !== id);
  if (mediaId.value === id) mediaId.value = DEFAULT_MEDIA_ID;
}

export function bindRoll(barcode: string, toMediaId: string) {
  const code = barcode.trim();
  if (!code) return;
  bindings.value = { ...bindings.value, [code]: toMediaId };
}

export function updatePrint(patch: Partial<PrintSettings>) {
  printSettings.value = { ...printSettings.value, ...patch };
}

const LIBRARY_CAP = 48;

function upsertSaved(spec: LabelSpec, opts: { pin?: boolean; use?: boolean }) {
  if (labelIsEmpty(spec)) return;
  const key = labelKey(spec);
  const now = Date.now();
  const list = library.value.slice();
  const idx = list.findIndex((s) => s.key === key);
  if (idx >= 0) {
    const cur = list[idx]!;
    list[idx] = { ...cur, at: now, uses: cur.uses + (opts.use ? 1 : 0), pinned: cur.pinned || !!opts.pin, spec: cloneLabel(spec) };
  } else {
    list.push({ key, spec: cloneLabel(spec), at: now, pinned: !!opts.pin, uses: opts.use ? 1 : 0 });
  }
  // trim unpinned, oldest first
  const pinned = list.filter((s) => s.pinned);
  const rest = list.filter((s) => !s.pinned).sort((a, b) => b.at - a.at).slice(0, LIBRARY_CAP);
  library.value = [...pinned, ...rest];
}

export function recordPrinted(specs: readonly LabelSpec[]) {
  const seen = new Set<string>();
  for (const s of specs) {
    const k = labelKey(s);
    if (seen.has(k)) continue;
    seen.add(k);
    upsertSaved(s, { use: true });
  }
}

export function saveSlot(i: number) {
  const l = labels.value[i];
  if (l) upsertSaved(l, { pin: true });
}

export function togglePin(key: string) {
  library.value = library.value.map((s) => (s.key === key ? { ...s, pinned: !s.pinned } : s));
}

export function removeSaved(key: string) {
  library.value = library.value.filter((s) => s.key !== key);
}

export const sortedLibrary = computed(() =>
  library.value.slice().sort((a, b) => (a.pinned === b.pinned ? b.at - a.at : a.pinned ? -1 : 1)),
);

// --- persistence -------------------------------------------------------------------

let saveTimer: ReturnType<typeof setTimeout> | undefined;
effect(() => {
  const snapshot: Persisted = {
    v: 1,
    labels: labels.value,
    mirror: mirror.value,
    mediaId: mediaId.value,
    customMedia: customMedia.value,
    bindings: bindings.value,
    print: printSettings.value,
    library: library.value,
  };
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* quota or private mode: state simply is not persisted */
    }
  }, 150);
});

// keep active slot valid when media changes
effect(() => {
  const n = media.value.slots;
  if (activeSlot.value >= n) activeSlot.value = 0;
  if (mirror.value && activeSlot.value > 0) activeSlot.value = 0;
});
