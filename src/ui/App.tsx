import { useSignalEffect } from "@preact/signals";
import { findMediaByBarcode } from "../model/media";
import { printer } from "../printer/client";
import { media, mediaList, selectMedia } from "../state";
import { Bed } from "./Bed";
import { DevicePanel } from "./DevicePanel";
import { Editor } from "./Editor";
import { Library } from "./Library";
import { PrintPanel } from "./PrintPanel";

export function App() {
  // Auto-select the media profile when the printer reports a roll we know.
  useSignalEffect(() => {
    const roll = printer.value.roll;
    if (!roll?.barcode) return;
    const known = findMediaByBarcode(mediaList.peek(), roll.barcode);
    if (known && known.id !== media.peek().id) selectMedia(known.id);
  });

  return (
    <div class="app">
      <aside class="side">
        <header class="brand">
          <span class="brand-mark" aria-hidden="true" />
          <div>
            <h1>Бирка</h1>
            <p class="mono">наклейки · NIIMBOT</p>
          </div>
        </header>
        <DevicePanel />
        <Editor />
        <Library />
      </aside>
      <main class="bed-wrap">
        <Bed />
        <PrintPanel />
      </main>
    </div>
  );
}
