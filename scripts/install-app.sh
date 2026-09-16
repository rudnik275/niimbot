#!/bin/sh
# Build the desktop app and install it into ~/Applications (+ alias on the Desktop).
# Usage: npm run app:install
set -eu
cd "$(dirname "$0")/.."

# 1) icon: rasterise build/icon.svg → build/icon.png (1024²) with macOS Quick Look
if [ ! -f build/icon.png ] || [ build/icon.svg -nt build/icon.png ]; then
  rm -f build/icon.svg.png
  qlmanage -t -s 1024 -o build build/icon.svg >/dev/null 2>&1 || true
  if [ -f build/icon.svg.png ]; then mv build/icon.svg.png build/icon.png; fi
fi

# 2) web bundle + unsigned .app (no dmg; this Mac is the only target)
npm run build
npx electron-builder --mac dir

APP=$(find release -maxdepth 2 -name 'Бирка.app' -type d | head -1)
if [ -z "$APP" ]; then echo "app bundle not found under release/"; exit 1; fi

# 3) install
mkdir -p "$HOME/Applications"
rm -rf "$HOME/Applications/Бирка.app"
cp -R "$APP" "$HOME/Applications/Бирка.app"

# 4) shortcut on the Desktop: a symlink to the bundle (double-click launches it)
rm -f "$HOME/Desktop/Бирка" "$HOME/Desktop/Бирка.app" 2>/dev/null || true
ln -s "$HOME/Applications/Бирка.app" "$HOME/Desktop/Бирка.app"

echo "installed: $HOME/Applications/Бирка.app (shortcut on Desktop)"
