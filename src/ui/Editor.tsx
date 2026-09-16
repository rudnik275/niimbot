import type { LabelFont } from "../model/label";
import { FONT_LABEL } from "../render/fonts";
import { activeLabel, activeSlot, labels, media, mirror, saveActive, swapSlots, updateActive } from "../state";
import { IconPicker } from "./IconPicker";

function SlotTabs() {
  const n = media.value.slots;
  const cur = activeSlot.value;
  const same = mirror.value;
  return (
    <div class="slot-tabs">
      {Array.from({ length: n }, (_, i) => (
        <button
          key={i}
          type="button"
          class={`tab ${cur === i ? "on" : ""}`}
          disabled={same && i > 0}
          onClick={() => (activeSlot.value = i)}
        >
          {i + 1}
        </button>
      ))}
      <label class="check">
        <input type="checkbox" checked={same} onChange={(e) => (mirror.value = (e.currentTarget as HTMLInputElement).checked)} />
        одинаковые
      </label>
      {n > 1 && !same && (
        <button type="button" class="ghost tiny" title="Поменять местами" onClick={swapSlots} disabled={labels.value.length < 2}>
          ⇅
        </button>
      )}
    </div>
  );
}

export function Editor() {
  const l = activeLabel.value;
  const m = media.value;

  return (
    <section class="panel editor">
      <div class="panel-head">
        <h2>Наклейка</h2>
        {m.slots > 1 && <SlotTabs />}
      </div>

      <div class="field">
        <label for="title">Крупно</label>
        <input
          id="title"
          class="big"
          value={l.title}
          placeholder="M3×6"
          autocomplete="off"
          spellcheck={false}
          onInput={(e) => updateActive({ title: (e.currentTarget as HTMLInputElement).value })}
        />
      </div>
      <div class="field">
        <label for="caption">Мелко</label>
        <input
          id="caption"
          value={l.caption}
          placeholder="болт"
          autocomplete="off"
          onInput={(e) => updateActive({ caption: (e.currentTarget as HTMLInputElement).value })}
        />
      </div>

      <div class="row wrap style-row">
        <div class="segmented" role="radiogroup" aria-label="Шрифт">
          {(Object.keys(FONT_LABEL) as LabelFont[]).map((f) => (
            <button key={f} type="button" class={l.font === f ? "on" : ""} onClick={() => updateActive({ font: f })}>
              <span class={f === "mono" ? "mono" : ""}>{FONT_LABEL[f]}</span>
            </button>
          ))}
        </div>
        <label class="check">
          <input type="checkbox" checked={l.frame} onChange={(e) => updateActive({ frame: (e.currentTarget as HTMLInputElement).checked })} />
          рамка
        </label>
        <label class="check">
          <input
            type="checkbox"
            checked={l.captionRules}
            onChange={(e) => updateActive({ captionRules: (e.currentTarget as HTMLInputElement).checked })}
          />
          линии у подписи
        </label>
        <button type="button" class="ghost tiny" onClick={saveActive} title="Сохранить в библиотеку">
          ☆ сохранить
        </button>
      </div>

      <IconPicker />
    </section>
  );
}
