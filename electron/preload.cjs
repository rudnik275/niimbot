const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("birka", {
  platform: process.platform,
  onBluetoothDevices(cb) {
    const handler = (_event, list) => cb(list);
    ipcRenderer.on("ble:devices", handler);
    return () => ipcRenderer.removeListener("ble:devices", handler);
  },
  selectBluetoothDevice(id) {
    return ipcRenderer.invoke("ble:select", id);
  },
});
