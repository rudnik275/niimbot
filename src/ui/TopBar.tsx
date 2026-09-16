import { useSignal } from "@preact/signals";
import { findMediaByBarcode, maxWidthMm, mediaDescription, newCustomMedia, type MediaKind } from "../model/media";
import { bluetoothSupported, connect, disconnect, lastDeviceName, printer, refreshRfid } from "../printer/client";
import { addCustomMedia, bindRoll, media, mediaId, mediaList, removeCustomMedia, selectMedia } from "../state";

const STATE_TEXT = {
  disconnected: "не подключён",
  connecting: "подключение…",
  connected: "на связи",
  printing: "печать…",
} as const;

function Device() {
  const p = printer.value;
  const last = lastDeviceName();
  const supported = bluetoothSupported();
  return (
    <div class="tb-group device">
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
        <>
          <button type="button" class="primary small" disabled={!supported} onClick={() => connect()}>
            Подключить
          </button>
          {last && supported && (
            <button type="button" class="link" onClick={() => connect({ quick: true })} title="Без диалога выбора устройства">
              снова к {last}
            </button>
          )}
        </>
      ) : (
        <button type="button" class="ghost small" disabled={p.state === "printing"} onClick={() => disconnect()}>
          Отключить
        </button>
      )}
    </div>
  );
}

function Roll() {
  const p = printer.value;
  const m = media.value;
  if (p.state === "disconnected" || p.state === "connecting") return null;
  const roll = p.roll;
  if (roll === undefined) return <div class="tb-group roll mono">лента: читаю RFID…</div>;
  if (roll === null)
    return (
      <div class="tb-group roll">
        <span class="mono">лента без RFID</span>
        <button type="button" class="link" onClick={() => refreshRfid()}>
          обновить
        </button>
      </div>
    );
  const known = findMediaByBarcode(mediaList.value, roll.barcode);
  const left = Math.max(0, roll.total - roll.used);
  return (
    <div class="tb-group roll">
      <span class="mono">
        лента {known ? mediaDescription(known) : `неизвестная · ${roll.barcode || "без кода"}`}
        {roll.total > 0 ? ` · осталось ${left} из ${roll.total}` : ""}
      </span>
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
      <button type="button" class="link" onClick={() => refreshRfid()} title="Перечитать RFID">
        ↻
      </button>
    </div>
  );
}

export function TopBar() {
  const adding = useSignal(false);
  const w = useSignal("40");
  const h = useSignal("30");
  const slots = useSignal("1");
  const kind = useSignal<MediaKind>("gaps");
  const p = printer.value;
  const m = media.value;
  const headMax = maxWidthMm(p.printheadPixels);
  const tooWide = headMax !== undefined && m.widthMm > headMax;
  const supported = bluetoothSupported();

  return (
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true" />
        <div>
          <h1>Бирка</h1>
          <p class="mono">наклейки · NIIMBOT</p>
        </div>
      </div>

      <Device />

      <div class="tb-group media">
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

      <Roll />

      {tooWide && <div class="warn tb-row">Формат шире печатающей головки ({headMax} мм) — печать обрежется.</div>}
      {!supported && <div class="warn tb-row">Нужен Chrome (или Edge) и адрес http://localhost или https:// — Web Bluetooth иначе недоступен.</div>}
      {p.error && <div class="error tb-row">{p.error}</div>}

      {adding.value && (
        <form
          class="add-media tb-row"
          onSubmit={(e) => {
            e.preventDefault();
            const W = Number(w.value), H = Number(h.value), S = Math.max(1, Math.min(2, Math.round(Number(slots.value))));
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
            наклеек в паре
            <select value={slots.value} onChange={(e) => (slots.value = (e.currentTarget as HTMLSelectElement).value)}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>
          <label>
            тип ленты
            <select value={kind.value} onChange={(e) => (kind.value = (e.currentTarget as HTMLSelectElement).value as MediaKind)}>
              <option value="gaps">с зазорами</option>
              <option value="continuous">сплошная</option>
              <option value="black">чёрная метка</option>
            </select>
          </label>
          <button type="submit" class="ghost small">
            добавить
          </button>
        </form>
      )}
    </header>
  );
}
