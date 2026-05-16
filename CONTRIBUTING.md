# Contributing

## Setup

1. Install dependencies: `npm install`
2. Compile: `npm run compile`
3. Run extension in dev host: press `F5`

## Commit Style

Use conventional commits when possible:

- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation

## Scope

Keep this extension lightweight:

- No runtime third-party dependencies
- Prefer VS Code API + Node.js built-ins
- Avoid writing files into user workspace folders
