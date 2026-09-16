import { useSignal } from "@preact/signals";
import { findMediaByBarcode, maxWidthMm, mediaDescription, newCustomMedia, type MediaKind } from "../model/media";
import { bluetoothSupported, connect, disconnect, lastDeviceName, printer, printerLog, refreshRfid } from "../printer/client";
import { addCustomMedia, bindRoll, media, mediaId, mediaList, removeCustomMedia, selectMedia } from "../state";

const STATE_TEXT = {
  disconnected: "не подключён",
  connecting: "подключение…",
  connected: "на связи",
  printing: "печать…",
} as const;

function RollRow() {
  const p = printer.value;
  const m = media.value;
  if (p.state === "disconnected" || p.state === "connecting") return null;
  const roll = p.roll;
  if (roll === undefined) return <div class="roll mono">лента: читаю RFID…</div>;
  if (roll === null)
    return (
      <div class="roll">
        <span class="mono">лента без RFID</span>
        <button type="button" class="link" onClick={() => refreshRfid()}>
          обновить
        </button>
      </div>
    );
  const known = findMediaByBarcode(mediaList.value, roll.barcode);
  const left = Math.max(0, roll.total - roll.used);
  return (
    <div class="roll">
      <span class="mono">
        лента {known ? mediaDescription(known) : `неизвестная · ${roll.barcode || "без кода"}`}
        {roll.total > 0 ? ` · осталось ${left} из ${roll.total}` : ""}
      </span>
      <button type="button" class="link" onClick={() => refreshRfid()} title="Перечитать RFID">
        ↻
      </button>
      {!known && roll.barcode && (
        <button type="button" class="link" onClick={() => bindRoll(roll.barcode, m.id)}>
          запомнить как «{m.name}»
        </button>
      )}
      {known && known.id !== m.id && (
        <button type="button" class="link" onClick={() => selectMedia(known.id)}>
          переключить на «{known.name}»
        </button>
      )}
    </div>
  );
}

function MediaSelect() {
  const adding = useSignal(false);
  const w = useSignal("40");
  const h = useSignal("30");
  const slots = useSignal("1");
  const kind = useSignal<MediaKind>("gaps");
  const m = media.value;
  const headMax = maxWidthMm(printer.value.printheadPixels);
  const tooWide = headMax !== undefined && m.widthMm > headMax;

  return (
    <div class="media">
      <div class="row">
        <label class="lbl" for="media">
          Формат
        </label>
        <select id="media" value={mediaId.value} onChange={(e) => selectMedia((e.currentTarget as HTMLSelectElement).value)}>
          {mediaList.value.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        {!m.builtin && (
          <button type="button" class="ghost tiny" title="Удалить формат" onClick={() => removeCustomMedia(m.id)}>
            ×
          </button>
        )}
        <button type="button" class="ghost tiny" onClick={() => (adding.value = !adding.value)}>
          {adding.value ? "отмена" : "+ формат"}
        </button>
      </div>
      {tooWide && <div class="warn">Шире печатающей головки ({headMax} мм) — печать обрежется.</div>}
      {adding.value && (
        <form
          class="add-media"
          onSubmit={(e) => {
            e.preventDefault();
            const W = Number(w.value), H = Number(h.value), S = Math.max(1, Math.round(Number(slots.value)));
            if (!(W > 5 && W <= 60 && H > 5 && H <= 200)) return;
            addCustomMedia(newCustomMedia(W, H, S, kind.value));
            adding.value = false;
          }}
        >
          <label>
            ширина, мм
            <input type="number" min="6" max="60" step="0.5" value={w.value} onInput={(e) => (w.value = (e.currentTarget as HTMLInputElement).value)} />
          </label>
          <label>
            высота, мм
            <input type="number" min="6" max="200" step="0.5" value={h.value} onInput={(e) => (h.value = (e.currentTarget as HTMLInputElement).value)} />
          </label>
          <label>
            в паре
            <input type="number" min="1" max="4" value={slots.value} onInput={(e) => (slots.value = (e.currentTarget as HTMLInputElement).value)} />
          </label>
          <label>
            тип
            <select value={kind.value} onChange={(e) => (kind.value = (e.currentTarget as HTMLSelectElement).value as MediaKind)}>
              <option value="gaps">с зазорами</option>
              <option value="continuous">сплошная</option>
              <option value="black">чёрная метка</option>
            </select>
          </label>
          <button type="submit" class="ghost">
            добавить
          </button>
        </form>
      )}
    </div>
  );
}

export function DevicePanel() {
  const p = printer.value;
  const last = lastDeviceName();
  const supported = bluetoothSupported();
  const busy = p.state === "connecting" || p.state === "printing";

  return (
    <section class="panel device">
      <div class="device-row">
        <span class={`dot ${p.state}`} aria-hidden="true" />
        <div class="device-text">
          <b>{p.model ? `NIIMBOT ${p.model}` : "Принтер"}</b>
          <span class="mono">
            {STATE_TEXT[p.state]}
            {p.battery !== undefined ? ` · ${p.battery}%` : ""}
            {p.printheadPixels ? ` · ${p.printheadPixels} т.` : ""}
          </span>
        </div>
        {p.state === "disconnected" ? (
          <button type="button" class="primary small" disabled={!supported} onClick={() => connect()}>
            Подключить
          </button>
        ) : (
          <button type="button" class="ghost small" disabled={busy && p.state !== "connecting"} onClick={() => disconnect()}>
            Отключить
          </button>
        )}
      </div>
      {p.state === "disconnected" && last && supported && (
        <button type="button" class="link" onClick={() => connect({ quick: true })}>
          снова к {last}
        </button>
      )}
      {!supported && <div class="warn">Нужен Chrome (или Edge) и адрес http://localhost или https:// — Web Bluetooth иначе недоступен.</div>}
      {p.error && <div class="error">{p.error}</div>}
      <RollRow />
      <MediaSelect />
      <details class="log">
        <summary>журнал</summary>
        <pre class="mono">{printerLog.value.slice(-40).join("\n") || "—"}</pre>
      </details>
    </section>
  );
}
