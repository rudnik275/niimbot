import { useSignal } from "@preact/signals";
import { CATEGORY_NAMES, artToSvg, iconById, iconsInCategory, newIconRef, normalizeParams, searchIcons, type Category, type IconDef } from "../icons";
import { activeLabel, activeSlot, media, updateActive } from "../state";

const CATS = Object.keys(CATEGORY_NAMES) as Category[];

function Svg({ html, class: cls }: { html: string; class?: string }) {
  return <span class={`svg ${cls ?? ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function IconPicker() {
  const cat = useSignal<Category>("fasteners");
  const q = useSignal("");
  const l = activeLabel.value;
  const curDef = l.icon ? iconById(l.icon.id) : undefined;
  const curParams = curDef ? normalizeParams(curDef, l.icon?.params) : {};

  const list = q.value.trim() ? searchIcons(q.value) : iconsInCategory(cat.value);

  const pick = (def: IconDef) => {
    const prevDefault = curDef?.caption ?? "";
    const keepCaption = l.caption.trim() !== "" && l.caption !== prevDefault;
    updateActive({ icon: newIconRef(def), caption: keepCaption ? l.caption : def.caption ?? "" });
  };

  const setParam = (id: string, value: string) => {
    if (!l.icon) return;
    updateActive({ icon: { id: l.icon.id, params: { ...curParams, [id]: value } } });
  };

  return (
    <div class="picker">
      <div class="picker-head">
        {media.value.slots > 1 && <span class="picker-target mono">картинка → {activeSlot.value + 1}</span>}
        <div class="tabs">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              class={`tab ${!q.value && cat.value === c ? "on" : ""}`}
              onClick={() => {
                cat.value = c;
                q.value = "";
              }}
            >
              {CATEGORY_NAMES[c]}
            </button>
          ))}
        </div>
        <input
          class="search"
          placeholder="поиск…"
          value={q.value}
          onInput={(e) => (q.value = (e.currentTarget as HTMLInputElement).value)}
        />
      </div>

      <div class="grid">
        <button type="button" class={`cell ${!l.icon ? "on" : ""}`} onClick={() => updateActive({ icon: null })}>
          <span class="svg none">—</span>
          <span class="cell-name">без картинки</span>
        </button>
        {list.map((def) => (
          <button
            key={def.id}
            type="button"
            class={`cell ${curDef?.id === def.id ? "on" : ""}`}
            onClick={() => pick(def)}
            title={def.name}
          >
            <Svg html={artToSvg(def.render(def.id === curDef?.id ? curParams : Object.fromEntries((def.params ?? []).map((p) => [p.id, p.default]))), { size: 34 })} />
            <span class="cell-name">{def.name}</span>
          </button>
        ))}
      </div>

      {curDef?.params && (
        <div class="params">
          {curDef.params.map((p) => (
            <div class="param" key={p.id}>
              <div class="param-name">{p.name}</div>
              <div class="opts">
                {p.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    class={`opt ${curParams[p.id] === o.id ? "on" : ""}`}
                    title={o.name}
                    onClick={() => setParam(p.id, o.id)}
                  >
                    <Svg html={artToSvg(curDef.render({ ...curParams, [p.id]: o.id }), { size: 26 })} />
                  </button>
                ))}
              </div>
              <div class="param-value mono">{p.options.find((o) => o.id === curParams[p.id])?.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
