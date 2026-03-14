import { THEMES, type Theme } from "@/lib/themes";
import { useAppStore } from "@/stores/app-store";
import { Check, Sun, Moon, Monitor } from "lucide-react";

const MODE_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

function ThemePreview({ theme, isDark }: { theme: Theme; isDark: boolean }) {
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  return (
    <div
      className="flex gap-1.5 rounded-md p-2"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="h-6 w-6 rounded-full"
        style={{ backgroundColor: colors.primary }}
      />
      <div
        className="h-6 w-6 rounded-full"
        style={{ backgroundColor: colors.accent }}
      />
      <div
        className="h-6 w-6 rounded-full"
        style={{ backgroundColor: colors.secondary }}
      />
      <div
        className="h-6 w-3 rounded-full"
        style={{ backgroundColor: colors["sidebar-background"] }}
      />
    </div>
  );
}

export function ThemePicker() {
  const { currentTheme, themeMode, setTheme, setThemeMode } = useAppStore();
  const previewDark = themeMode === "dark" || (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Mode</p>
        <div className="flex rounded-lg border border-border bg-muted p-1">
          {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setThemeMode(value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                themeMode === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme grid */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-accent/30"
                }`}
              >
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <ThemePreview theme={theme} isDark={previewDark} />
                <p className="mt-2 text-sm font-medium text-foreground">
                  {theme.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
