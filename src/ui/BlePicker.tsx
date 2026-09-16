import { useSignal, useSignalEffect } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { BleDevice } from "../electron";
import { lastDeviceName, printer, quickConnectWanted } from "../printer/client";

/**
 * Electron has no built-in Web Bluetooth chooser: the main process forwards
 * the discovered devices here and we answer with the chosen id. In a normal
 * browser this renders nothing — Chrome shows its own dialog.
 */
export function BlePicker() {
  const devices = useSignal<BleDevice[] | null>(null);

  useEffect(() => {
    const api = window.birka;
    if (!api) return;
    return api.onBluetoothDevices((list) => {
      if (quickConnectWanted.peek()) {
        const want = lastDeviceName();
        const hit = want ? list.find((d) => d.name === want) : undefined;
        if (hit) {
          devices.value = null;
          void api.selectBluetoothDevice(hit.id);
          return;
        }
      }
      devices.value = list;
    });
  }, []);

  // The chooser is only meaningful while a connection attempt is pending.
  useSignalEffect(() => {
    if (printer.value.state !== "connecting") devices.value = null;
  });

  const list = devices.value;
  if (!list) return null;
  const api = window.birka!;
  const choose = (id: string) => {
    devices.value = null;
    void api.selectBluetoothDevice(id);
  };

  return (
    <div class="ble-overlay" role="dialog" aria-modal="true" aria-labelledby="ble-title">
      <div class="ble-dialog">
        <h3 id="ble-title">Выберите принтер</h3>
        {list.length === 0 ? (
          <p class="hint">Ищу устройства Bluetooth… Принтер включён?</p>
        ) : (
          <ul class="ble-list">
            {list.map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => choose(d.id)}>
                  <b>{d.name || "Без имени"}</b>
                  <span class="mono dim">{d.id.slice(0, 17)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div class="row" style={{ justifyContent: "space-between" }}>
          <span class="hint">Список пополняется по мере поиска.</span>
          <button type="button" class="ghost small" onClick={() => choose("")}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
