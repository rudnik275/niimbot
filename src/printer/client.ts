/**
 * Thin, stateful wrapper over niimbluelib's Web Bluetooth client (v0.46).
 * Exposes a Preact signal with everything the UI needs and three verbs:
 * connect, disconnect, print. RFID is polled explicitly: after connecting,
 * after every print, and whenever the heartbeat says the paper/lid changed.
 */
import { signal } from "@preact/signals";
import {
  ImageEncoder,
  LabelType,
  PageColorType,
  instantiateClient,
  type HeartbeatData,
  type NiimbotAbstractClient,
  type PrintDirection,
  type PrintTaskName,
  type RfidInfo,
} from "@mmote/niimbluelib";
import type { MediaKind } from "../model/media";
import { rotateCCW } from "../render/draw";

export type ConnState = "disconnected" | "connecting" | "connected" | "printing";

export interface RollInfo {
  barcode: string;
  total: number;
  used: number;
  /** niimbluelib LabelType of the consumable as reported by the tag. */
  kind: number;
}

export interface PrintProgress {
  page: number;
  pages: number;
  /** 0–100, from the printer; undefined until the first status arrives. */
  print?: number;
  feed?: number;
}

export interface PrinterSnapshot {
  state: ConnState;
  deviceName?: string;
  model?: string;
  printTask?: PrintTaskName;
  dpi?: number;
  printheadPixels?: number;
  printDirection?: PrintDirection;
  densityMin: number;
  densityMax: number;
  densityDefault: number;
  battery?: number;
  serial?: string;
  firmware?: string;
  /** undefined = not fetched yet, null = no tag readable */
  roll?: RollInfo | null;
  progress?: PrintProgress;
  error?: string;
}

const initial: PrinterSnapshot = { state: "disconnected", densityMin: 1, densityMax: 5, densityDefault: 3 };

export const printer = signal<PrinterSnapshot>(initial);
export const printerLog = signal<string[]>([]);
/** True while a "reconnect to the last printer" attempt is pending (the Electron chooser auto-picks it). */
export const quickConnectWanted = signal(false);

let client: NiimbotAbstractClient | undefined;
let lastHeartbeat: HeartbeatData | undefined;

const LAST_DEVICE_KEY = "birka.lastDevice";

function log(line: string) {
  const ts = new Date().toLocaleTimeString("ru-RU", { hour12: false });
  printerLog.value = [...printerLog.value.slice(-199), `${ts} ${line}`];
}

function patch(p: Partial<PrinterSnapshot>) {
  printer.value = { ...printer.value, ...p };
}

export function bluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator && !!navigator.bluetooth;
}

export function lastDeviceName(): string | undefined {
  try {
    return localStorage.getItem(LAST_DEVICE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function rollFromRfid(info: RfidInfo | undefined): RollInfo | null {
  if (!info || !info.tagPresent) return null;
  return { barcode: info.barCode ?? "", total: info.allPaper ?? 0, used: info.usedPaper ?? 0, kind: info.consumablesType };
}

/** Read the label roll's RFID tag. Never throws; stores null when unreadable. */
export async function refreshRfid(): Promise<void> {
  const c = client;
  if (!c || !c.isConnected() || printer.value.state === "printing") return;
  try {
    const info = await c.protocol.rfidInfo();
    const roll = rollFromRfid(info);
    patch({ roll });
    if (roll) log(`RFID ленты: ${roll.barcode || "без кода"} · осталось ${roll.total - roll.used} из ${roll.total}`);
    else log("RFID ленты не прочитан (метки нет или не читается)");
  } catch (e) {
    patch({ roll: null });
    log(`RFID недоступен: ${String((e as Error)?.message ?? e)}`);
  }
}

function attach(c: NiimbotAbstractClient) {
  c.setHeartbeatInterval(3000);
  c.on("connect", (e) => {
    const info = c.getPrinterInfo();
    const meta = c.getModelMetadata();
    patch({
      state: "connected",
      deviceName: e.info.deviceName,
      model: meta?.model ?? (info.modelId !== undefined ? `#${info.modelId}` : undefined),
      printTask: c.getPrintTaskType(),
      dpi: meta?.dpi,
      printheadPixels: info.printheadWidth ?? meta?.printheadPixels,
      printDirection: meta?.printDirection,
      densityMin: meta?.densityMin ?? 1,
      densityMax: meta?.densityMax ?? 5,
      densityDefault: meta?.densityDefault ?? 3,
      battery: info.batteryPercents,
      serial: info.serial,
      firmware: info.softwareVersion,
      roll: undefined,
      error: undefined,
    });
    if (e.info.deviceName) {
      try {
        localStorage.setItem(LAST_DEVICE_KEY, e.info.deviceName);
      } catch {
        /* ignore */
      }
    }
    log(`Подключено: ${e.info.deviceName ?? "?"} · ${meta?.model ?? "модель неизвестна"} · задача ${c.getPrintTaskType() ?? "?"}`);
    lastHeartbeat = undefined;
    refreshRfid().catch(() => undefined);
  });
  c.on("disconnect", () => {
    if (client === c) client = undefined;
    patch({ ...initial, error: printer.value.error });
    log("Отключено");
  });
  c.on("heartbeat", (e) => {
    const d = e.data;
    if (d.batteryPercents !== undefined) patch({ battery: d.batteryPercents });
    const prev = lastHeartbeat;
    lastHeartbeat = d;
    if (prev && (prev.paperRfidSuccess !== d.paperRfidSuccess || prev.lidClosed !== d.lidClosed || prev.paperInserted !== d.paperInserted)) {
      log("Крышка/лента изменились — перечитываю RFID");
      refreshRfid().catch(() => undefined);
    }
  });
  c.on("heartbeatfailed", (e) => {
    if (e.failedAttempts >= 2) log(`Принтер не отвечает (${e.failedAttempts})`);
  });
  c.on("printprogress", (e) => {
    patch({ progress: { page: e.page, pages: e.pagesTotal, print: e.pagePrintProgress, feed: e.pageFeedProgress } });
  });
}

/**
 * Connect. With `quick`, tries the previously authorised device first
 * (Chrome needs "Use the new permissions backend for Web Bluetooth" for
 * `getDevices()` on older versions); falls back to the chooser dialog.
 */
export async function connect(opts: { quick?: boolean } = {}): Promise<void> {
  if (!bluetoothSupported()) {
    patch({ error: "Web Bluetooth недоступен: откройте страницу в Chrome по адресу http://localhost или https://" });
    return;
  }
  await disconnect();
  const c = instantiateClient("bluetooth");
  attach(c);
  client = c;
  patch({ state: "connecting", error: undefined });
  quickConnectWanted.value = !!opts.quick;
  try {
    let done = false;
    if (opts.quick && typeof navigator.bluetooth.getDevices === "function") {
      const want = lastDeviceName();
      try {
        const devices = await navigator.bluetooth.getDevices();
        const dev = devices.find((d) => !want || d.name === want) ?? devices[0];
        if (dev) {
          log(`Пробую подключиться к ${dev.name ?? "устройству"} без диалога…`);
          await (c as unknown as { connect(o: { authorizedDevice: BluetoothDevice }): Promise<unknown> }).connect({
            authorizedDevice: dev,
          });
          done = true;
        }
      } catch (e) {
        log(`Быстрое подключение не удалось: ${String((e as Error)?.message ?? e)}`);
      }
    }
    if (!done) await c.connect();
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    const cancelled = /cancel|chooser/i.test(msg);
    patch({ state: "disconnected", error: cancelled ? undefined : msg });
    log(cancelled ? "Выбор устройства отменён" : `Ошибка подключения: ${msg}`);
    if (client === c) client = undefined;
  } finally {
    quickConnectWanted.value = false;
  }
}

export async function disconnect(): Promise<void> {
  const c = client;
  client = undefined;
  if (c) {
    try {
      await c.disconnect();
    } catch {
      /* ignore */
    }
  }
  if (printer.value.state !== "disconnected") patch({ ...initial });
}

const KIND_TO_LABEL_TYPE: Record<MediaKind, LabelType> = {
  gaps: LabelType.WithGaps,
  continuous: LabelType.Continuous,
  black: LabelType.Black,
};

export interface PrintJob {
  copies: number;
  density: number;
  kind: MediaKind;
}

function pageForDirection(canvas: HTMLCanvasElement, dir: PrintDirection): HTMLCanvasElement {
  if (dir !== "left") return canvas;
  const src = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
  const rotated = rotateCCW(src);
  const c = document.createElement("canvas");
  c.width = rotated.width;
  c.height = rotated.height;
  c.getContext("2d")!.putImageData(rotated, 0, 0);
  return c;
}

/**
 * Print a 1-bit page canvas (already thresholded). Resolves when the printer
 * reports the last page finished.
 */
export async function printCanvas(canvas: HTMLCanvasElement, job: PrintJob): Promise<void> {
  const c = client;
  if (!c || !c.isConnected()) throw new Error("Принтер не подключён");
  const snap = printer.value;
  if (snap.state === "printing") throw new Error("Печать уже идёт");
  const taskName = snap.printTask ?? "B1";
  const dir = snap.printDirection ?? "top";
  const density = Math.min(snap.densityMax, Math.max(snap.densityMin, Math.round(job.density)));
  const copies = Math.max(1, Math.round(job.copies));

  const encoded = ImageEncoder.encodeCanvas(pageForDirection(canvas, dir), PageColorType.SingleColor, dir);
  if (snap.printheadPixels && encoded.cols > snap.printheadPixels) {
    throw new Error(`Страница шире печатающей головки: ${encoded.cols} > ${snap.printheadPixels} точек`);
  }

  const task = c.protocol.newPrintTask(taskName, {
    totalPages: copies,
    density,
    labelType: KIND_TO_LABEL_TYPE[job.kind],
    statusPollIntervalMs: 100,
    statusTimeoutMs: 8_000,
    pageTimeoutMs: 20_000,
  });

  patch({ state: "printing", error: undefined, progress: { page: 0, pages: copies } });
  log(`Печать: ${encoded.cols}×${encoded.rows} точек, ${copies} шт., плотность ${density}, задача ${taskName}`);
  try {
    await task.printInit();
    await task.printPage(encoded, copies);
    await task.waitForPageFinished();
    await task.waitForFinished();
    log("Печать завершена");
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    log(`Ошибка печати: ${msg}`);
    patch({ error: msg });
    throw e;
  } finally {
    try {
      await c.protocol.printEnd();
    } catch {
      /* ignore */
    }
    patch({ state: c.isConnected() ? "connected" : "disconnected", progress: undefined });
    // The roll counter changes after every print.
    refreshRfid().catch(() => undefined);
  }
}
