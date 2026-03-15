import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { X, Eye, EyeOff, Loader2, GraduationCap, Palette } from "lucide-react";
import { useState } from "react";
import { ThemePicker } from "./theme-picker";

interface ClassGroup {
  id: string;
  displayName: string;
}

type Tab = "classes" | "appearance";

export function ClassManager() {
  const { showSettings, setShowSettings, hiddenGroupIds, toggleHiddenGroup } =
    useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>("classes");

  const { data: allClassGroups, isLoading } = useQuery({
    queryKey: ["all-class-groups"],
    queryFn: async () => {
      const groups = await graphClient.getUserGroups();
      return groups.value
        .filter(
          (g) =>
            g.creationOptions?.includes("classAssignments") &&
            g.resourceProvisioningOptions?.includes("Team")
        )
        .map((g) => ({ id: g.id, displayName: g.displayName }))
        .sort((a, b) => b.displayName.localeCompare(a.displayName));
    },
    enabled: showSettings,
  });

  if (!showSettings) return null;

  // Group by year extracted from displayName
  const groupedByYear = new Map<string, ClassGroup[]>();
  for (const group of allClassGroups ?? []) {
    const yearMatch = group.displayName.match(/(20\d{2})/);
    const year = yearMatch?.[1] ?? "Other";
    if (!groupedByYear.has(year)) groupedByYear.set(year, []);
    groupedByYear.get(year)!.push(group);
  }

  // Sort years descending
  const sortedYears = [...groupedByYear.keys()].sort((a, b) => b.localeCompare(a));

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "classes", label: "Classes", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="surface-glass surface-sheen mx-4 w-full max-w-md rounded-2xl border border-border/50 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h2 className="text-[15px] font-semibold tracking-tight">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="rounded-lg p-1.5 hover:bg-white/20 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/40 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-medium ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {activeTab === "classes" && (
            <>
              <p className="mb-4 text-[13px] text-muted-foreground leading-relaxed">
                Choose which classes appear in your sidebar. Hidden classes can be shown again anytime.
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
                </div>
              ) : (
                sortedYears.map((year) => (
                  <div key={year} className="mb-5">
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {year}
                    </h3>
                    <div className="space-y-1">
                      {groupedByYear.get(year)!.map((group) => {
                        const hidden = hiddenGroupIds.has(group.id);
                        const cleanName = group.displayName
                          .replace(/^BBB\s+/, "")
                          .replace(/\s*\d{4}$/, "")
                          .trim();

                        return (
                          <button
                            key={group.id}
                            onClick={() => toggleHiddenGroup(group.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] ${
                              hidden
                                ? "text-muted-foreground hover:bg-white/15 dark:hover:bg-white/6"
                                : "text-foreground bg-white/30 dark:bg-white/8 hover:bg-white/40 dark:hover:bg-white/12 shadow-sm"
                            }`}
                          >
                            {hidden ? (
                              <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                            ) : (
                              <Eye className="h-4 w-4 shrink-0 text-primary" />
                            )}
                            <span className={hidden ? "line-through opacity-50" : ""}>
                              {cleanName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "appearance" && <ThemePicker />}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 px-6 py-4">
          <button
            onClick={() => setShowSettings(false)}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
