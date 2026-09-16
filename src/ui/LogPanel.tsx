import { printerLog } from "../printer/client";

export function LogPanel() {
  const lines = printerLog.value;
  return (
    <details class="log center-log">
      <summary>журнал принтера{lines.length ? ` · ${lines.length}` : ""}</summary>
      <pre class="mono">{lines.slice(-60).join("\n") || "—"}</pre>
    </details>
  );
}
