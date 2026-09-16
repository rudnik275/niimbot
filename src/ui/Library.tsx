import { artToSvg, renderIcon } from "../icons";
import { prettifyTitle } from "../model/label";
import { activeSlot, loadInto, removeSaved, sortedLibrary, togglePin } from "../state";

export function Library() {
  const items = sortedLibrary.value;
  return (
    <section class="panel library">
      <div class="panel-head">
        <h2>Библиотека</h2>
        <span class="mono dim">{items.length ? `${items.length}` : "пусто"}</span>
      </div>
      {items.length === 0 && <p class="hint">Сюда попадает всё, что вы напечатали или сохранили звёздочкой.</p>}
      <ul class="chips">
        {items.map((s) => {
          const art = renderIcon(s.spec.icon);
          return (
            <li key={s.key} class={`chip ${s.pinned ? "pinned" : ""}`}>
              <button type="button" class="chip-main" onClick={() => loadInto(activeSlot.value, s.spec)} title="Подставить в текущую наклейку">
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
