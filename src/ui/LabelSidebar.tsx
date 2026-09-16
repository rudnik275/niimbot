import { emptyLabel, labelIsEmpty } from "../model/label";
import { labels, media, mirror, pageLabels, updateLabel } from "../state";
import { IconPicker } from "./IconPicker";
import { Library } from "./Library";

const NAMES = ["Верхняя", "Нижняя", "Третья", "Четвёртая"];

/** Everything about one label of the pair: text, pictogram, its parameters, recents. */
export function LabelSidebar({ slot }: { slot: number }) {
  const n = media.value.slots;
  const mirrored = mirror.value && slot > 0;
  const spec = (mirrored ? pageLabels.value[slot] : labels.value[slot]) ?? emptyLabel();

  return (
    <aside class={`side ${mirrored ? "mirrored" : ""}`}>
      <header class="side-head">
        <span class="side-tag mono">{slot + 1}</span>
        <h2>{n > 1 ? (NAMES[slot] ?? `Наклейка ${slot + 1}`) : "Наклейка"}</h2>
        {slot === 1 && (
          <label class="check">
            <input type="checkbox" checked={mirror.value} onChange={(e) => (mirror.value = (e.currentTarget as HTMLInputElement).checked)} />
            как верхняя
          </label>
        )}
        {!mirrored && (
          <button
            type="button"
            class="ghost tiny"
            title="Убрать текст и картинку"
            disabled={labelIsEmpty(spec)}
            onClick={() => updateLabel(slot, emptyLabel())}
          >
            очистить
          </button>
        )}
      </header>

      <div class="side-body">
        <div class="field">
          <label for={`title-${slot}`}>Крупно</label>
          <input
            id={`title-${slot}`}
            class="big"
            value={spec.title}
            placeholder="M3×6"
            autocomplete="off"
            spellcheck={false}
            disabled={mirrored}
            onInput={(e) => updateLabel(slot, { title: (e.currentTarget as HTMLInputElement).value })}
          />
        </div>
        <div class="field">
          <label for={`caption-${slot}`}>Мелко</label>
          <input
            id={`caption-${slot}`}
            value={spec.caption}
            placeholder="болт"
            autocomplete="off"
            disabled={mirrored}
            onInput={(e) => updateLabel(slot, { caption: (e.currentTarget as HTMLInputElement).value })}
          />
        </div>

        <IconPicker slot={slot} disabled={mirrored} />
        <Library slot={slot} disabled={mirrored} />
      </div>
    </aside>
  );
}
