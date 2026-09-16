import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  // Relative asset paths so `dist/` works from any static host or a plain
  // `file://` open; Web Bluetooth still needs localhost or https.
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
