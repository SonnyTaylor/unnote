import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/stores/app-store";
import { queryKeys, type Notebook, type Page, type WithGroupId } from "@/lib/graph";
import { Search, BookOpen, StickyNote, Settings, LogOut } from "lucide-react";
import { clearDevToken } from "@/lib/msal";

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  category: "page" | "section" | "notebook" | "action";
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const {
    setSelectedNotebook,
    setSelectedPage,
    setShowSettings,
    setAuth,
    animationsEnabled,
  } = useAppStore();

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build searchable items from TanStack Query cache
  const allItems = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Notebooks
    const personalNbs = queryClient.getQueryData<Notebook[]>(queryKeys.personalNotebooks);
    if (personalNbs) {
      for (const nb of personalNbs) {
        items.push({
          id: `nb-${nb.id}`,
          label: nb.displayName,
          sublabel: "Notebook",
          icon: <BookOpen className="h-4 w-4" />,
          category: "notebook",
          action: () => {
            setSelectedNotebook(nb);
            setOpen(false);
          },
        });
      }
    }

    // Class notebooks
    const classNbs = queryClient.getQueryData<Array<{ groupId: string; groupName: string; notebook: Notebook }>>(queryKeys.classNotebooks);
    if (classNbs) {
      for (const cn of classNbs) {
        const nb: WithGroupId<Notebook> = { ...cn.notebook, groupId: cn.groupId };
        items.push({
          id: `nb-${cn.notebook.id}`,
          label: cn.notebook.displayName,
          sublabel: "Class Notebook",
          icon: <BookOpen className="h-4 w-4" />,
          category: "notebook",
          action: () => {
            setSelectedNotebook(nb);
            setOpen(false);
          },
        });
      }
    }

    // Pages from all cached section queries
    const cache = queryClient.getQueryCache();
    for (const q of cache.getAll()) {
      const key = q.queryKey;
      if (typeof key[0] === "string" && key[0] === "pages" && q.state.data) {
        const groupId = key[2] as string | undefined;
        const pages = q.state.data as Page[];
        for (const page of pages) {
          items.push({
            id: `page-${page.id}`,
            label: page.title || "Untitled",
            sublabel: page.parentSection?.displayName,
            icon: <StickyNote className="h-4 w-4" />,
            category: "page",
            action: () => {
              setSelectedPage(groupId ? { ...page, groupId } : page);
              setOpen(false);
            },
          });
        }
      }
    }

    // Actions
    items.push({
      id: "action-settings",
      label: "Open Settings",
      sublabel: "Ctrl+,",
      icon: <Settings className="h-4 w-4" />,
      category: "action",
      action: () => {
        setShowSettings(true);
        setOpen(false);
      },
    });

    items.push({
      id: "action-logout",
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4" />,
      category: "action",
      action: async () => {
        await clearDevToken();
        setAuth(false);
        setOpen(false);
      },
    });

    return items;
  }, [open]); // Rebuild when opened to get fresh cache

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 20); // Show top 20 when empty
    const q = query.toLowerCase();
    return allItems
      .filter((item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel?.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [query, allItems]);

  // Reset index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  if (!open) return null;

  const categoryOrder = ["page", "notebook", "action"] as const;
  const grouped = new Map<string, CommandItem[]>();
  for (const item of filtered) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const categoryLabels: Record<string, string> = {
    page: "Pages",
    section: "Sections",
    notebook: "Notebooks",
    action: "Actions",
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      style={{ animation: animationsEnabled ? "fadeIn 100ms ease-out" : "none" }}
    >
      <div
        className="surface-glass surface-sheen w-full max-w-lg rounded-2xl border border-border/50 shadow-2xl shadow-black/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: animationsEnabled ? "scaleIn 150ms ease-out" : "none" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, notebooks, or actions..."
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-muted-foreground/60">
              No results found
            </div>
          ) : (
            categoryOrder.map((cat) => {
              const items = grouped.get(cat);
              if (!items?.length) return null;
              return (
                <div key={cat}>
                  <div className="px-4 pt-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                      {categoryLabels[cat]}
                    </span>
                  </div>
                  {items.map((item) => {
                    const idx = filtered.indexOf(item);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] ${
                          isSelected
                            ? "bg-primary/10 text-foreground"
                            : "text-foreground/80 hover:bg-white/10"
                        }`}
                      >
                        <span className={isSelected ? "text-primary" : "text-muted-foreground/60"}>
                          {item.icon}
                        </span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.sublabel && (
                          <span className="text-[11px] text-muted-foreground/50 truncate max-w-[120px]">
                            {item.sublabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-border/40 px-4 py-2 text-[10px] text-muted-foreground/50">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
