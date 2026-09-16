# ADR-0005. Настольная оболочка — Electron с собственным окном выбора Bluetooth

Дата: 2026-09-16 · Статус: принято

## Контекст

Пользователь хочет открывать инструмент с рабочего стола как приложение, а не держать
dev-сервер и вкладку. Печать идёт по Web Bluetooth, поэтому оболочка обязана нести
Chromium: WKWebView (Tauri, «Add to Dock» в Safari) Web Bluetooth не поддерживает.
PWA-установка из Chrome требует https-хостинга или запущенного локального сервера.

## Решение

Electron (`electron/main.cjs` + `preload.cjs`) загружает собранный `dist/index.html` по
`file://`; `npm run app:install` собирает `.app` без подписи (`electron-builder --mac dir`),
кладёт его в `~/Applications/Бирка.app` и делает алиас на рабочем столе. Иконка
растеризуется из `build/icon.svg` через Quick Look (`qlmanage`).

У Electron нет встроенного диалога выбора Bluetooth-устройства: событие
`select-bluetooth-device` перехватывается в main, список устройств уходит в renderer
(`src/ui/BlePicker.tsx`), пользователь выбирает, id возвращается через IPC. При «снова к
B1-…» окно не показывается — принтер с прошлым именем выбирается автоматически.
Info.plist получает `NSBluetoothAlwaysUsageDescription`, иначе macOS убьёт процесс при
первом обращении к Bluetooth.

Веб-версия остаётся: тот же код, в браузере `window.birka` нет и работает родной диалог Chrome.

## Последствия

- Приложение не подписано: собранное на этом же Mac открывается без карантина; скачанную
  копию Gatekeeper заблокирует. Подпись и нотаризация не нужны для личного инструмента.
- Обновление = `npm run app:install` заново (Electron не умеет сам подтягивать `dist/`).
- `navigator.bluetooth.getDevices()` в Electron нет; быстрое переподключение реализовано
  через автовыбор в собственном диалоге.
- Размер `.app` ≈ 200 МБ (Chromium внутри); `release/` в `.gitignore`.
