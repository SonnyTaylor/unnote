import { useQuery } from "@tanstack/react-query";
import { graphClient, type Notebook } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { SectionList } from "./section-list";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  AlertCircle,
  Settings,
} from "lucide-react";
import { clearDevToken } from "@/lib/msal";

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

export function Sidebar({ width }: { width: number }) {
  const {
    sidebarOpen,
    toggleSidebar,
    selectedNotebook,
    setSelectedNotebook,
    setAuth,
    hiddenGroupIds,
    setShowSettings,
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
    <aside className="flex h-full flex-col border-r border-sidebar-border bg-sidebar-background overflow-hidden" style={{ width, minWidth: width }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <img src="/unnote.svg" alt="UnNote" className="h-5 w-5" />
          <span className="text-sm font-semibold text-sidebar-foreground">UnNote</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded p-1.5 hover:bg-sidebar-accent transition-colors"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5 text-sidebar-foreground/60" />
          </button>
          <button
            onClick={toggleSidebar}
            className="rounded p-1.5 hover:bg-sidebar-accent transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5 text-sidebar-foreground/60" />
          </button>
        </div>
      </div>

      {/* Notebook list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {/* Personal notebooks */}
        {loadingPersonal ? (
          <SectionLabel label="Personal" loading />
        ) : personalError ? (
          <ErrorRow message="Failed to load notebooks" />
        ) : allPersonal.length > 0 ? (
          <>
            <SectionLabel label="Personal" />
            {allPersonal.map((nb, i) => (
              <NotebookItem
                key={nb.id}
                notebook={nb}
                color={getNotebookColor(i)}
                isSelected={selectedNotebook?.id === nb.id}
                onSelect={() => setSelectedNotebook(nb)}
              />
            ))}
          </>
        ) : null}

        {/* Class notebooks */}
        {loadingClasses ? (
          <SectionLabel label="Classes" loading />
        ) : classError ? (
          <ErrorRow message="Failed to load classes" />
        ) : allClass.length > 0 ? (
          <>
            <SectionLabel label="Classes" />
            {allClass.map((nb, i) => (
              <NotebookItem
                key={nb.id}
                notebook={nb}
                color={getNotebookColor(allPersonal.length + i)}
                isSelected={selectedNotebook?.id === nb.id}
                onSelect={() => setSelectedNotebook(nb)}
              />
            ))}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowSettings(true)}
                className="mx-2 mt-1 text-[11px] text-muted-foreground hover:text-sidebar-foreground transition-colors"
              >
                +{hiddenCount} hidden
              </button>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
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
    <div className="flex items-center gap-1.5 px-3 pb-0.5 pt-2.5">
      {loading && <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground" />}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="h-3 w-3" />
      {message}
    </div>
  );
}

function NotebookItem({
  notebook,
  color,
  isSelected,
  onSelect,
}: {
  notebook: Notebook & { groupId?: string };
  color: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div>
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 mx-1 text-xs transition-colors ${
          isSelected
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
        }`}
        style={{ width: "calc(100% - 8px)" }}
      >
        {/* Colored notebook icon */}
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[9px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {notebook.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="flex-1 truncate text-left">{notebook.displayName}</span>
        {isSelected ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Section tree expands inline under the notebook */}
      {isSelected && (
        <div className="mb-1">
          <SectionList notebookColor={color} />
        </div>
      )}
    </div>
  );
}
