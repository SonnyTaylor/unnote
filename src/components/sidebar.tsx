import { useQuery } from "@tanstack/react-query";
import { graphClient, type Notebook } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { SectionList } from "./section-list";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { msalInstance } from "@/lib/msal";

interface ClassNotebook {
  groupId: string;
  groupName: string;
  notebook: Notebook;
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, selectedNotebook, setSelectedNotebook, setAuth } =
    useAppStore();

  const { data: personalNotebooks, isLoading: loadingPersonal } = useQuery({
    queryKey: ["personal-notebooks"],
    queryFn: async () => {
      const res = await graphClient.getPersonalNotebooks();
      return res.value;
    },
  });

  const { data: classNotebooks, isLoading: loadingClasses } = useQuery({
    queryKey: ["class-notebooks"],
    queryFn: async () => {
      const groups = await graphClient.getUserGroups();
      const classGroups = groups.value.filter(
        (g) =>
          g.creationOptions?.includes("classAssignments") &&
          g.resourceProvisioningOptions?.includes("Team")
      );

      const results: ClassNotebook[] = [];
      for (const group of classGroups) {
        try {
          const notebooks = await graphClient.getGroupNotebooks(group.id);
          for (const nb of notebooks.value) {
            results.push({
              groupId: group.id,
              groupName: group.displayName,
              notebook: nb,
            });
          }
        } catch {
          // Skip groups where notebook access fails
        }
      }
      return results;
    },
  });

  const handleLogout = () => {
    msalInstance.logoutPopup();
    setAuth(false);
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-2 top-2 z-50 rounded-md p-2 hover:bg-accent"
      >
        <PanelLeft className="h-5 w-5" />
      </button>
    );
  }

  const isLoading = loadingPersonal || loadingClasses;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <h2 className="text-lg font-semibold text-sidebar-foreground">UnNote</h2>
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 hover:bg-sidebar-accent"
        >
          <PanelLeftClose className="h-4 w-4 text-sidebar-foreground" />
        </button>
      </div>

      {/* Notebook List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Personal Notebooks */}
            <NotebookGroup
              label="Personal"
              icon={<BookOpen className="h-4 w-4" />}
              notebooks={personalNotebooks ?? []}
              selectedId={selectedNotebook?.id ?? null}
              onSelect={(nb) => setSelectedNotebook(nb)}
            />

            {/* Class Notebooks */}
            <NotebookGroup
              label="Classes"
              icon={<GraduationCap className="h-4 w-4" />}
              notebooks={(classNotebooks ?? []).map((cn) => ({
                ...cn.notebook,
                groupId: cn.groupId,
              }))}
              selectedId={selectedNotebook?.id ?? null}
              onSelect={(nb) => setSelectedNotebook(nb)}
            />
          </>
        )}

        {/* Section list for selected notebook */}
        {selectedNotebook && <SectionList />}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function NotebookGroup({
  label,
  icon,
  notebooks,
  selectedId,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  notebooks: (Notebook & { groupId?: string })[];
  selectedId: string | null;
  onSelect: (nb: Notebook & { groupId?: string }) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (notebooks.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-sidebar-accent"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {icon}
        {label}
      </button>
      {expanded && (
        <div className="ml-2 mt-1 space-y-0.5">
          {notebooks.map((nb) => (
            <button
              key={nb.id}
              onClick={() => onSelect(nb)}
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors ${
                selectedId === nb.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <span className="truncate">{nb.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
