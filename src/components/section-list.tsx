import { useQuery } from "@tanstack/react-query";
import { graphClient, queryKeys, type Section, type SectionGroup, type WithGroupId } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { ChevronDown, Loader2 } from "lucide-react";
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

export function SectionList({ notebookColor: _notebookColor }: { notebookColor?: string }) {
  const { selectedNotebook, selectedSection, setSelectedSection, setSelectedSectionGroup, animationsEnabled } =
    useAppStore();

  const groupId = selectedNotebook?.groupId;

  const { data: sectionGroups, isLoading: loadingSG } = useQuery({
    queryKey: queryKeys.sectionGroups(selectedNotebook?.id ?? "", groupId),
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
    queryKey: queryKeys.topSections(selectedNotebook?.id ?? ""),
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
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className="ml-4 border-l-2 border-sidebar-border/60 pl-0 pt-0.5"
      style={{
        animation: animationsEnabled ? "fadeSlideIn 200ms ease-out" : "none",
      }}
    >
      {sectionGroups?.map((sg, i) => (
        <SectionGroupItem
          key={sg.id}
          sectionGroup={sg}
          groupId={groupId}
          selectedSectionId={selectedSection?.id ?? null}
          colorIndex={i}
          animate={animationsEnabled}
          onSelectSection={(section) => {
            setSelectedSectionGroup(sg);
            const withGroup: WithGroupId<Section> = groupId ? { ...section, groupId } : section;
            setSelectedSection(withGroup);
          }}
        />
      ))}

      {topSections?.map((section, i) => (
        <SectionButton
          key={section.id}
          section={section}
          color={getSectionColor(i)}
          isSelected={selectedSection?.id === section.id}
          onSelect={() => {
            setSelectedSectionGroup(null);
            setSelectedSection(section);
          }}
        />
      ))}
    </div>
  );
}

function SectionButton({
  section,
  color,
  isSelected,
  onSelect,
}: {
  section: Section;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-[5px] text-[12px] ${
        isSelected
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60"
      }`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: isSelected ? "currentColor" : color }}
      />
      <span className="truncate">{section.displayName}</span>
    </button>
  );
}

function SectionGroupItem({
  sectionGroup,
  groupId,
  selectedSectionId,
  colorIndex,
  animate,
  onSelectSection,
}: {
  sectionGroup: SectionGroup;
  groupId?: string;
  selectedSectionId: string | null;
  colorIndex: number;
  animate: boolean;
  onSelectSection: (section: Section) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: sections, isLoading } = useQuery({
    queryKey: queryKeys.sgSections(sectionGroup.id, groupId),
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
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-[5px] text-[12px] text-sidebar-foreground/75 hover:bg-sidebar-accent/60"
      >
        <ChevronDown
          className="h-3 w-3 shrink-0 text-muted-foreground"
          style={{
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: animate ? "transform 200ms ease-out" : "none",
          }}
        />
        <span className="truncate font-medium">{displayName}</span>
      </button>

      <AnimatedExpand open={expanded} animate={animate}>
        <div className="ml-3 border-l-2 border-sidebar-border/40 pl-0">
          {isLoading ? (
            <div className="flex items-center py-2 pl-3">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          ) : (
            sections?.map((section, i) => (
              <SectionButton
                key={section.id}
                section={section}
                color={getSectionColor(colorIndex * 3 + i)}
                isSelected={selectedSectionId === section.id}
                onSelect={() => onSelectSection(section)}
              />
            ))
          )}
        </div>
      </AnimatedExpand>
    </div>
  );
}
