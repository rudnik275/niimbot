import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { labelIsEmpty } from "../model/label";
import { DPMM, pageSizePx, slotRects } from "../model/media";
import { renderPage } from "../render/draw";
import { countInk } from "../render/raster";
import { activeSlot, fontsVersion, media, mirror, pageLabels, printSettings } from "../state";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

const RULER = 26;

function Ruler({ lengthMm, scale, vertical }: { lengthMm: number; scale: number; vertical?: boolean }) {
  const step = DPMM * scale; // px per mm
  const len = lengthMm * step;
  const ticks = [];
  for (let mm = 0; mm <= lengthMm; mm++) {
    const major = mm % 10 === 0;
    const mid = mm % 5 === 0;
    const t = major ? 12 : mid ? 8 : 4;
    const pos = mm * step;
    ticks.push(
      vertical ? (
        <line key={mm} x1={RULER - t} y1={pos} x2={RULER} y2={pos} />
      ) : (
        <line key={mm} x1={pos} y1={RULER - t} x2={pos} y2={RULER} />
      ),
    );
    if (major && mm > 0 && mm < lengthMm) {
      ticks.push(
        vertical ? (
          <text key={`t${mm}`} x={RULER - 15} y={pos - 3} text-anchor="end">
            {mm}
          </text>
        ) : (
          <text key={`t${mm}`} x={pos + 3} y={RULER - 15}>
            {mm}
          </text>
        ),
      );
    }
  }
  return (
    <svg class={`ruler ${vertical ? "v" : "h"}`} width={vertical ? RULER : len} height={vertical ? len : RULER} aria-hidden="true">
      {ticks}
    </svg>
  );
}

export function Bed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref: wrapRef, w: wrapW } = useWidth<HTMLDivElement>();
  const ink = useSignal(0);

  const m = media.value;
  const specs = pageLabels.value;
  const ps = printSettings.value;
  const fonts = fontsVersion.value;
  const { cols, rows } = pageSizePx(m);
  const slots = slotRects(m);
  const active = activeSlot.value;

  const avail = Math.max(200, wrapW - RULER - 48);
  const scale = Math.max(1, Math.min(3, Math.floor(avail / cols)));

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    renderPage(m, specs, { offsetX: ps.offsetX, offsetY: ps.offsetY, threshold: ps.threshold }, c);
    const ctx = c.getContext("2d")!;
    ink.value = countInk(ctx.getImageData(0, 0, c.width, c.height)) / (c.width * c.height);
  }, [m, specs, ps.offsetX, ps.offsetY, ps.threshold, fonts]);

  const exportPng = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `label-${m.widthMm}x${m.heightMm * m.slots}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div class="bed" ref={wrapRef}>
      <div class="bed-stage" style={{ gridTemplateColumns: `${RULER}px ${cols * scale}px` }}>
        <span class="ruler-corner" />
        <Ruler lengthMm={m.widthMm} scale={scale} />
        <Ruler lengthMm={m.heightMm * m.slots} scale={scale} vertical />
        <div class="page" style={{ width: cols * scale, height: rows * scale }}>
          <canvas ref={canvasRef} width={cols} height={rows} style={{ width: cols * scale, height: rows * scale }} />
          {slots.map((s, i) => {
            const spec = specs[i];
            const isActive = i === active || (mirror.value && i > 0 && active === 0);
            return (
              <button
                key={i}
                type="button"
                class={`slot ${isActive ? "active" : ""} ${i > 0 ? "cut" : ""}`}
                style={{ left: s.x * scale, top: s.y * scale, width: s.w * scale, height: s.h * scale }}
                onClick={() => {
                  if (!(mirror.value && i > 0)) activeSlot.value = i;
                }}
                aria-label={`Наклейка ${i + 1}`}
              >
                <span class="slot-tag mono">{m.slots > 1 ? i + 1 : ""}</span>
                {spec && labelIsEmpty(spec) && <span class="slot-empty">пусто</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div class="readout mono">
        <span>
          {m.widthMm} × {m.heightMm * m.slots} мм
        </span>
        <span>
          {cols} × {rows} точек
        </span>
        <span>203 dpi · ×{scale}</span>
        <span>чернила {(ink.value * 100).toFixed(1)}%</span>
        <button type="button" class="link" onClick={exportPng}>
          PNG
        </button>
      </div>
    </div>
  );
}
