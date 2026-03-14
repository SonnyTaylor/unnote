import { useQuery } from "@tanstack/react-query";
import { graphClient, type Section, type SectionGroup } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

const SECTION_COLORS = [
  "#4F6BED",
  "#CA5010",
  "#8764B8",
  "#038387",
  "#C19C00",
  "#10893E",
  "#DA3B01",
  "#E3008C",
  "#0078D4",
  "#7B2D8B",
];

function getSectionColor(index: number) {
  return SECTION_COLORS[index % SECTION_COLORS.length];
}

export function SectionList({ notebookColor: _notebookColor }: { notebookColor?: string }) {
  const { selectedNotebook, selectedSection, setSelectedSection, setSelectedSectionGroup } =
    useAppStore();

  const groupId = (selectedNotebook as any)?.groupId as string | undefined;

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
      <div className="flex items-center justify-center py-3">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="ml-3 border-l border-sidebar-border pl-1 pt-0.5">
      {sectionGroups?.map((sg, i) => (
        <SectionGroupItem
          key={sg.id}
          sectionGroup={sg}
          groupId={groupId}
          selectedSectionId={selectedSection?.id ?? null}
          colorIndex={i}
          onSelectSection={(section) => {
            setSelectedSectionGroup(sg);
            setSelectedSection(groupId ? { ...section, groupId } : section);
          }}
        />
      ))}

      {topSections?.map((section, i) => (
        <button
          key={section.id}
          onClick={() => {
            setSelectedSectionGroup(null);
            setSelectedSection(section);
          }}
          className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
            selectedSection?.id === section.id
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60"
          }`}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: getSectionColor(i) }}
          />
          <span className="truncate">{section.displayName}</span>
        </button>
      ))}
    </div>
  );
}

function SectionGroupItem({
  sectionGroup,
  groupId,
  selectedSectionId,
  colorIndex,
  onSelectSection,
}: {
  sectionGroup: SectionGroup;
  groupId?: string;
  selectedSectionId: string | null;
  colorIndex: number;
  onSelectSection: (section: Section) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: sections, isLoading } = useQuery({
    queryKey: ["sg-sections", sectionGroup.id, groupId],
    queryFn: async () => {
      if (groupId) {
        const res = await graphClient.getGroupSectionGroupSections(groupId, sectionGroup.id);
        return res.value;
      }
      const res = await graphClient.getSectionGroupSections(sectionGroup.id);
      return res.value;
    },
    enabled: expanded,
  });

  const displayName = sectionGroup.displayName.replace(/^_/, "");

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate font-medium">{displayName}</span>
      </button>

      {expanded && (
        <div className="ml-3 border-l border-sidebar-border pl-1">
          {isLoading ? (
            <div className="flex items-center py-1.5 pl-2">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            sections?.map((section, i) => (
              <button
                key={section.id}
                onClick={() => onSelectSection(section)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                  selectedSectionId === section.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{
                    backgroundColor: getSectionColor(colorIndex * 3 + i),
                  }}
                />
                <span className="truncate">{section.displayName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
