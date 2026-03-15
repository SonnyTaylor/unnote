import { load } from "@tauri-apps/plugin-store";

export interface AppSettings {
  hiddenGroupIds: string[];
  theme: string;
  themeMode: "light" | "dark" | "system";
  sidebarWidth: number;
  pagePanelWidth: number;
  animationsEnabled: boolean;
  devToken: string;
}

const DEFAULTS: AppSettings = {
  hiddenGroupIds: [],
  theme: "unnote",
  themeMode: "system",
  sidebarWidth: 208,
  pagePanelWidth: 224,
  animationsEnabled: true,
  devToken: "",
};

let store: Awaited<ReturnType<typeof load>> | null = null;
let isTauri = false;

// Check if we're running inside Tauri
try {
  isTauri = !!(window as any).__TAURI_INTERNALS__;
} catch {}

async function getStore() {
  if (!store && isTauri) {
    store = await load("settings.json", { autoSave: true, defaults: {} });
  }
  return store;
}

// Fallback to localStorage when not in Tauri (e.g., browser dev)
function localGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`unnote_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function localSet(key: string, value: unknown) {
  localStorage.setItem(`unnote_${key}`, JSON.stringify(value));
}

export async function getSetting<K extends keyof AppSettings>(
  key: K
): Promise<AppSettings[K]> {
  const s = await getStore();
  if (s) {
    const val = await s.get<AppSettings[K]>(key);
    return val ?? DEFAULTS[key];
  }
  return localGet(key, DEFAULTS[key]);
}

export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const s = await getStore();
  if (s) {
    await s.set(key, value);
  } else {
    localSet(key, value);
  }
}
