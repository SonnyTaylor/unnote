import { create } from "zustand";
import type { Notebook, Section, SectionGroup, Page } from "@/lib/graph";
import { getSetting, setSetting } from "@/lib/settings";
import { applyTheme } from "@/lib/themes";

export interface ClassNotebookInfo {
  groupId: string;
  groupName: string;
  notebook: Notebook;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  userName: string | null;
  setAuth: (authenticated: boolean, name?: string) => void;

  // Navigation
  selectedNotebook: (Notebook & { groupId?: string }) | null;
  selectedSectionGroup: SectionGroup | null;
  selectedSection: (Section & { groupId?: string }) | null;
  selectedPage: (Page & { groupId?: string }) | null;

  setSelectedNotebook: (notebook: (Notebook & { groupId?: string }) | null) => void;
  setSelectedSectionGroup: (group: SectionGroup | null) => void;
  setSelectedSection: (section: (Section & { groupId?: string }) | null) => void;
  setSelectedPage: (page: (Page & { groupId?: string }) | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Hidden notebooks (persisted via Tauri Store)
  hiddenGroupIds: Set<string>;
  toggleHiddenGroup: (groupId: string) => void;
  loadSettings: () => Promise<void>;

  // Theme
  currentTheme: string;
  themeMode: "light" | "dark" | "system";
  setTheme: (themeId: string) => void;
  setThemeMode: (mode: "light" | "dark" | "system") => void;

  // Settings panel
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  userName: null,
  setAuth: (authenticated, name) =>
    set({ isAuthenticated: authenticated, userName: name ?? null }),

  selectedNotebook: null,
  selectedSectionGroup: null,
  selectedSection: null,
  selectedPage: null,

  setSelectedNotebook: (notebook) =>
    set({
      selectedNotebook: notebook,
      selectedSectionGroup: null,
      selectedSection: null,
      selectedPage: null,
    }),
  setSelectedSectionGroup: (group) =>
    set({
      selectedSectionGroup: group,
      selectedSection: null,
      selectedPage: null,
    }),
  setSelectedSection: (section) =>
    set({ selectedSection: section, selectedPage: null }),
  setSelectedPage: (page) => set({ selectedPage: page }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  hiddenGroupIds: new Set(),
  toggleHiddenGroup: async (groupId) => {
    const current = get().hiddenGroupIds;
    const next = new Set(current);
    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }
    set({ hiddenGroupIds: next });
    await setSetting("hiddenGroupIds", [...next]);
  },

  loadSettings: async () => {
    const hiddenIds = await getSetting("hiddenGroupIds");
    const theme = await getSetting("theme");
    const themeMode = await getSetting("themeMode");
    set({ hiddenGroupIds: new Set(hiddenIds), currentTheme: theme, themeMode });
    applyTheme(theme, themeMode);
  },

  currentTheme: "unnote",
  themeMode: "system",
  setTheme: async (themeId) => {
    const mode = get().themeMode;
    set({ currentTheme: themeId });
    applyTheme(themeId, mode);
    await setSetting("theme", themeId);
  },
  setThemeMode: async (mode) => {
    const themeId = get().currentTheme;
    set({ themeMode: mode });
    applyTheme(themeId, mode);
    await setSetting("themeMode", mode);
  },

  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
}));
