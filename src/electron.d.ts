/** Bridge exposed by electron/preload.cjs when running inside the desktop shell. */
export interface BleDevice {
  id: string;
  name: string;
}

export interface BirkaBridge {
  platform: string;
  /** Device list updates while Chromium scans; returns an unsubscribe function. */
  onBluetoothDevices(cb: (devices: BleDevice[]) => void): () => void;
  /** Pick a device by id, or "" to cancel the pending requestDevice(). */
  selectBluetoothDevice(id: string): Promise<void>;
}

declare global {
  interface Window {
    birka?: BirkaBridge;
  }
}
