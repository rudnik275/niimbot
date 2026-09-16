import { useSignal } from "@preact/signals";
import { DPMM } from "../model/media";
import { printCanvas, printer } from "../printer/client";
import { renderCalibrationPage, renderPage } from "../render/draw";
import { DEFAULT_THRESHOLD } from "../render/raster";
import { media, pageIsBlank, pageLabels, printSettings, recordPrinted, updatePrint } from "../state";

const mm = (px: number) => `${(px / DPMM).toFixed(2).replace(/\.?0+$/, "")} мм`;

export function PrintPanel() {
  const p = printer.value;
  const ps = printSettings.value;
  const m = media.value;
  const connected = p.state === "connected";
  const printing = p.state === "printing";
  const blank = pageIsBlank.value;
  const err = useSignal<string | null>(null);

  const opts = { offsetX: ps.offsetX, offsetY: ps.offsetY, threshold: ps.threshold };

  const run = async (kind: "labels" | "test") => {
    err.value = null;
    const specs = pageLabels.value;
    const canvas = kind === "test" ? renderCalibrationPage(m, opts) : renderPage(m, specs, opts);
    try {
      await printCanvas(canvas, { copies: kind === "test" ? 1 : ps.copies, density: ps.density, kind: m.kind });
      if (kind === "labels") recordPrinted(specs);
    } catch (e) {
      err.value = String((e as Error)?.message ?? e);
    }
  };

  const prog = p.progress;
  const pagePct = prog?.print !== undefined ? prog.print * 0.7 + (prog.feed ?? 0) * 0.3 : undefined;
  const pct =
    prog && pagePct !== undefined ? Math.round(((Math.max(0, prog.page - 1) + pagePct / 100) / Math.max(1, prog.pages)) * 100) : 0;
  const label = printing
    ? pagePct === undefined
      ? "Отправка…"
      : `Печать… ${Math.min(100, pct)}%`
    : `Печать${m.slots > 1 ? " пары" : ""}${ps.copies > 1 ? ` × ${ps.copies}` : ""}`;

  return (
    <section class="panel print">
      <div class="print-main">
        <div class="print-controls">
          <div class="field inline">
            <label for="density">Плотность</label>
            <input
              id="density"
              type="range"
              min={p.densityMin}
              max={p.densityMax}
              step="1"
              value={ps.density}
              onInput={(e) => updatePrint({ density: Number((e.currentTarget as HTMLInputElement).value) })}
            />
            <span class="mono val">{ps.density}</span>
          </div>
          <div class="field inline">
            <label for="copies">{m.slots > 1 ? "Пар" : "Копий"}</label>
            <input
              id="copies"
              type="number"
              min="1"
              max="99"
              value={ps.copies}
              onInput={(e) => updatePrint({ copies: Math.max(1, Math.min(99, Number((e.currentTarget as HTMLInputElement).value) || 1)) })}
            />
            <span class="hint grow">
              {!connected && !printing ? "Превью уже точное — подключите принтер." : blank ? "Обе наклейки пустые." : ""}
            </span>
          </div>
        </div>

        <button
          type="button"
          class={`print-btn ${printing ? "busy" : ""}`}
          style={printing ? { "--p": `${pct}%` } : undefined}
          disabled={!connected || blank}
          onClick={() => run("labels")}
        >
          <span>{label}</span>
          <span class="mono sub">
            {m.widthMm}×{m.heightMm * m.slots} мм · плотность {ps.density}
          </span>
        </button>
      </div>
      {err.value && <div class="error">{err.value}</div>}

      <details class="calib">
        <summary>калибровка</summary>
        <div class="row gap">
          <div class="field inline">
            <label for="ox">Сдвиг X</label>
            <input id="ox" type="number" min="-40" max="40" value={ps.offsetX} onInput={(e) => updatePrint({ offsetX: Number((e.currentTarget as HTMLInputElement).value) || 0 })} />
            <span class="mono val">{mm(ps.offsetX)}</span>
          </div>
          <div class="field inline">
            <label for="oy">Сдвиг Y</label>
            <input id="oy" type="number" min="-40" max="40" value={ps.offsetY} onInput={(e) => updatePrint({ offsetY: Number((e.currentTarget as HTMLInputElement).value) || 0 })} />
            <span class="mono val">{mm(ps.offsetY)}</span>
          </div>
        </div>
        <div class="field inline">
          <label for="thr">Порог</label>
          <input
            id="thr"
            type="range"
            min="90"
            max="210"
            step="5"
            value={ps.threshold}
            onInput={(e) => updatePrint({ threshold: Number((e.currentTarget as HTMLInputElement).value) })}
          />
          <span class="mono val">{ps.threshold}</span>
        </div>
        <p class="hint">
          Тест печатает рамку в 1 мм от края каждой наклейки и крест по центру. Если рамка съехала — подберите сдвиг (1 точка =
          0,125 мм). Порог решает, какая серость становится чёрной: выше — жирнее.
        </p>
        <div class="row gap">
          <button type="button" class="ghost" disabled={!connected} onClick={() => run("test")}>
            напечатать тест
          </button>
          <button type="button" class="link" onClick={() => updatePrint({ offsetX: 0, offsetY: 0, threshold: DEFAULT_THRESHOLD })}>
            сброс
          </button>
        </div>
      </details>
    </section>
  );
}
