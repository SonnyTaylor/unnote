import { useQuery } from "@tanstack/react-query";
import { graphClient, type Notebook } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { SectionList } from "./section-list";
import {
  ChevronDown,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  AlertCircle,
  Settings,
  BookOpen,
} from "lucide-react";
import { clearDevToken } from "@/lib/msal";
import { useRef, useEffect } from "react";

interface ClassNotebook {
  groupId: string;
  groupName: string;
  notebook: Notebook;
}

const NOTEBOOK_COLORS = [
  "#7B2D8B",
  "#D45D00",
  "#0078D4",
  "#107C10",
  "#C50F1F",
  "#038387",
  "#8764B8",
  "#D13438",
  "#00B294",
  "#6B69D6",
  "#E3008C",
  "#004B50",
];

function getNotebookColor(index: number) {
  return NOTEBOOK_COLORS[index % NOTEBOOK_COLORS.length];
}

/** Animated expand/collapse wrapper using grid row trick */
function AnimatedExpand({ open, children, animate }: { open: boolean; children: React.ReactNode; animate: boolean }) {
  return (
    <div
      className="grid overflow-hidden"
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: animate ? "grid-template-rows 200ms ease-out" : "none",
      }}
    >
      <div className="min-h-0">{children}</div>
    </div>
  );
}

export function Sidebar({ width }: { width: number }) {
  const {
    sidebarOpen,
    toggleSidebar,
    selectedNotebook,
    setSelectedNotebook,
    setAuth,
    hiddenGroupIds,
    setShowSettings,
    animationsEnabled,
  } = useAppStore();

  const {
    data: personalNotebooks,
    isLoading: loadingPersonal,
    error: personalError,
  } = useQuery({
    queryKey: ["personal-notebooks"],
    queryFn: async () => {
      const res = await graphClient.getPersonalNotebooks();
      return res.value;
    },
  });

  const {
    data: classNotebooks,
    isLoading: loadingClasses,
    error: classError,
  } = useQuery({
    queryKey: ["class-notebooks"],
    queryFn: async () => {
      const groups = await graphClient.getUserGroups();
      const classGroups = groups.value.filter(
        (g) =>
          g.creationOptions?.includes("classAssignments") &&
          g.resourceProvisioningOptions?.includes("Team")
      );

      const results = await Promise.allSettled(
        classGroups.map(async (group) => {
          const notebooks = await graphClient.getGroupNotebooks(group.id);
          return notebooks.value.map((nb) => ({
            groupId: group.id,
            groupName: group.displayName,
            notebook: nb,
          }));
        })
      );

      return results
        .filter((r): r is PromiseFulfilledResult<ClassNotebook[]> => r.status === "fulfilled")
        .flatMap((r) => r.value);
    },
  });

  const visibleClassNotebooks = (classNotebooks ?? []).filter(
    (cn) => !hiddenGroupIds.has(cn.groupId)
  );
  const hiddenCount = (classNotebooks ?? []).length - visibleClassNotebooks.length;

  const handleLogout = () => {
    clearDevToken();
    setAuth(false);
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-2 top-2 z-50 rounded-md p-2 hover:bg-accent"
        title="Open sidebar"
      >
        <PanelLeft className="h-5 w-5" />
      </button>
    );
  }

  const allPersonal = personalNotebooks ?? [];
  const allClass = visibleClassNotebooks.map((cn) => ({
    ...cn.notebook,
    groupId: cn.groupId,
  }));

  return (
    <aside
      className="surface-mica surface-sheen flex h-full flex-col overflow-hidden"
      style={{ width, minWidth: width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <img src="/unnote.svg" alt="UnNote" className="h-5 w-5" />
          <span className="text-[13px] font-semibold text-sidebar-foreground tracking-tight">
            UnNote
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-md p-1.5 hover:bg-white/20 dark:hover:bg-white/10"
            title="Settings"
          >
            <Settings className="h-4 w-4 text-sidebar-foreground/50" />
          </button>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 hover:bg-white/20 dark:hover:bg-white/10"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4 text-sidebar-foreground/50" />
          </button>
        </div>
      </div>

      {/* Notebook list */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2">
        {/* Personal notebooks */}
        {loadingPersonal ? (
          <SectionLabel label="Notebooks" loading />
        ) : personalError ? (
          <ErrorRow message="Failed to load notebooks" />
        ) : allPersonal.length > 0 ? (
          <>
            <SectionLabel label="Notebooks" />
            {allPersonal.map((nb, i) => (
              <NotebookItem
                key={nb.id}
                notebook={nb}
                color={getNotebookColor(i)}
                isSelected={selectedNotebook?.id === nb.id}
                onSelect={() => setSelectedNotebook(nb)}
                animate={animationsEnabled}
              />
            ))}
          </>
        ) : null}

        {/* Class notebooks */}
        {loadingClasses ? (
          <SectionLabel label="Class Notebooks" loading />
        ) : classError ? (
          <ErrorRow message="Failed to load classes" />
        ) : allClass.length > 0 ? (
          <>
            <SectionLabel label="Class Notebooks" />
            {allClass.map((nb, i) => (
              <NotebookItem
                key={nb.id}
                notebook={nb}
                color={getNotebookColor(allPersonal.length + i)}
                isSelected={selectedNotebook?.id === nb.id}
                onSelect={() => setSelectedNotebook(nb)}
                animate={animationsEnabled}
              />
            ))}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowSettings(true)}
                className="ml-2 mt-1.5 text-[11px] text-muted-foreground hover:text-primary"
              >
                +{hiddenCount} hidden
              </button>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-2.5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12px] text-muted-foreground hover:bg-white/15 dark:hover:bg-white/8 hover:text-sidebar-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ label, loading }: { label: string; loading?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 px-2 pb-1 pt-4 first:pt-1">
      {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </div>
  );
}

function NotebookItem({
  notebook,
  color,
  isSelected,
  onSelect,
  animate,
}: {
  notebook: Notebook & { groupId?: string };
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  animate: boolean;
}) {
  // Track whether the section list has been rendered (to avoid animating initial mount)
  const hasRendered = useRef(false);
  useEffect(() => {
    hasRendered.current = true;
  }, []);

  return (
    <div>
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] ${
          isSelected
            ? "bg-white/25 dark:bg-white/10 text-sidebar-foreground font-medium shadow-sm"
            : "text-sidebar-foreground/80 hover:bg-white/15 dark:hover:bg-white/6"
        }`}
      >
        {/* Colored notebook icon */}
        <div
          className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-md shadow-sm"
          style={{
            backgroundColor: color,
            boxShadow: `0 1px 3px ${color}40`,
          }}
        >
          <BookOpen className="h-3 w-3 text-white" />
        </div>
        <span className="flex-1 truncate text-left">{notebook.displayName}</span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40"
          style={{
            transform: isSelected ? "rotate(0deg)" : "rotate(-90deg)",
            transition: animate ? "transform 200ms ease-out" : "none",
          }}
        />
      </button>

      {/* Section tree expands with animation */}
      <AnimatedExpand open={isSelected} animate={animate && hasRendered.current}>
        <div className="mb-1">
          <SectionList notebookColor={color} />
        </div>
      </AnimatedExpand>
    </div>
  );
}
