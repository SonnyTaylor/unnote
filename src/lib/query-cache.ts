import type { QueryClient } from "@tanstack/react-query";

const CACHE_KEY = "queryCache";
const CACHE_VERSION = 1;

interface CachedData {
  version: number;
  timestamp: number;
  entries: Array<{
    queryKey: unknown[];
    data: unknown;
    dataUpdatedAt: number;
  }>;
}

// Only cache navigation data, not page HTML content (too large)
const CACHEABLE_PREFIXES = [
  "personal-notebooks",
  "class-notebooks",
  "section-groups",
  "top-sections",
  "sg-sections",
  "pages",
];

function isCacheableKey(queryKey: readonly unknown[]): boolean {
  const prefix = queryKey[0];
  return typeof prefix === "string" && CACHEABLE_PREFIXES.includes(prefix);
}

/**
 * Save the current query cache to Tauri Store (or localStorage fallback).
 * Only persists navigation data, not page content.
 */
export async function persistQueryCache(queryClient: QueryClient): Promise<void> {
  try {
    const cache = queryClient.getQueryCache();
    const entries: CachedData["entries"] = [];

    for (const query of cache.getAll()) {
      if (
        query.state.status === "success" &&
        query.state.data !== undefined &&
        isCacheableKey(query.queryKey)
      ) {
        entries.push({
          queryKey: query.queryKey as unknown[],
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
        });
      }
    }

    const cached: CachedData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      entries,
    };

    // Use Tauri Store if available, localStorage fallback
    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load("cache.json", { autoSave: true, defaults: {} });
      await store.set(CACHE_KEY, cached);
    } else {
      localStorage.setItem(`unnote_${CACHE_KEY}`, JSON.stringify(cached));
    }
  } catch {
    // Silently fail — cache is best-effort
  }
}

/**
 * Restore cached query data into the QueryClient.
 * Cached data is treated as stale but shown instantly while refetching.
 */
export async function restoreQueryCache(queryClient: QueryClient): Promise<void> {
  try {
    let cached: CachedData | null = null;

    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load("cache.json", { autoSave: true, defaults: {} });
      cached = await store.get<CachedData>(CACHE_KEY) ?? null;
    } else {
      const raw = localStorage.getItem(`unnote_${CACHE_KEY}`);
      if (raw) cached = JSON.parse(raw);
    }

    if (!cached || cached.version !== CACHE_VERSION) return;

    // Don't restore data older than 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - cached.timestamp > maxAge) return;

    for (const entry of cached.entries) {
      queryClient.setQueryData(entry.queryKey, entry.data, {
        updatedAt: entry.dataUpdatedAt,
      });
    }
  } catch {
    // Silently fail
  }
}
