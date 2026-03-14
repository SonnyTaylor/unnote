import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { File, Loader2 } from "lucide-react";

export function PageList() {
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

  if (isLoading) {
    return (
      <div className="flex items-center py-2 pl-6">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <p className="py-2 pl-6 text-xs text-muted-foreground">No pages</p>
    );
  }

  return (
    <div className="ml-6 mt-1 space-y-0.5 border-l border-sidebar-border pl-2">
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() =>
            setSelectedPage(groupId ? { ...page, groupId } : page)
          }
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors ${
            selectedPage?.id === page.id
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <File className="h-3 w-3 shrink-0" />
          <span className="truncate">{page.title || "Untitled"}</span>
        </button>
      ))}
    </div>
  );
}
