# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
bun install              # Install dependencies
bun run tauri dev        # Full app dev (Vite + Tauri Rust backend with HMR)
bun run dev              # Frontend only dev server (port 1420)
bun run build            # TypeScript check + Vite production build (frontend only)
bun run tauri build      # Full production build (frontend + Rust binary)
```

No test runner is configured yet. TypeScript errors are caught by `tsc` during `bun run build`.

## Architecture

UnNote is a **Tauri v2** desktop app with a **Vite + React 19** frontend that connects to Microsoft's Graph API to access OneNote notebooks.

### Key layers

1. **Tauri shell** (`src-tauri/`) — Rust binary providing native window, system tray, and the Store plugin for persistent settings. Minimal Rust code; most logic is in the frontend.
2. **Auth** (`src/lib/msal.ts`) — MSAL OAuth2 redirect flow for Microsoft sign-in. Has a dev token bypass (`setDevToken()`) for using Graph Explorer tokens during development because the school tenant requires admin consent for custom apps.
3. **Graph API client** (`src/lib/graph.ts`) — Typed singleton client for all OneNote endpoints. Two access patterns: `/me/onenote/...` for personal notebooks, `/groups/{id}/onenote/...` for class notebooks discovered via `/me/memberOf`.
4. **State** — Zustand (`src/stores/app-store.ts`) for UI/nav state, TanStack Query for API data with 5-min stale time and lazy loading (`enabled` flags).
5. **Settings** (`src/lib/settings.ts`) — Tauri Store plugin writes `settings.json` to the app config dir. Falls back to localStorage when running outside Tauri (browser dev).

### Component hierarchy

```
App.tsx (MSAL init → auth gate → QueryClientProvider)
├── LoginScreen (redirect auth + dev token paste)
└── Sidebar → SectionList → PageList (nested, lazy-loaded)
    PageViewer (OneNote HTML renderer with image auth)
    ClassManager (modal to hide/show class notebooks)
```

Selecting a parent in navigation cascades: choosing a notebook clears section/page selection.

## Critical Quirks

- **Page ID encoding**: OneNote page IDs contain `!` which must be URL-encoded as `%21` in API paths (handled by `GraphClient.encodeId()`).
- **OneNote HTML**: Pages use `position:absolute` divs with `data-absolute-enabled="true"`. The page viewer strips absolute positioning to render in normal document flow. CSS in `index.css` reinforces this.
- **Image auth**: OneNote images are behind Graph API auth. `PageViewer` fetches them with Bearer tokens and converts to blob URLs.
- **Class detection**: Groups are identified as class Teams by `creationOptions.includes("classAssignments") && resourceProvisioningOptions.includes("Team")`.
- **Search is broken**: The `/me/onenote/pages?search=` endpoint returns error 20108 on this tenant. The global `/me/onenote/pages` endpoint also fails (error 20266: too many sections). Always query pages per-section.
- **CSP is null**: Intentionally disabled to allow OneNote HTML content with inline styles. Tighten for production.
- **Admin consent**: The UnNote app registration (`804045d9-4f59-45f5-bfcb-efdd3672d5e4`) requires admin consent on the school tenant. Currently using Graph Explorer's client ID (`de8bc8b5-d9f9-48b1-a8ad-b748da725064`) as a workaround. Switch back once consent is granted.

## API Reference

Full endpoint documentation with response structures, ID formats, and access patterns is in `API_FINDINGS.md`.
