import { useSignalEffect } from "@preact/signals";
import { findMediaByBarcode } from "../model/media";
import { printer } from "../printer/client";
import { media, mediaList, selectMedia } from "../state";
import { Bed } from "./Bed";
import { BlePicker } from "./BlePicker";
import { LabelSidebar } from "./LabelSidebar";
import { LogPanel } from "./LogPanel";
import { PrintPanel } from "./PrintPanel";
import { TopBar } from "./TopBar";

/**
 * Shared settings live in the top bar (printer, roll, format) and under the
 * preview (print). Everything about ONE label lives in its own sidebar: the
 * top label on the left, the bottom label on the right.
 */
export function App() {
  // Auto-select the media profile when the printer reports a roll we know.
  useSignalEffect(() => {
    const roll = printer.value.roll;
    if (!roll?.barcode) return;
    const known = findMediaByBarcode(mediaList.peek(), roll.barcode);
    if (known && known.id !== media.peek().id) selectMedia(known.id);
  });

  const slots = media.value.slots;
  const inElectron = typeof window !== "undefined" && !!window.birka;

  return (
    <div class={`app ${slots > 1 ? "two" : "one"} ${inElectron ? "in-electron" : ""}`}>
      <TopBar />
      <div class="workspace">
        <LabelSidebar slot={0} />
        <main class="bed-wrap">
          <Bed />
          <PrintPanel />
          <LogPanel />
        </main>
        {slots > 1 && <LabelSidebar slot={1} />}
      </div>
      <BlePicker />
    </div>
  );
}
