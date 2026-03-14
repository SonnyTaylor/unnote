import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { FilePlus, Loader2 } from "lucide-react";

// Each indent level = 12px
const INDENT_PX = 12;

export function PagePanel({ width }: { width: number }) {
  const { selectedSection, selectedPage, setSelectedPage } = useAppStore();

  const groupId = (selectedSection as any)?.groupId as string | undefined;

  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages", selectedSection?.id, groupId],
    queryFn: async () => {
      if (!selectedSection) return [];
      if (groupId) {
        const res = await graphClient.getGroupSectionPages(groupId, selectedSection.id);
        return res.value;
      }
      const res = await graphClient.getSectionPages(selectedSection.id);
      return res.value;
    },
    enabled: !!selectedSection,
  });

  // Sort by order (API returns them ordered, but be explicit)
  const sortedPages = pages ? [...pages].sort((a, b) => a.order - b.order) : [];

  return (
    <div
      className="flex h-full flex-col border-r border-sidebar-border bg-sidebar-background overflow-hidden"
      style={{ width, minWidth: width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2.5">
        <span className="truncate text-xs font-semibold text-sidebar-foreground">
          {selectedSection?.displayName ?? "Pages"}
        </span>
        <button
          disabled
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-muted-foreground opacity-50 cursor-not-allowed"
          title="New page (coming soon)"
        >
          <FilePlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto py-1">
        {!selectedSection ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            Select a section
          </p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : sortedPages.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">No pages</p>
        ) : (
          sortedPages.map((page) => {
            const isSelected = selectedPage?.id === page.id;
            const indent = (page.level ?? 0) * INDENT_PX;
            const isSubpage = (page.level ?? 0) > 0;

            return (
              <button
                key={page.id}
                onClick={() => setSelectedPage(groupId ? { ...page, groupId } : page)}
                className={`flex w-full items-start py-1.5 pr-3 text-xs transition-colors ${
                  isSelected
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
                style={{ paddingLeft: `${12 + indent}px` }}
              >
                {isSubpage && (
                  <span
                    className={`mr-1.5 mt-px shrink-0 text-[8px] ${
                      isSelected ? "opacity-70" : "text-muted-foreground"
                    }`}
                  >
                    ›
                  </span>
                )}
                <span
                  className={`truncate text-left leading-snug ${
                    isSubpage && !isSelected ? "text-muted-foreground" : ""
                  }`}
                >
                  {page.title || "Untitled"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
