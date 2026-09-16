import { artToSvg, renderIcon } from "../icons";
import { labelIsEmpty, prettifyTitle } from "../model/label";
import { labels, loadInto, removeSaved, saveSlot, sortedLibrary, togglePin } from "../state";

/** Recents and favourites; a click puts the label into this sidebar's slot. */
export function Library({ slot, disabled }: { slot: number; disabled?: boolean }) {
  const items = sortedLibrary.value;
  const cur = labels.value[slot];
  return (
    <section class="library">
      <div class="panel-head">
        <span class="lbl">Недавние</span>
        <button
          type="button"
          class="link"
          disabled={disabled || !cur || labelIsEmpty(cur)}
          onClick={() => saveSlot(slot)}
          title="Сохранить эту наклейку в избранное"
        >
          ☆ сохранить эту
        </button>
      </div>
      {items.length === 0 && <p class="hint">Сюда попадает всё напечатанное и сохранённое звёздочкой.</p>}
      <ul class="chips">
        {items.map((s) => {
          const art = renderIcon(s.spec.icon);
          return (
            <li key={s.key} class={`chip ${s.pinned ? "pinned" : ""}`}>
              <button type="button" class="chip-main" disabled={disabled} onClick={() => loadInto(slot, s.spec)} title="Подставить сюда">
                {art && <span class="svg" dangerouslySetInnerHTML={{ __html: artToSvg(art, { size: 18 }) }} />}
                <span class="chip-title">{prettifyTitle(s.spec.title) || "—"}</span>
                {s.spec.caption && <span class="chip-cap">{s.spec.caption}</span>}
              </button>
              <button type="button" class="chip-btn" onClick={() => togglePin(s.key)} title={s.pinned ? "Открепить" : "Закрепить"}>
                {s.pinned ? "★" : "☆"}
              </button>
              <button type="button" class="chip-btn" onClick={() => removeSaved(s.key)} title="Удалить">
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
