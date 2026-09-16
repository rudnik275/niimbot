// Desktop shell for Бирка. Loads the built Vite app (dist/) or, in
// development, the Vite dev server from BIRKA_DEV_URL.
//
// Chromium inside Electron has Web Bluetooth but no device chooser UI, so we
// forward the discovered devices to the renderer (see src/ui/BlePicker.tsx)
// and answer with the id the user picked.
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");

let win = null;
let bleCallback = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1680,
    height: 1000,
    minWidth: 1100,
    minHeight: 700,
    title: "Бирка",
    backgroundColor: "#e9e3d6",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.on("select-bluetooth-device", (event, devices, callback) => {
    event.preventDefault();
    bleCallback = callback;
    if (!win) return;
    win.webContents.send(
      "ble:devices",
      devices.map((d) => ({ id: d.deviceId, name: d.deviceName ?? "" })),
    );
  });

  // Open external links in the default browser, never inside the shell.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  const devUrl = process.env.BIRKA_DEV_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  win.on("closed", () => {
    win = null;
    bleCallback = null;
  });
}

ipcMain.handle("ble:select", (_event, id) => {
  if (bleCallback) {
    bleCallback(typeof id === "string" ? id : "");
    bleCallback = null;
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
