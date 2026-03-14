import { create } from "zustand";
import type { Notebook, Section, SectionGroup, Page } from "@/lib/graph";

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
}

export const useAppStore = create<AppState>((set) => ({
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
}));
