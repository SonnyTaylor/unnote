import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { FilePlus, Loader2, FileText } from "lucide-react";

// Each indent level = 12px
const INDENT_PX = 12;

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString("en-AU", { weekday: "long" });
  }
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

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

  // Sort by order if available (level/order are not returned by all tenants)
  const sortedPages = pages ? [...pages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

  return (
    <div
      className="surface-glass flex h-full flex-col overflow-hidden border-r border-border/50"
      style={{ width, minWidth: width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3.5">
        <span className="truncate text-[13px] font-semibold text-foreground">
          {selectedSection?.displayName ?? "Pages"}
        </span>
        <button
          disabled
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-muted-foreground opacity-40 cursor-not-allowed"
          title="New page (coming soon)"
        >
          <FilePlus className="h-4 w-4" />
        </button>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto">
        {!selectedSection ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-[12px]">Select a section</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
          </div>
        ) : sortedPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-[12px]">No pages</p>
          </div>
        ) : (
          <div className="py-1 px-1.5">
            {sortedPages.map((page) => {
              const isSelected = selectedPage?.id === page.id;
              const indent = (page.level ?? 0) * INDENT_PX;
              const isSubpage = (page.level ?? 0) > 0;

              return (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(groupId ? { ...page, groupId } : page)}
                  className={`group flex w-full flex-col rounded-lg py-2 pr-3 text-left mb-0.5 ${
                    isSelected
                      ? "bg-primary/12 border-l-[3px] border-l-primary shadow-sm"
                      : "border-l-[3px] border-l-transparent hover:bg-white/40 dark:hover:bg-white/6"
                  }`}
                  style={{ paddingLeft: `${12 + indent}px` }}
                >
                  <div className="flex items-start gap-1.5">
                    {isSubpage && (
                      <span className="mt-0.5 text-[9px] text-muted-foreground shrink-0">›</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13px] leading-snug ${
                          isSelected
                            ? "text-primary font-medium"
                            : isSubpage
                              ? "text-muted-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {page.title || "Untitled"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground/60 mt-0.5">
                        {formatShortDate(page.lastModifiedDateTime)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
