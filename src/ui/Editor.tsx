import { artToSvg, iconById, renderIcon } from "../icons";
import { emptyLabel, labelIsEmpty } from "../model/label";
import { activeSlot, labels, media, mirror, pageLabels, saveSlot, swapSlots, updateLabel } from "../state";
import { IconPicker } from "./IconPicker";

/** One column per label of the pair: text fields plus the current pictogram. */
function SlotColumn({ i }: { i: number }) {
  const mirrored = mirror.value && i > 0;
  const spec = (mirrored ? pageLabels.value[i] : labels.value[i]) ?? emptyLabel();
  const active = activeSlot.value === i;
  const def = spec.icon ? iconById(spec.icon.id) : undefined;
  const art = renderIcon(spec.icon);
  const focus = () => {
    if (!mirrored) activeSlot.value = i;
  };

  return (
    <div class={`col ${active ? "active" : ""} ${mirrored ? "mirrored" : ""}`} onFocusIn={focus} onClick={focus}>
      <div class="col-head">
        <span class="col-tag mono">{i + 1}</span>
        {mirrored ? (
          <span class="hint">как первая</span>
        ) : (
          <button type="button" class="ghost tiny" title="Сохранить в библиотеку" disabled={labelIsEmpty(spec)} onClick={() => saveSlot(i)}>
            ☆
          </button>
        )}
      </div>
      <input
        class="big"
        value={spec.title}
        placeholder="M3×6"
        autocomplete="off"
        spellcheck={false}
        disabled={mirrored}
        aria-label={`Крупно, наклейка ${i + 1}`}
        onInput={(e) => updateLabel(i, { title: (e.currentTarget as HTMLInputElement).value })}
      />
      <input
        value={spec.caption}
        placeholder="болт"
        autocomplete="off"
        disabled={mirrored}
        aria-label={`Мелко, наклейка ${i + 1}`}
        onInput={(e) => updateLabel(i, { caption: (e.currentTarget as HTMLInputElement).value })}
      />
      <button type="button" class="icon-btn" disabled={mirrored} title="Картинка выбирается ниже" onClick={focus}>
        {art ? (
          <span class="svg" dangerouslySetInnerHTML={{ __html: artToSvg(art, { size: 26 }) }} />
        ) : (
          <span class="svg none">—</span>
        )}
        <span class="icon-name">{def?.name ?? "без картинки"}</span>
      </button>
    </div>
  );
}

export function Editor() {
  const n = media.value.slots;
  const same = mirror.value;

  return (
    <section class="panel editor">
      <div class="panel-head">
        <h2>{n > 1 ? "Наклейки" : "Наклейка"}</h2>
        {n > 1 && (
          <div class="row">
            <label class="check">
              <input type="checkbox" checked={same} onChange={(e) => (mirror.value = (e.currentTarget as HTMLInputElement).checked)} />
              одинаковые
            </label>
            {!same && (
              <button type="button" class="ghost tiny" title="Поменять местами" onClick={swapSlots} disabled={labels.value.length < 2}>
                ⇅
              </button>
            )}
          </div>
        )}
      </div>

      <div class="columns" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {Array.from({ length: n }, (_, i) => (
          <SlotColumn key={i} i={i} />
        ))}
      </div>

      <IconPicker />
    </section>
  );
}
