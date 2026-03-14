import { useQuery } from "@tanstack/react-query";
import { graphClient, type Section, type SectionGroup } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { PageList } from "./page-list";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export function SectionList() {
  const { selectedNotebook, selectedSection, setSelectedSection, setSelectedSectionGroup } =
    useAppStore();

  const groupId = (selectedNotebook as any)?.groupId as string | undefined;

  // Fetch section groups
  const { data: sectionGroups, isLoading: loadingSG } = useQuery({
    queryKey: ["section-groups", selectedNotebook?.id, groupId],
    queryFn: async () => {
      if (!selectedNotebook) return [];
      if (groupId) {
        const res = await graphClient.getGroupNotebookSectionGroups(
          groupId,
          selectedNotebook.id
        );
        return res.value;
      }
      const res = await graphClient.getNotebookSectionGroups(selectedNotebook.id);
      return res.value;
    },
    enabled: !!selectedNotebook,
  });

  // Fetch top-level sections
  const { data: topSections, isLoading: loadingSections } = useQuery({
    queryKey: ["top-sections", selectedNotebook?.id],
    queryFn: async () => {
      if (!selectedNotebook) return [];
      const res = await graphClient.getNotebookSections(selectedNotebook.id);
      return res.value;
    },
    enabled: !!selectedNotebook && !groupId,
  });

  if (loadingSG || loadingSections) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mt-2 border-t border-sidebar-border pt-2">
      {/* Section Groups */}
      {sectionGroups?.map((sg) => (
        <SectionGroupItem
          key={sg.id}
          sectionGroup={sg}
          groupId={groupId}
          selectedSectionId={selectedSection?.id ?? null}
          onSelectSection={(section) => {
            setSelectedSectionGroup(sg);
            setSelectedSection(groupId ? { ...section, groupId } : section);
          }}
        />
      ))}

      {/* Top-level sections (personal notebooks) */}
      {topSections?.map((section) => (
        <button
          key={section.id}
          onClick={() => {
            setSelectedSectionGroup(null);
            setSelectedSection(section);
          }}
          className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
            selectedSection?.id === section.id
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{section.displayName}</span>
        </button>
      ))}

      {/* Page list for selected section */}
      {selectedSection && <PageList />}
    </div>
  );
}

function SectionGroupItem({
  sectionGroup,
  groupId,
  selectedSectionId,
  onSelectSection,
}: {
  sectionGroup: SectionGroup;
  groupId?: string;
  selectedSectionId: string | null;
  onSelectSection: (section: Section) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: sections, isLoading } = useQuery({
    queryKey: ["sg-sections", sectionGroup.id, groupId],
    queryFn: async () => {
      if (groupId) {
        const res = await graphClient.getGroupSectionGroupSections(
          groupId,
          sectionGroup.id
        );
        return res.value;
      }
      const res = await graphClient.getSectionGroupSections(sectionGroup.id);
      return res.value;
    },
    enabled: expanded,
  });

  // Clean display name (remove leading underscore from _Collaboration Space etc.)
  const displayName = sectionGroup.displayName.replace(/^_/, "");

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        <FolderOpen className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{displayName}</span>
      </button>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center py-2 pl-3">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          ) : (
            sections?.map((section) => (
              <button
                key={section.id}
                onClick={() => onSelectSection(section)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  selectedSectionId === section.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{section.displayName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
