# UnNote

A better cross-platform OneNote client. Native desktop app that connects to your existing Microsoft OneNote notebooks via the Microsoft Graph API.

**UnNote is not affiliated with Microsoft.** It's an open-source alternative client for people who want a native OneNote experience on Linux, or a faster/lighter client on Windows and macOS.

## Why?

There is no official OneNote client for Linux. The existing workarounds (Electron wrappers around OneNote Web, WINE, hidden VMs) are slow, buggy, or resource-heavy. UnNote talks directly to the Microsoft Graph API to give you a real native experience.

## Features (v0.1 — Read-Only)

- Sign in with your Microsoft account (personal or school/work)
- Browse all your personal notebooks
- Browse class notebooks from Microsoft Teams
- View full page content including text, tables, lists, and images
- Dark mode support
- Fast local caching via TanStack Query

## Planned Features

- Page editing (create, modify, delete pages)
- Offline mode with local SQLite cache
- Search across notebooks
- Keyboard shortcuts and command palette
- Real-time sync (polling-based, since OneNote has no webhooks)

## Tech Stack

- **Shell**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend**: [Vite](https://vite.dev/) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) (UI) + [TanStack Query](https://tanstack.com/query) (API/cache)
- **Auth**: [@azure/msal-browser](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- **API**: [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/api/resources/onenote-api-overview)
- **Package Manager**: [Bun](https://bun.sh/)

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/) (v1.0+)
- System dependencies for Tauri — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/SonnyTaylor/unnote.git
cd unnote

# Install dependencies
bun install

# Run in development mode
bun run tauri dev

# Build for production
bun run tauri build
```

## Project Structure

```
unnote/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI components
│   │   ├── login-screen.tsx
│   │   ├── sidebar.tsx
│   │   ├── section-list.tsx
│   │   ├── page-list.tsx
│   │   └── page-viewer.tsx
│   ├── lib/                # Utilities and API clients
│   │   ├── graph.ts        # Microsoft Graph API client + types
│   │   ├── msal.ts         # MSAL authentication config
│   │   └── utils.ts        # Tailwind cn() helper
│   ├── stores/             # Zustand state management
│   │   └── app-store.ts
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind theme + OneNote styles
├── src-tauri/              # Backend (Rust)
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── API_FINDINGS.md         # Detailed Microsoft Graph API research
└── components.json         # shadcn/ui configuration
```

## Authentication

UnNote uses Microsoft's MSAL library for OAuth2 authentication. It supports:

- Personal Microsoft accounts
- Work/school accounts (Microsoft 365)
- Multi-tenant authentication

The app requests these permissions:
- `User.Read` — read your profile
- `Notes.Read` / `Notes.ReadWrite` — read and write your OneNote content
- `Group.Read.All` — discover class notebooks from Microsoft Teams

## API Documentation

See [API_FINDINGS.md](./API_FINDINGS.md) for detailed research on the Microsoft Graph OneNote API, including endpoint behavior, quirks, and access patterns.

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
