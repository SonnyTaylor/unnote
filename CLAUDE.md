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

UnNote is a **Tauri v2** desktop app with a **Vite + React 19** frontend that connects to Microsoft's Graph API to access OneNote notebooks. It's an open-source cross-platform OneNote client.

**Repo:** https://github.com/SonnyTaylor/unnote

### Key layers

1. **Tauri shell** (`src-tauri/`) — Rust binary providing native window, custom titlebar (decorations disabled), and plugins: Store (settings + query cache + dev token), Dialog (native file dialogs), Window State (persist window size/position). Minimal Rust code; almost all logic is in the frontend.
2. **Auth** (`src/lib/msal.ts`) — MSAL OAuth2 redirect flow for Microsoft sign-in. Has a dev token bypass (`setDevToken()`) for using Graph Explorer tokens during development because the school tenant requires admin consent for custom apps.
3. **Graph API client** (`src/lib/graph.ts`) — Typed singleton client for all OneNote endpoints. Two access patterns: `/me/onenote/...` for personal notebooks, `/groups/{id}/onenote/...` for class notebooks discovered via `/me/memberOf`.
4. **State** — Zustand (`src/stores/app-store.ts`) for UI/nav state + theme + hidden classes. TanStack Query for API data with 5-min stale time and lazy loading (`enabled` flags).
5. **Settings** (`src/lib/settings.ts`) — Tauri Store plugin writes `settings.json` to the app config dir. Falls back to localStorage when running outside Tauri (browser dev). Stores: hidden group IDs, theme ID, theme mode, animation toggle, dev token, panel widths.
7. **Query cache** (`src/lib/query-cache.ts`) — Persists TanStack Query navigation data (notebooks, sections, pages) to `cache.json` via Tauri Store. Restores on startup for instant loading. Excludes page HTML content. Auto-persists every 2 minutes + on unload. 24-hour max age.
6. **Themes** (`src/lib/themes.ts`) — 17 built-in themes. `applyTheme()` sets CSS custom properties on `document.documentElement` at runtime, overriding Tailwind v4 defaults from `@theme` in index.css.

### Component hierarchy

```
App.tsx (MSAL init → auth gate → QueryClientProvider → cache restore → system theme listener)
├── Titlebar (custom window controls: minimize/maximize/close, drag region)
├── LoginScreen (redirect auth + dev token paste)
└── ErrorBoundary
    ├── Sidebar → SectionList (nested, lazy-loaded, animated expand)
    ├── ErrorBoundary → PagePanel (page list with dates, staggered animation)
    ├── ErrorBoundary → PageViewer (OneNote HTML renderer with image auth, checkboxes, tags, file cards)
    └── ClassManager (tabbed settings modal: Classes + Appearance)
          └── ThemePicker (theme cards + light/dark/system toggle + animations toggle)
```

Selecting a parent in navigation cascades: choosing a notebook clears section/page selection.

## Microsoft Graph API — Quick Reference

Full endpoint research is in `API_FINDINGS.md`. Key points for development:

### Discovering all notebooks

```
GET /me/onenote/notebooks                                    → personal notebooks
GET /me/memberOf?$select=id,displayName,creationOptions,resourceProvisioningOptions,groupTypes
  → filter: creationOptions includes "classAssignments" AND resourceProvisioningOptions includes "Team"
  → gives class Team group IDs
GET /groups/{groupId}/onenote/notebooks                      → class notebook for each group
```

`includesharednotebooks=true` does NOT return class notebooks. Groups API is the only way.

### Navigating notebook structure

```
GET .../notebooks/{id}/sectionGroups     → for class notebooks: _Collaboration Space, _Content Library, {Student Name}
GET .../sectionGroups/{id}/sections      → sections within a group
GET .../notebooks/{id}/sections          → top-level sections (personal notebooks)
GET .../sections/{id}/pages?$top=100     → pages (default 20, paginated via @odata.nextLink)
GET .../pages/{pageId}/content           → full HTML content (MUST encode ! as %21 in pageId)
```

### Write operations (all tested and working)

```
POST .../sections/{sectionId}/pages      → create page (Content-Type: application/xhtml+xml)
PATCH .../pages/{pageId}/content         → modify page (JSON array of {target, action, content})
DELETE .../pages/{pageId}                → delete page (returns 204)
```

All write ops require `%21` encoding for `!` in page IDs.

### PATCH format

```json
[{"target": "body", "action": "append", "content": "<p>New content</p>"}]
```
Actions: `append`, `replace`, `delete`, `insert`, `prepend`. Target can be `"body"` or a CSS selector like `#element-id`.

### What's broken on this tenant

| Endpoint | Error | Workaround |
|----------|-------|------------|
| `/me/onenote/pages?search=...` | 20108: unsupported OData params | Client-side search on cached titles |
| `/me/onenote/pages` (global) | 20266: too many sections | Always query per-section |
| `/education/me/classes` | 403: missing scopes | Use `/me/memberOf` instead |
| Page `level` + `order` fields | Not returned (v1.0 or beta) | Subpage indentation not possible on this tenant — fields are absent from the response even on the beta endpoint. SharePoint-backed class notebooks may not support these. `Page` interface marks them optional; UI handles gracefully. |

### Image resources

Images in page HTML have Graph API URLs: `https://graph.microsoft.com/v1.0/groups('...')/onenote/resources/{id}/$value`. These require Bearer token auth. The `PageViewer` component fetches them with auth headers and converts to blob URLs.

### Class notebook permission model (student account)

| Area | List | Read | Write |
|------|------|------|-------|
| Own section group | Yes | Yes | Yes |
| _Content Library | Yes | Yes | No (read-only in UI) |
| _Collaboration Space | Yes | Yes | Yes |
| _Teacher Only | **Hidden** | N/A | N/A |
| Other students | **Hidden** | N/A | N/A |

### ID formats

- Notebooks/sections/section groups: `1-{uuid}`
- Pages and resources: `1-{hex}!{seq}-{section-uuid}` — the `!` MUST be URL-encoded as `%21` in API paths

## Critical Quirks

- **Page ID encoding**: `!` → `%21` in all API paths. Handled by `GraphClient.encodeId()`.
- **OneNote HTML rendering**: Pages use `position:absolute` divs. The page viewer strips absolute positioning via regex in `normalizeOneNoteHtml()` and CSS fallbacks in `index.css`.
- **Image auth**: Graph API image URLs need Bearer tokens. `PageViewer` fetches → blob URL conversion with cleanup on unmount.
- **CSP is null**: Intentionally disabled to allow OneNote HTML inline styles. Tighten for production.
- **Admin consent**: UnNote app registration (`804045d9-4f59-45f5-bfcb-efdd3672d5e4`) needs admin consent on EDUVIC tenant. Currently using Graph Explorer's client ID (`de8bc8b5-d9f9-48b1-a8ad-b748da725064`) as workaround. The `TODO` is in `src/lib/msal.ts`.
- **Theme system**: `@theme` block in `index.css` defines CSS variable names for Tailwind utility generation. Runtime values are overridden by `applyTheme()` via `document.documentElement.style.setProperty()`. Don't put theme colors in `@theme` — that's only for defaults/Tailwind discovery.
- **No webhooks**: OneNote has no push notifications. Sync must be polling-based.
- **Pagination**: Default page size is 20. Use `$top` and `$skip` or follow `@odata.nextLink`.

## Current Status (v0.1)

**Working:** Auth (dev token + MSAL with auto-refresh), 3-pane layout, page viewer with checkboxes/tags/file cards/video embeds, class visibility management, 17 themes with light/dark/system, glassmorphism UI with animations (toggleable), custom titlebar, persistent query cache, window state persistence, error boundaries, pagination for 20+ page sections.

**Next priorities:**
1. Client-side search across cached page titles
2. Keyboard shortcuts + command palette
3. System tray + auto-updater
4. Editing (TipTap + PATCH API) — v0.2 milestone
