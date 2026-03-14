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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="rounded-md p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
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
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {activeTab === "classes" && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Choose which classes appear in your sidebar. Hidden classes can be shown again anytime.
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                sortedYears.map((year) => (
                  <div key={year} className="mb-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                              hidden
                                ? "text-muted-foreground hover:bg-accent"
                                : "text-foreground bg-accent/50 hover:bg-accent"
                            }`}
                          >
                            {hidden ? (
                              <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 shrink-0 text-primary" />
                            )}
                            <span className={hidden ? "line-through opacity-60" : ""}>
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
        <div className="border-t border-border px-5 py-3">
          <button
            onClick={() => setShowSettings(false)}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
