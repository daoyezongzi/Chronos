# Chronos

A lightweight VS Code extension that tracks net active coding time per workspace and displays it in the status bar.

## Features

- Tracks active time using a 60-second heartbeat.
- Filters idle/away time with a 5-minute inactivity threshold.
- Persists data in VS Code global state (no project file pollution).
- Keeps a status bar item always visible.

## Current Behavior

- Time is tracked for the workspace folder of the active editor file.
- Activity signals:
  - Text document changes
  - Text editor selection changes
- If no workspace/file is detected, the status bar shows a placeholder.

## Requirements

- VS Code `^1.74.0`
- Node.js 18+

## Development

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host.

## Package VSIX

```bash
npm run package
```

## Install Locally

In VS Code:

1. Open Extensions panel.
2. Click `...`.
3. Select `Install from VSIX...`.
4. Choose the generated `.vsix` file.

## Roadmap

- Historical stats view
- Total cumulative summary
- Agent-run time channel

## License

MIT

